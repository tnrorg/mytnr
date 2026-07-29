import { supabaseAdmin } from '@/lib/supabaseServer';
import { ok } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Public directory — ONLY approved/active members who opted in to public
// visibility. Contact details are never selected, so they cannot leak.
export async function GET(req) {
  const url = new URL(req.url);
  const search = (url.searchParams.get('search') || '').trim();
  const uc = url.searchParams.get('union_council') || '';
  const profession = url.searchParams.get('profession') || '';

  let q = supabaseAdmin().from('membership_members')
    .select('membership_id, full_name, photo_url, village, union_council, current_position, education_level, category_id')
    .eq('public_visible', true)
    .in('status', ['approved', 'active'])
    .is('deleted_at', null)
    .order('full_name')
    .limit(500);

  if (uc) q = q.eq('union_council', uc);
  if (profession) q = q.eq('current_position', profession);
  if (search) q = q.or(`full_name.ilike.%${search}%,village.ilike.%${search}%,current_position.ilike.%${search}%`);

  const { data } = await q;
  const rows = data || [];

  const { data: cats } = await supabaseAdmin().from('membership_categories').select('id, name');
  const cmap = Object.fromEntries((cats || []).map(c => [c.id, c.name]));

  return ok({
    members: rows.map(({ category_id, ...m }) => ({ ...m, category: cmap[category_id] || null })),
    total: rows.length,
    union_councils: [...new Set(rows.map(m => m.union_council).filter(Boolean))].sort(),
    professions: [...new Set(rows.map(m => m.current_position).filter(Boolean))].sort(),
  });
}
