import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireAdmin, isSuperAdmin } from '@/lib/guard';
import { ok } from '@/lib/api';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const { admin, res } = requireAdmin(req); if (res) return res;
  const sb = supabaseAdmin();
  const url = new URL(req.url);
  const action = url.searchParams.get('action') || '';
  let q = sb.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(500);
  if (!isSuperAdmin(admin)) q = q.neq('action', 'COMMITTEE_VOTE_ENTRY');
  if (action) q = q.eq('action', action);
  const { data } = await q;
  return ok({ logs: data || [] });
}
