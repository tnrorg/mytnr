import { supabaseAdmin } from '@/lib/supabaseServer';
import { ok, fail } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Full professional profile for one Advisory Council member.
//
// Two privacy rules are enforced here rather than in the UI, so they hold even
// if someone calls the endpoint directly:
//   1. Email and mobile are only included when the member has switched the
//      matching visibility flag on. Otherwise the keys are absent entirely —
//      no "hidden" placeholder that hints a value exists.
//   2. Child records are only returned once an admin has approved them.
const CHILD_TABLES = [
  ['education',      'council_education',      'sort_order,start_year'],
  ['experience',     'council_experience',     'sort_order,start_year'],
  ['publications',   'council_publications',   'sort_order,year'],
  ['certifications', 'council_certifications', 'sort_order,issue_date'],
  ['awards',         'council_awards',         'sort_order,year'],
  ['projects',       'council_projects',       'sort_order,start_year'],
  ['gallery',        'council_gallery',        'sort_order,taken_on'],
];

export async function GET(_req, { params }) {
  const sb = supabaseAdmin();

  const { data: p, error } = await sb.from('leadership_profiles')
    .select('*')
    .eq('slug', params.slug)
    .eq('body', 'advisory')
    .eq('active', true)
    .maybeSingle();

  if (error) return fail('LOOKUP_FAILED', 500, { message: 'Profile unavailable.' });
  if (!p) return fail('NOT_FOUND', 404, { message: 'This profile is not available.' });

  // Build the public shape explicitly. An allow-list means a column added to
  // the table later cannot leak onto the public profile by accident.
  const profile = {
    slug: p.slug, name: p.name, designation: p.designation,
    qualification: p.qualification, field: p.field, affiliation: p.affiliation,
    profession: p.profession, organisation: p.organisation, country: p.country,
    tagline: p.tagline, intro: p.intro, bio: p.bio, summary: p.summary,
    expertise: p.expertise || [], skills: p.skills || [],
    research_areas: p.research_areas || [], duties: p.duties || [],
    photo_url: p.photo_url, verified: !!p.verified,
    accepts_guidance: !!p.accepts_guidance,
    cv_url: p.cv_approved ? p.cv_url : null,
  };
  if (p.show_email && p.email) profile.email = p.email;
  if (p.show_mobile && p.mobile) profile.mobile = p.mobile;

  // Child tables also arrive with the portal migration. A missing table must
  // degrade to an empty section, not a broken profile page.
  const sections = {};
  await Promise.all(CHILD_TABLES.map(async ([key, table, order]) => {
    const [primary, secondary] = order.split(',');
    let q = sb.from(table).select('*').eq('profile_id', p.id).eq('approved', true)
      .order(primary, { ascending: true });
    if (secondary) q = q.order(secondary, { ascending: false });
    const { data, error } = await q;
    sections[key] = error ? [] : (data || []).map(({ profile_id, approved, ...rest }) => rest);
  }));

  return ok({ profile, sections });
}
