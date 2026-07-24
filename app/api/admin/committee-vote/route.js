import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireSuperAdmin } from '@/lib/guard';
import { getActiveElection, isVotingOpen } from '@/lib/election';
import { makeReceiptCode } from '@/lib/receipt';
import { logAudit, clientIp } from '@/lib/audit';
import { ok, fail, readJson } from '@/lib/api';
export const dynamic = 'force-dynamic';

// GET → data for the committee-entry form: election, positions, candidates, remaining eligible voters.
export async function GET(req) {
  const { res } = requireSuperAdmin(req); if (res) return res;
  const sb = supabaseAdmin();
  const e = await getActiveElection();
  if (!e) return ok({ election: null, positions: [], candidates: [], remaining: [] });

  const { data: positions } = await sb.from('positions').select('*').eq('election_id', e.id).order('sort_order');
  const { data: candidates } = await sb.from('candidates').select('id, name, symbol, position_id, status').eq('election_id', e.id).eq('status', 'Active').order('sort_order');
  const { data: appr } = await sb.from('members').select('id, full_name, mobile').eq('status', 'Approved');
  const locked = (appr || []).map(m => ({ member_id: m.id, full_name: m.full_name, mobile: m.mobile }));
  const { data: voted } = await sb.from('votes').select('member_id').eq('election_id', e.id);
  const votedSet = new Set((voted || []).map(v => v.member_id));
  const remaining = (locked || []).filter(m => !votedSet.has(m.member_id))
    .map(m => ({ id: m.member_id, full_name: m.full_name, mobile: m.mobile }));

  return ok({
    election: { id: e.id, title: e.title, status: e.status, voting_open: isVotingOpen(e), voter_list_locked: e.voter_list_locked },
    positions: positions || [], candidates: candidates || [], remaining,
  });
}

// POST → record ONE real ballot for a remaining eligible voter (Select Voter → Position → Candidate → Confirm).
export async function POST(req) {
  const { admin, res } = requireSuperAdmin(req); if (res) return res;
  const sb = supabaseAdmin();
  const { member_id, candidate_id } = await readJson(req);
  const ip = clientIp(req);
  if (!member_id || !candidate_id) return fail('MISSING', 400, { message: 'Select a voter and a candidate.' });

  const e = await getActiveElection();
  if (!e) return fail('NO_ELECTION', 400, { message: 'No election available.' });
  if (!isVotingOpen(e)) return fail('NOT_ACTIVE', 403, { message: 'Election is not currently active.' });

  // Voter must be approved and active.
  const { data: member } = await sb.from('members').select('id, status').eq('id', member_id).maybeSingle();
  if (!member) return fail('NO_VOTER', 404, { message: 'Voter not found.' });
  if (member.status !== 'Approved') return fail('NOT_ELIGIBLE', 403, { message: 'Voter is not approved/eligible.' });

  // Candidate must belong to this election and be active.
  const { data: cand } = await sb.from('candidates').select('id, position_id, status').eq('id', candidate_id).eq('election_id', e.id).maybeSingle();
  if (!cand || cand.status !== 'Active') return fail('BAD_CANDIDATE', 400, { message: 'Invalid candidate.' });
  if (!cand.position_id) return fail('BAD_CANDIDATE', 400, { message: 'That candidate is not assigned to a position.' });

  // One vote per voter PER POSITION — the same voter may still vote for other positions.
  const { data: already } = await sb.from('votes').select('id')
    .eq('election_id', e.id).eq('member_id', member_id).eq('position_id', cand.position_id).limit(1);
  if (already && already.length)
    return fail('ALREADY_VOTED', 409, { message: 'This voter has already voted for that position.' });

  // Insert the real ballot. Unique(election, member, position) enforces one vote per position.
  const { error: insErr } = await sb.from('votes').insert({ election_id: e.id, member_id, candidate_id, position_id: cand.position_id });
  if (insErr) {
    if (insErr.code === '23505') return fail('ALREADY_VOTED', 409, { message: 'This voter has already voted for that position.' });
    return fail('VOTE_FAILED', 500, { message: 'Could not record the ballot.' });
  }
  const receipt_code = makeReceiptCode();
  await sb.from('vote_receipts').insert({ election_id: e.id, member_id, receipt_code });
  await sb.from('members').update({ voting_status: 'Voted', updated_at: new Date().toISOString() }).eq('id', member_id);
  // Protected super-admin-only record of who entered it.
  await sb.from('committee_vote_entries').insert({ election_id: e.id, member_id, candidate_id, position_id: cand.position_id, entered_by: admin.username });
  // Protected audit action (hidden from normal admins in the logs API).
  await logAudit({ action: 'COMMITTEE_VOTE_ENTRY', actor: admin.username, details: `voter ${member_id} · receipt ${receipt_code}`, election_id: e.id, ip });

  return ok({ receipt_code, message: 'Vote entry recorded.' });
}
