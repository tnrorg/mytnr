import { supabaseAdmin } from '@/lib/supabaseServer';

// ── Centralised membership statistics ───────────────────────────────────────
// The single source of truth for every public member number on the site.
// Nothing here touches the election tables (voters, candidates, votes,
// results) — membership analytics are computed only from membership_members.
//
// An "active member" is a non-deleted row whose status is approved or active.
// Suspended, inactive, rejected, pending and expired rows are excluded, and
// each member is counted once via their unique membership_id.

export const ACTIVE_STATUSES = ['approved', 'active'];

const TOP_N = 10;          // villages charted and ranked individually
const PAGE = 1000;         // Supabase caps a single select; page through it

/** Every active member's demographic slice, de-duplicated by membership_id. */
async function activeMembers() {
  const seen = new Map();
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabaseAdmin()
      .from('membership_members')
      .select('membership_id, village, union_council, current_position, education_level')
      .in('status', ACTIVE_STATUSES)
      .is('deleted_at', null)
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    for (const r of data || []) if (r.membership_id) seen.set(r.membership_id, r);
    if (!data || data.length < PAGE) break;
  }
  return [...seen.values()];
}

export async function getMembershipStats() {
  const members = await activeMembers();
  const villages = members.map(m => m.village);
  const total = members.length;

  // Group by village. Blank/missing areas are tracked separately so they are
  // never silently folded into a real village's count.
  //
  // Grouping is case-insensitive: "HARDASS" and "Hardass" are one village, and
  // counting them separately would split it across two slices of the chart.
  // The first spelling seen is used as the display label.
  const counts = new Map();
  const labels = new Map();
  let unassigned = 0;
  for (const raw of villages) {
    const v = (raw || '').trim();
    if (!v) { unassigned++; continue; }
    const k = v.toLowerCase();
    if (!labels.has(k)) labels.set(k, v);
    counts.set(k, (counts.get(k) || 0) + 1);
  }

  const pct = (n) => total ? Math.round((n / total) * 1000) / 10 : 0;
  const ranked = [...counts.entries()]
    .map(([k, members]) => ({ area: labels.get(k) || k, members, percent: pct(members) }))
    .sort((a, b) => b.members - a.members || a.area.localeCompare(b.area))
    .map((r, i) => ({ rank: i + 1, ...r }));

  const top = ranked.slice(0, TOP_N);
  const rest = ranked.slice(TOP_N);
  const otherTotal = rest.reduce((s, r) => s + r.members, 0) + unassigned;

  // Chart segments: the top villages, plus one combined "Other Areas" slice.
  const segments = top.map(r => ({ name: r.area, members: r.members, percent: r.percent }));
  if (otherTotal > 0) {
    segments.push({
      name: 'Other Areas', members: otherTotal, percent: pct(otherTotal),
      isOther: true, count: rest.length + (unassigned ? 1 : 0),
    });
  }

  // Integrity check — the slices must add up to the total exactly, or the
  // public page shows a notice instead of numbers that do not reconcile.
  const charted = segments.reduce((s, r) => s + r.members, 0);
  const balanced = charted === total;

  // Community-level counts for the homepage. Every figure is derived from the
  // same de-duplicated active set, so the homepage and the members page can
  // never disagree. Note: there is no `country` column on membership_members,
  // so an "overseas members" figure is deliberately NOT returned rather than
  // guessed — add a country field first if that stat is wanted.
  const nonEmpty = (fn) =>
    new Set(members.map(fn).map(v => (v || '').trim().toLowerCase()).filter(Boolean));
  const isStudent = (m) => /student/i.test(m.current_position || '');
  const community = {
    members: total,
    areas: counts.size,
    unionCouncils: nonEmpty(m => m.union_council).size,
    professionals: members.filter(m => (m.current_position || '').trim() && !isStudent(m)).length,
    students: members.filter(isStudent).length,
    qualified: nonEmpty(m => m.education_level).size ? members.filter(m => (m.education_level || '').trim()).length : 0,
  };

  return {
    total,
    totalAreas: counts.size,
    community,
    ranked,                       // every village, highest first
    top5: ranked.slice(0, 5),
    segments,                     // donut data (top N + Other Areas)
    otherAreas: rest,             // the small villages behind "Other Areas"
    unassigned,
    balanced,
    checksum: { charted, total },
    generatedAt: new Date().toISOString(),
  };
}
