import { supabaseAdmin } from './supabaseServer';

// Returns the election to vote in: the Active one, else most recent.
export async function getActiveElection() {
  const sb = supabaseAdmin();
  let { data } = await sb.from('elections').select('*').eq('status', 'Active')
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (data) return data;
  ({ data } = await sb.from('elections').select('*')
    .order('created_at', { ascending: false }).limit(1).maybeSingle());
  return data || null;
}
export function isVotingOpen(e) {
  if (!e || e.status !== 'Active') return false;
  const now = Date.now();
  if (e.starts_at && now < new Date(e.starts_at).getTime()) return false;
  if (e.ends_at && now > new Date(e.ends_at).getTime()) return false;
  return true;
}
export async function getSettings(electionId) {
  const sb = supabaseAdmin();
  const { data } = await sb.from('result_settings').select('*').eq('election_id', electionId).maybeSingle();
  return data || { hide_results_during: true, show_participation_only: true, show_full_after_end: true, admin_live_preview: true, result_mode: 'after_close' };
}
