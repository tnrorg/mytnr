import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireSuperAdmin } from '@/lib/guard';
import { getActiveElection } from '@/lib/election';
import { ok } from '@/lib/api';

export const dynamic = 'force-dynamic';

// SUPER ADMIN ONLY — full details of every member who has cast a ballot.
// Ballot secrecy: shows WHO voted and WHEN, never WHICH candidate.
export async function GET(req) {
  const { res } = requireSuperAdmin(req); if (res) return res;
  const sb = supabaseAdmin();
  const url = new URL(req.url);
  let election_id = url.searchParams.get('election_id');
  if (!election_id) { const e = await getActiveElection(); election_id = e?.id; }
  if (!election_id) return ok({ voters: [], total: 0 });

  const { data: votes } = await sb.from('votes')
    .select('member_id, position_id, created_at').eq('election_id', election_id);

  // first vote time + positions completed, per member
  const byMember = {};
  for (const v of votes || []) {
    const m = byMember[v.member_id] || (byMember[v.member_id] = { positions: 0, at: v.created_at });
    m.positions += 1;
    if (v.created_at < m.at) m.at = v.created_at;
  }
  const ids = Object.keys(byMember);
  if (!ids.length) return ok({ voters: [], total: 0 });

  const { data: members } = await sb.from('members')
    .select('id, member_code, full_name, gender, email, mobile, village, union_id, status, created_at')
    .in('id', ids);
  const { data: unions } = await sb.from('unions').select('id, union_name');
  const umap = Object.fromEntries((unions || []).map(u => [u.id, u.union_name]));
  const { data: receipts } = await sb.from('vote_receipts')
    .select('member_id, receipt_code, created_at').eq('election_id', election_id);
  const rmap = Object.fromEntries((receipts || []).map(r => [r.member_id, r.receipt_code]));

  const voters = (members || []).map(m => ({
    member_code: m.member_code, full_name: m.full_name, gender: m.gender,
    email: m.email, mobile: m.mobile, village: m.village,
    union_name: umap[m.union_id] || null, status: m.status,
    voted_at: byMember[m.id]?.at || null,
    positions_voted: byMember[m.id]?.positions || 0,
    receipt_code: rmap[m.id] || null,
  })).sort((a, b) => new Date(b.voted_at) - new Date(a.voted_at));

  return ok({ voters, total: voters.length });
}
