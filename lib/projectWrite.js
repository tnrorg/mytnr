import { STATUS_LABEL } from './projects';

/* Turns a request body into a tnr_projects row.
 *
 * Kept out of the route file because Next.js only permits HTTP method and
 * config exports from a route module — sharing a helper between the create and
 * update routes has to happen here.
 */

const TEXT = ['title', 'category', 'union_council', 'village', 'summary'];
const NUMS = ['beneficiaries', 'volunteers', 'sort_order'];

export function projectFromBody(b, { partial = false } = {}) {
  const row = {};
  for (const f of TEXT) if (!partial || f in b) row[f] = String(b[f] ?? '').trim();
  for (const f of NUMS) if (!partial || f in b) row[f] = Math.max(0, Number(b[f]) || 0);

  if (!partial || 'status' in b) {
    row.status = STATUS_LABEL[b.status] ? b.status : 'ongoing';
  }
  if (!partial || 'published' in b) row.published = b.published !== false;

  if (!partial || 'year' in b) {
    const y = Number(b.year);
    // Null rather than 0 for a blank year: the column allows null, and a year
    // of 0 would sort ahead of every real project.
    row.year = Number.isFinite(y) && y >= 1990 && y <= 2100 ? Math.round(y) : null;
  }
  return row;
}
