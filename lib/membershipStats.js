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

/** Every active member's village, de-duplicated by membership_id. */
async function activeVillages() {
  const seen = new Map();
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabaseAdmin()
      .from('membership_members')
      .select('membership_id, village')
      .in('status', ACTIVE_STATUSES)
      .is('deleted_at', null)
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    for (const r of data || []) if (r.membership_id) seen.set(r.membership_id, r.village);
    if (!data || data.length < PAGE) break;
  }
  return [...seen.values()];
}

export async function getMembershipStats() {
  const villages = await activeVillages();
  const total = villages.length;

  // Group by village. Blank/missing areas are tracked separately so they are
  // never silently folded into a real village's count.
  const counts = new Map();
  let unassigned = 0;
  for (const raw of villages) {
    const v = (raw || '').trim();
    if (!v) { unassigned++; continue; }
    counts.set(v, (counts.get(v) || 0) + 1);
  }

  const pct = (n) => total ? Math.round((n / total) * 1000) / 10 : 0;
  const ranked = [...counts.entries()]
    .map(([area, members]) => ({ area, members, percent: pct(members) }))
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

  return {
    total,
    totalAreas: counts.size,
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
