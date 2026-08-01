'use client';
import { useEffect, useState } from 'react';
import { Layers, MapPin, Landmark, CalendarDays, Tag } from 'lucide-react';
import StatsShell, { BigStat, BreakdownCard, statCard } from '@/components/stats/StatsShell';
import { STATUS_LABEL } from '@/lib/projects';
import { COLORS } from '@/lib/design/tokens';

/* Projects statistics.
 *
 * Fed entirely by the admin-managed projects list — there is no way to derive
 * project counts from member records, and publishing invented figures on a
 * page headed "statistics" would be worse than an honest empty state.
 */
export default function ProjectStatisticsPage() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let off = false;
    fetch('/api/public/projects', { cache: 'no-store' })
      .then(r => r.json())
      .then(j => {
        if (off) return;
        if (j?.ok) setD(j); else setErr(j?.message || 'Project statistics are unavailable right now.');
      })
      .catch(() => { if (!off) setErr('Project statistics are unavailable right now.'); })
      .finally(() => { if (!off) setLoading(false); });
    return () => { off = true; };
  }, []);

  const s = d?.stats;

  return (
    <StatsShell
      title="Projects Statistics"
      lead="TNR's recorded projects — what has been delivered, where, and who it reached."
      caveat={<>
        <b>About these figures.</b> They cover projects recorded by TNR administrators.
        Beneficiary and volunteer numbers are as reported by the teams who ran each
        project, not independently audited.
      </>}
      loading={loading} error={err}
      empty={!!s && s.total === 0}
      emptyTitle="No projects recorded yet"
      emptyMessage="Figures appear here once projects are added in the admin panel."
    >
      {s && s.total > 0 && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <BigStat value={s.total} label="Projects Recorded" />
            <BigStat value={s.completed} label="Completed" />
            <BigStat value={s.beneficiaries} label="People Reached" />
            <BigStat value={s.volunteers} label="Volunteers Involved" />
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <BreakdownCard icon={Layers} title="By Status"
              note="Where each project stands." rows={s.byStatus} />
            <BreakdownCard icon={Tag} title="By Category"
              note="What kind of work TNR has delivered." colorFrom={4} rows={s.byCategory} />
            <BreakdownCard icon={Landmark} title="By Union Council"
              note="Projects grouped by Union Council." colorFrom={8} rows={s.byCouncil} />
            <BreakdownCard icon={MapPin} title="By Village / Area"
              note="Projects grouped by village." colorFrom={12} rows={s.byVillage} />
            <BreakdownCard icon={CalendarDays} title="By Year"
              note="Most recent first." colorFrom={16} rows={s.byYear} limit={20} />
          </div>

          <ProjectList projects={d.projects} />
        </>
      )}
    </StatsShell>
  );
}

function ProjectList({ projects }) {
  if (!projects?.length) return null;
  return (
    <div className={statCard}>
      <h2 className="font-extrabold mb-4" style={{ color: COLORS.green900 }}>All Projects</h2>
      <ul className="divide-y" style={{ borderColor: COLORS.neutral }}>
        {projects.map(p => (
          <li key={p.id} className="py-3.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-bold text-[14px]" style={{ color: COLORS.green900 }}>{p.title}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(23,107,73,.10)', color: COLORS.green700 }}>
              {STATUS_LABEL[p.status] || p.status}
            </span>
            <span className="text-[12px]" style={{ color: COLORS.muted }}>
              {[p.category, p.village || p.union_council, p.year].filter(Boolean).join(' · ')}
            </span>
            {p.beneficiaries > 0 && (
              <span className="ml-auto text-[12px] tabular-nums" style={{ color: COLORS.muted }}>
                {p.beneficiaries.toLocaleString()} reached
              </span>
            )}
            {p.summary && (
              <p className="w-full mt-1 text-[13px] leading-relaxed" style={{ color: COLORS.muted }}>
                {p.summary}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
