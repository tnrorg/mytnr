import { supabaseAdmin } from '@/lib/supabaseServer';
import { ACTIVE_STATUSES } from '@/lib/membershipStats';
import { cleanAreaName } from '@/lib/membership/areaName';

/* Where TNR's approved members are, aggregated.
 *
 * Counts ONLY approved/active, non-deleted members. Pending, rejected,
 * suspended, inactive, expired and soft-deleted rows are excluded — a public
 * figure that includes people who have not been approved is simply wrong, and
 * one that includes deleted members is worse.
 *
 * Nothing identifying is read. The query asks for six location columns and
 * nothing else: no name, email, phone or date of birth reaches this module, so
 * a mistake in the API layer cannot leak them.
 */

// Six columns, not `*`. Keeps the payload small and makes the privacy
// guarantee structural rather than a promise.
const COLUMNS = 'village, union_council, current_country, current_country_code, ' +
  'current_state_province, current_city';

const PAGE = 1000;

/** ISO 3166-1 alpha-2 → flag emoji, by offsetting each letter into the
 *  regional-indicator block. No image files, no lookup table to maintain. */
export function flagFor(code) {
  const c = String(code || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return '';
  return String.fromCodePoint(...[...c].map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65));
}

/** Case- and punctuation-insensitive grouping key. "HARDASS" and "Hardass"
 *  are one village; counting them twice split a real place across two rows. */
const key = (v) => cleanAreaName(v).toLowerCase();

function tally(rows, get) {
  const m = new Map();
  for (const r of rows) {
    const raw = cleanAreaName(get(r));
    if (!raw) continue;
    const k = raw.toLowerCase();
    if (!m.has(k)) m.set(k, { name: raw, count: 0 });
    m.get(k).count++;
  }
  return [...m.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Two-level grouping: parent → children, each with counts. */
function nest(rows, parentOf, childOf) {
  const parents = new Map();
  for (const r of rows) {
    const p = cleanAreaName(parentOf(r));
    if (!p) continue;
    const pk = p.toLowerCase();
    if (!parents.has(pk)) parents.set(pk, { name: p, count: 0, children: new Map() });
    const node = parents.get(pk);
    node.count++;

    const c = cleanAreaName(childOf(r));
    if (!c) continue;
    const ck = c.toLowerCase();
    if (!node.children.has(ck)) node.children.set(ck, { name: c, count: 0 });
    node.children.get(ck).count++;
  }
  return [...parents.values()]
    .map(p => ({
      name: p.name, count: p.count,
      children: [...p.children.values()]
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Every approved member's location slice. Paged: Supabase caps one select. */
async function activeLocations() {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabaseAdmin()
      .from('membership_members')
      .select(COLUMNS)
      .in('status', ACTIVE_STATUSES)
      .is('deleted_at', null)
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data || []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

/* Pakistan is matched on the ISO code first and the name only as a fallback.
 * Codes are stable; the readable name is whatever the dataset called it on the
 * day the member registered. */
const isPakistan = (r) =>
  String(r.current_country_code || '').toUpperCase() === 'PK' ||
  (!r.current_country_code && /^pakistan$/i.test(String(r.current_country || '').trim()));

export async function getMembershipGeography() {
  const rows = await activeLocations();
  const total = rows.length;

  // ── Roundu: permanent address, every approved member ──
  // Includes members living abroad. Their Union Council is where they are
  // FROM, which is exactly what this section is for.
  const roundu = nest(rows, r => r.union_council, r => r.village);

  // ── Pakistan: current address ──
  const inPk = rows.filter(isPakistan);
  const pakistan = nest(inPk, r => r.current_state_province, r => r.current_city);

  // ── Rest of the world ──
  const abroad = rows.filter(r => !isPakistan(r) && (r.current_country || r.current_country_code));
  const byCountry = new Map();
  for (const r of abroad) {
    const name = cleanAreaName(r.current_country);
    const code = String(r.current_country_code || '').trim().toUpperCase();
    const k = code || name.toLowerCase();
    if (!k) continue;
    if (!byCountry.has(k)) byCountry.set(k, { name: name || code, code, count: 0 });
    byCountry.get(k).count++;
  }
  const global = [...byCountry.values()]
    .map(c => ({ ...c, flag: flagFor(c.code) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    total,
    // Members who have not filled in a current address yet — everyone approved
    // before the address questions existed. Reported rather than hidden, so
    // the three sections not adding up to the total has a stated reason.
    withoutCurrentAddress: rows.filter(r => !r.current_country && !r.current_country_code).length,
    roundu: {
      councils: roundu,
      totalCouncils: roundu.length,
      totalVillages: roundu.reduce((n, c) => n + c.children.length, 0),
      members: roundu.reduce((n, c) => n + c.count, 0),
    },
    pakistan: {
      provinces: pakistan,
      totalProvinces: pakistan.length,
      totalCities: pakistan.reduce((n, p) => n + p.children.length, 0),
      members: inPk.length,
    },
    global: {
      countries: global,
      totalCountries: global.length,
      members: abroad.length,
    },
    generatedAt: new Date().toISOString(),
  };
}
