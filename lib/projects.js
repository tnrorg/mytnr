/* Shared vocabulary for TNR projects, used by the admin form, the API and the
 * public statistics page — so a status added in one place cannot go missing in
 * another. */

export const PROJECT_STATUSES = [
  ['ongoing',   'Ongoing'],
  ['completed', 'Completed'],
  ['planned',   'Planned'],
  ['on_hold',   'On hold'],
];

export const STATUS_LABEL = Object.fromEntries(PROJECT_STATUSES);

/** Suggestions only — the admin can type any category they need. */
export const PROJECT_CATEGORIES = [
  'Education', 'Health', 'Community Welfare', 'Youth Development',
  'Women Empowerment', 'Environment', 'Sports', 'Emergency Relief',
];

export const blankProject = () => ({
  title: '', category: '', status: 'ongoing',
  union_council: '', village: '', year: new Date().getFullYear(),
  beneficiaries: 0, volunteers: 0, summary: '', image_url: null,
  published: true, sort_order: 0,
});

/** Columns the public endpoint may return. */
export const PUBLIC_PROJECT_COLUMNS = [
  'id', 'title', 'category', 'status', 'union_council', 'village',
  'year', 'beneficiaries', 'volunteers', 'summary', 'image_url', 'sort_order',
].join(', ');

/** Roll a project list up into the counts the statistics page displays. */
export function summarise(projects) {
  const total = projects.length;
  const pct = (n) => (total ? Math.round((n / total) * 1000) / 10 : 0);

  const tally = (fn) => {
    const m = new Map();
    for (const p of projects) {
      const v = String(fn(p) ?? '').trim();
      if (!v) continue;
      const k = v.toLowerCase();
      if (!m.has(k)) m.set(k, { label: v, count: 0 });
      m.get(k).count++;
    }
    return [...m.values()]
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .map(x => ({ ...x, percent: pct(x.count) }));
  };

  const byStatus = PROJECT_STATUSES
    .map(([key, label]) => ({ label, count: projects.filter(p => p.status === key).length }))
    .filter(s => s.count > 0)
    .map(s => ({ ...s, percent: pct(s.count) }));

  const sum = (field) => projects.reduce((n, p) => n + (Number(p[field]) || 0), 0);

  return {
    total,
    completed: projects.filter(p => p.status === 'completed').length,
    ongoing: projects.filter(p => p.status === 'ongoing').length,
    beneficiaries: sum('beneficiaries'),
    volunteers: sum('volunteers'),
    byStatus,
    byCategory: tally(p => p.category),
    byCouncil: tally(p => p.union_council),
    byVillage: tally(p => p.village),
    byYear: tally(p => p.year).sort((a, b) => b.label.localeCompare(a.label)),
  };
}
