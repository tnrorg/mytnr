import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/guard';
import { ok } from '@/lib/api';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { res } = requireAdmin(req); if (res) return res;
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || '';
  const search = (url.searchParams.get('search') || '').trim();

  let q = supabaseAdmin().from('membership_applications').select('*')
    .order('created_at', { ascending: false }).limit(500);
  if (status) q = q.eq('status', status);
  if (search) q = q.or(
    `full_name.ilike.%${search}%,email.ilike.%${search}%,mobile.ilike.%${search}%,reference_no.ilike.%${search}%`
  );
  const { data } = await q;
  return ok({ applications: data || [] });
}
