import { supabaseAdmin } from '@/lib/supabaseServer';
import { ok, fail } from '@/lib/api';
import { ACTIVE_STATUSES } from '@/lib/membershipStats';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Same allow-list as the directory. Contact details, CNIC, address, DOB,
// application answers and admin notes are never selected.
const PUBLIC_FIELDS =
  'membership_id, full_name, photo_url, village, union_council, current_position, ' +
  'education_level, contribution_areas, category_id';

export async function GET(_req, { params }) {
  const { data, error } = await supabaseAdmin().from('membership_members')
    .select(PUBLIC_FIELDS)
    .eq('membership_id', params.id)
    .not('public_visible', 'is', false)
    .in('status', ACTIVE_STATUSES)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) return fail('LOOKUP_FAILED', 500, { message: 'Profile unavailable' });
  if (!data) return fail('NOT_FOUND', 404, { message: 'This profile is not public.' });

  const { data: cat } = await supabaseAdmin().from('membership_categories')
    .select('name').eq('id', data.category_id).maybeSingle();
  const { category_id, ...m } = data;
  return ok({ member: { ...m, category: cat?.name || null } });
}
