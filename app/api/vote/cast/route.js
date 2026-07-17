import { supabaseAdmin } from '@/lib/supabaseServer';
import { verifyVoteToken } from '@/lib/voteToken';
import { makeReceiptCode } from '@/lib/receipt';
import { getActiveElection, isVotingOpen } from '@/lib/election';
import { logAudit, clientIp } from '@/lib/audit';
import { ok, fail, readJson } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const sb = supabaseAdmin();
  const { vote_token, candidate_id } = await readJson(req);
  const ip = clientIp(req);

  const claim = verifyVoteToken(vote_token);
  if (!claim) return fail('INVALID_SESSION', 401, { message: 'Your voting session has expired. Please verify your number again.' });
  const { election_id, member_id } = claim;
  if (!candidate_id) return fail('NO_CANDIDATE', 400, { message: 'Please select a candidate.' });

  // Re-validate election window
  const { data: election } = await sb.from('elections').select('*').eq('id', election_id).maybeSingle();
  if (!isVotingOpen(election)) return fail('NOT_ACTIVE', 403, { message: 'Voting is not currently open for this election.' });

  // Validate candidate belongs to this election and is active
  const { data: cand } = await sb.from('candidates').select('id, position_id, status')
    .eq('id', candidate_id).eq('election_id', election_id).maybeSingle();
  if (!cand || cand.status !== 'Active') return fail('BAD_CANDIDATE', 400, { message: 'Invalid candidate selection.' });

  // Insert vote — unique(election_id, member_id) enforces one vote per member.
  const { error: insErr } = await sb.from('votes').insert({
    election_id, member_id, candidate_id, position_id: cand.position_id,
  });
  if (insErr) {
    if (insErr.code === '23505') { // unique violation → already voted
      await logAudit({ action: 'DUPLICATE_VOTE_ATTEMPT', actor: 'member', details: member_id, election_id, ip });
      return fail('ALREADY_VOTED', 409, { message: 'You have already cast your vote. Duplicate voting is not allowed.' });
    }
    return fail('VOTE_FAILED', 500, { message: 'Could not record your vote. Please try again.' });
  }

  // Receipt + convenience flag
  const receipt_code = makeReceiptCode();
  await sb.from('vote_receipts').insert({ election_id, member_id, receipt_code });
  await sb.from('members').update({ voting_status: 'Voted', updated_at: new Date().toISOString() }).eq('id', member_id);
  await logAudit({ action: 'VOTE_SUBMITTED', actor: 'member', details: `receipt ${receipt_code}`, election_id, ip });

  return ok({ receipt_code, message: 'Your vote has been submitted successfully.' });
}
