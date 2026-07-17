import { supabaseAdmin } from './supabaseServer';

// Returns the election to vote in: the Active one, else most recent.
export async function getActiveElection() {
  const sb = supabaseAdmin();
  // Public priority: a live election first, then paused, then a finished one (to show results).
  for (const status of ['Active', 'Paused', 'Ended']) {
    const { data } = await sb.from('elections').select('*').eq('status', status)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (data) return data;
  }
  // Fallback: most recent (may be Draft) so admins can preview before starting.
  const { data } = await sb.from('elections').select('*')
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
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
