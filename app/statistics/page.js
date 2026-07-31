'use client';
import { useEffect, useState } from 'react';
import { GraduationCap, Briefcase, Users, HeartHandshake, Landmark, MapPin } from 'lucide-react';
import SiteNav from '@/components/site/SiteNav';
import SiteFooter from '@/components/site/SiteFooter';
import { SectionHeading, EmptyState, Skeleton, CountUp } from '@/components/ui';
import { COLORS, FONT, areaColor } from '@/lib/design/tokens';

const SECTIONS = [
  ['education',     'Education Levels',       GraduationCap,  'Highest qualification recorded by members.'],
  ['professions',   'Professions',            Briefcase,      'What members do today.'],
  ['fieldOfStudy',  'Fields of Study',        GraduationCap,  'Subjects members studied.'],
  ['contribution',  'Contribution Interests', HeartHandshake, 'Where members want to help. Members may choose several.'],
  ['unionCouncils', 'By Union Council',       Landmark,       'Members grouped by Union Council.'],
  ['villages',      'By Village / Area',      MapPin,         'Members grouped by village.'],
  ['gender',        'Gender',                 Users,          'Recorded at registration.'],
];

function Bar({ rows }) {
  const max = rows[0]?.count || 1;
  return (
    <ul className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="truncate" style={{ color: COLORS.charcoal }}>{r.label}</span>
            <span className="shrink-0 tabular-nums" style={{ color: COLORS.muted }}>
              <b style={{ color: COLORS.green900 }}>{r.count}</b> · {r.percent}%
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: COLORS.neutral }}>
            <div className="h-full rounded-full transition-[width] duration-reveal"
              style={{ width: `${(r.count / max) * 100}%`, background: areaColor(i) }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function StatisticsPage() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch('/api/public/roundu-stats', { cache: 'no-store' })
      .then(r => r.json())
      .then(j => (j?.ok ? setD(j) : setErr(j?.message || 'Statistics are unavailable right now.')))
      .catch(() => setErr('Statistics are unavailable right now.'));
  }, []);

  const card = 'rounded-tnr-lg bg-white p-6 shadow-tnr-flat border border-[rgba(200,154,43,.35)]';

  return (
    <main id="main" className="light-page min-h-screen flex flex-col bg-tnr-snow"
      style={{ color: COLORS.charcoal, ...FONT }}>
      <SiteNav />

      <header className="text-white py-14" style={{ background: `linear-gradient(165deg,${COLORS.green950},${COLORS.green800})` }}>
        <div className="max-w-tnr mx-auto px-5">
          <div className="text-[11px] font-bold uppercase tracking-[.2em]" style={{ color: COLORS.gold400 }}>
            Roundu Statistics
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">TNR Membership in Numbers</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.7)' }}>
            Every figure on this page is calculated live from TNR membership records.
          </p>
        </div>
      </header>

      <section className="max-w-tnr mx-auto px-5 py-12 w-full flex-1 space-y-6">
        {/* Stated plainly, because presenting member data as a census of Roundu
            would be misleading — members are self-selected, not a sample. */}
        <div className="rounded-tnr-lg px-5 py-4 text-[13px] leading-relaxed"
          style={{ background: 'rgba(200,154,43,.10)', color: '#7A5C10' }}>
          <b>About these figures.</b> They describe TNR’s registered members — not the population
          of Roundu. District statistics such as population, literacy rate and tourism come from
          official government sources and will be published separately as they are gathered.
        </div>

        {err && <EmptyState icon="📊" title="Statistics unavailable" message={err} />}
        {!d && !err && <div className="grid sm:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height="h-56" />)}
        </div>}

        {d && d.total === 0 && (
          <EmptyState icon="📊" title="No member statistics yet"
            message="Figures appear here once memberships are approved." />
        )}

        {d && d.total > 0 && (
          <>
            <div className={card + ' text-center'}>
              <div className="text-5xl font-extrabold" style={{ color: COLORS.green900 }}>
                <CountUp value={d.total} />
              </div>
              <div className="mt-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: COLORS.muted }}>
                Active Members
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              {SECTIONS.filter(([k]) => (d[k] || []).length).map(([k, title, Icon, note]) => (
                <div key={k} className={card}>
                  <div className="flex items-center gap-2.5">
                    <Icon size={17} strokeWidth={2} aria-hidden="true" style={{ color: COLORS.green700 }} />
                    <h2 className="font-extrabold" style={{ color: COLORS.green900 }}>{title}</h2>
                  </div>
                  <p className="mt-1 mb-4 text-[12px]" style={{ color: COLORS.muted }}>{note}</p>
                  <Bar rows={d[k].slice(0, 12)} />
                  {d[k].length > 12 && (
                    <p className="mt-3 text-[11px]" style={{ color: COLORS.muted }}>
                      Showing the top 12 of {d[k].length}.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
