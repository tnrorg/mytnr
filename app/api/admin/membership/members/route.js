import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/guard';
import { ok, fail } from '@/lib/api';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { res } = requireAdmin(req); if (res) return res;
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || '';
  const search = (url.searchParams.get('search') || '').trim();

  let q = supabaseAdmin().from('membership_members').select('*')
    .is('deleted_at', null).order('created_at', { ascending: false }).limit(1000);
  if (status) q = q.eq('status', status);
  if (search) q = q.or(
    `full_name.ilike.%${search}%,email.ilike.%${search}%,membership_id.ilike.%${search}%,village.ilike.%${search}%`
  );
  const { data, error } = await q;
  // Surface the failure rather than returning an empty list, which reads as
  // "nothing here" and hides the real problem.
  if (error) return fail('READ_FAILED', 500, { message: error.message });
  const members = (data || []).map(({ password_hash, invite_token, ...m }) => m);
  return ok({ members });
}
