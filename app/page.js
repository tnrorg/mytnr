'use client';
import SiteNav from '@/components/site/SiteNav';
import SiteFooter from '@/components/site/SiteFooter';
import AiFab from '@/components/site/AiFab';
import CouncilCard from '@/components/site/CouncilCard';
import { COUNCIL_TAGLINE, COUNCIL_MISSION, COUNCIL_PILLARS } from '@/content/advisoryCouncil';
import ExecutiveCard from '@/components/site/ExecutiveCard';
import { CEC_INTRO } from '@/content/executiveCommittee';
import { useLeadership } from '@/components/site/useLeadership';
import Hero from '@/components/home/Hero';
import CommunityStats from '@/components/home/CommunityStats';
import CoreAreas from '@/components/home/CoreAreas';
import JoinCta from '@/components/home/JoinCta';
import MembersPreview from '@/components/home/MembersPreview';

const C = { deep: '#063D2B', green: '#0B6B4F', gold: '#D4A72C', soft: '#F3E4B3', ink: '#15231D', bg: '#FDFDFD' };
const mont = { fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif' };

// NOTE: the hardcoded STATS array that used to live here ("10K+ Registered
// Members", "25+ Countries", ...) was invented. Community figures now come from
// /api/public/community-stats — see components/home/CommunityStats.js.




export default function Home() {
  return (
    <main style={{ background: C.bg, color: C.ink, fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif' }}
      className="light-page min-h-screen flex flex-col">
      <SiteNav />
      <Hero />
      <CommunityStats />
      <CoreAreas />
      <AdvisoryCouncil />
      <ExecutiveCommittee />
      <MembersPreview />
      <JoinCta />
      <SiteFooter />
      <AiFab />
    </main>
  );
}




/* ─────────────────── Interim Advisory Council ─────────────────── */
function AdvisoryCouncil() {
  const { advisory } = useLeadership();
  return (
    <section className="w-full py-14" style={{ background: '#F6F9F7' }}>
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10 sm:w-20" style={{ background: `${C.gold}66` }} />
          <h2 style={{ ...mont, color: C.deep }} className="text-lg sm:text-xl font-black uppercase tracking-wide text-center">Interim Advisory Council</h2>
          <span className="h-px w-10 sm:w-20" style={{ background: `${C.gold}66` }} />
        </div>
        <p className="mt-3 text-center text-sm text-gray-500 max-w-2xl mx-auto">{COUNCIL_TAGLINE}</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {advisory.map(m => <CouncilCard key={m.slug} member={m} />)}
        </div>

        <div className="mt-8 rounded-2xl p-6 sm:p-8 text-center" style={{ background: C.deep }}>
          <div className="text-[11px] font-bold uppercase tracking-[.24em] mb-3" style={{ color: C.gold }}>Our Collective Mission</div>
          <p className="text-white/85 text-sm sm:text-[15px] leading-relaxed max-w-3xl mx-auto">{COUNCIL_MISSION}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {COUNCIL_PILLARS.map(([icon, label]) => (
              <span key={label} className="flex items-center gap-2 text-[12px] font-semibold text-white/80">
                <span className="text-base">{icon}</span>{label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── Central Executive Committee ─────────────────── */
function ExecutiveCommittee() {
  const { executive } = useLeadership();
  return (
    <section className="max-w-[1400px] mx-auto px-4 py-14 w-full">
      <div className="flex items-center justify-center gap-3">
        <span className="h-px w-10 sm:w-20" style={{ background: `${C.gold}66` }} />
        <h2 style={{ ...mont, color: C.deep }} className="text-lg sm:text-xl font-black uppercase tracking-wide text-center">Central Executive Committee</h2>
        <span className="h-px w-10 sm:w-20" style={{ background: `${C.gold}66` }} />
      </div>
      <p className="mt-3 text-center text-sm text-gray-500 max-w-3xl mx-auto leading-relaxed">{CEC_INTRO}</p>

      {/* one per row on mobile, three per row from desktop up */}
      <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {executive.map(m => <ExecutiveCard key={m.slug} member={m} />)}
      </div>
    </section>
  );
}



