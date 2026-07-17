import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/guard';
import { getActiveElection } from '@/lib/election';
import { ok } from '@/lib/api';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const { res } = requireAdmin(req); if (res) return res;
  const sb = supabaseAdmin();
  const url = new URL(req.url);
  let election_id = url.searchParams.get('election_id');
  if (!election_id) { const e = await getActiveElection(); election_id = e?.id; }
  if (!election_id) return ok({ voted: [], not_voted: [] });

  const { data: locked } = await sb.from('locked_voter_list').select('member_id, full_name, mobile, union_id').eq('election_id', election_id);
  const { data: votes } = await sb.from('votes').select('member_id, created_at').eq('election_id', election_id);
  const votedMap = Object.fromEntries((votes || []).map(v => [v.member_id, v.created_at]));
  const voted = [], not_voted = [];
  for (const m of locked || []) {
    // NOTE: we expose WHO voted and WHEN, never WHICH candidate — vote privacy preserved.
    if (votedMap[m.member_id]) voted.push({ ...m, voted_at: votedMap[m.member_id] });
    else not_voted.push(m);
  }
  return ok({ voted, not_voted, total: (locked || []).length, voted_count: voted.length });
}
