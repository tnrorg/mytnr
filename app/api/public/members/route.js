import { supabaseAdmin } from '@/lib/supabaseServer';
import { ok } from '@/lib/api';
import { ACTIVE_STATUSES } from '@/lib/membershipStats';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Public directory — ONLY approved/active members who opted in to public
// visibility. Contact details, CNIC, address, DOB and application answers are
// never selected, so they cannot leak through this endpoint.
// Members who keep their profile private still count toward the totals in
// /api/public/member-stats; they simply have no card here.
const PUBLIC_FIELDS =
  'membership_id, full_name, photo_url, village, union_council, current_position, ' +
  'education_level, contribution_areas, category_id';

export async function GET(req) {
  const url = new URL(req.url);
  const p = (k) => (url.searchParams.get(k) || '').trim();
  const search = p('search'), uc = p('union_council'), profession = p('profession');
  const village = p('village'), education = p('education'), category = p('category');
  const contribution = p('contribution');

  let q = supabaseAdmin().from('membership_members')
    .select(PUBLIC_FIELDS)
    .eq('public_visible', true)
    .in('status', ACTIVE_STATUSES)
    .is('deleted_at', null)
    .order('full_name')
    .limit(1000);

  if (uc) q = q.eq('union_council', uc);
  if (profession) q = q.eq('current_position', profession);
  if (village) q = q.eq('village', village);
  if (education) q = q.eq('education_level', education);
  if (contribution) q = q.contains('contribution_areas', [contribution]);
  if (search) q = q.or(
    `full_name.ilike.%${search}%,village.ilike.%${search}%,current_position.ilike.%${search}%`);

  const { data, error } = await q;
  if (error) return ok({ members: [], total: 0, error: 'Directory unavailable' });
  let rows = data || [];

  const { data: cats } = await supabaseAdmin().from('membership_categories').select('id, name');
  const cmap = Object.fromEntries((cats || []).map(c => [c.id, c.name]));

  let members = rows.map(({ category_id, ...m }) => ({ ...m, category: cmap[category_id] || null }));
  if (category) members = members.filter(m => m.category === category);

  // Filter options come from the whole public roster, not the filtered result,
  // so the dropdowns do not collapse as the visitor narrows their search.
  const { data: allRows } = await supabaseAdmin().from('membership_members')
    .select(PUBLIC_FIELDS)
    .eq('public_visible', true)
    .in('status', ACTIVE_STATUSES)
    .is('deleted_at', null)
    .limit(2000);
  const all = (allRows || []).map(({ category_id, ...m }) => ({ ...m, category: cmap[category_id] || null }));

  const uniq = (fn) => [...new Set(all.flatMap(fn).filter(Boolean))].sort();
  return ok({
    members,
    total: members.length,
    directoryTotal: all.length,
    union_councils: uniq(m => [m.union_council]),
    professions:    uniq(m => [m.current_position]),
    villages:       uniq(m => [m.village]),
    educations:     uniq(m => [m.education_level]),
    categories:     uniq(m => [m.category]),
    contributions:  uniq(m => m.contribution_areas || []),
  });
}
