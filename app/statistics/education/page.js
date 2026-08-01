'use client';
import { GraduationCap, BookOpen, ClipboardList } from 'lucide-react';
import StatsShell, { BigStat, BreakdownCard } from '@/components/stats/StatsShell';
import { useRounduStats } from '@/components/stats/useRounduStats';

/* Education statistics, computed live from TNR membership records.
 *
 * Every figure describes TNR's members. District-level education facts —
 * literacy rate, school and college counts — are not in this database and
 * would have to come from an official source, so nothing here claims to be
 * about Roundu as a whole.
 */
export default function EducationStatisticsPage() {
  const { d, err, loading } = useRounduStats();

  const withQual = d?.educationRecorded?.find(g => g.label === 'Qualification recorded')?.count || 0;

  return (
    <StatsShell
      title="Education Statistics"
      lead="Qualifications and fields of study across TNR's registered members, calculated live."
      caveat={<>
        <b>About these figures.</b> They describe TNR’s registered members — not the
        population of Roundu. District education data such as literacy rate and the
        number of schools and colleges comes from official government sources and will
        be published separately.
      </>}
      loading={loading} error={err}
      empty={!!d && d.total === 0}
      emptyTitle="No education statistics yet"
      emptyMessage="Figures appear here once memberships are approved."
    >
      {d && (
        <>
          <div className="grid sm:grid-cols-3 gap-5">
            <BigStat value={d.total} label="Active Members" />
            <BigStat value={withQual} label="With a Qualification Recorded"
              sub={d.total ? `${Math.round((withQual / d.total) * 100)}% of members` : null} />
            <BigStat value={(d.fieldOfStudy || []).length} label="Distinct Fields of Study" />
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <BreakdownCard icon={GraduationCap} title="Education Levels"
              note="Highest qualification recorded by members."
              rows={d.education} />
            <BreakdownCard icon={BookOpen} title="Fields of Study"
              note="Subjects members studied." colorFrom={4}
              rows={d.fieldOfStudy} />
            <BreakdownCard icon={ClipboardList} title="Qualification on Record"
              note="How many members have told us their highest qualification." colorFrom={9}
              rows={d.educationRecorded} />
          </div>
        </>
      )}
    </StatsShell>
  );
}
