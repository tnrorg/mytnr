'use client';
import SiteNav from '@/components/site/SiteNav';
import SiteFooter from '@/components/site/SiteFooter';
import AiFab from '@/components/site/AiFab';
import ExecutiveCard from '@/components/site/ExecutiveCard';
import { CEC_INTRO } from '@/content/executiveCommittee';
import { useLeadership } from '@/components/site/useLeadership';
import Hero from '@/components/home/Hero';
import CommunityStats from '@/components/home/CommunityStats';
import LeadershipMessages from '@/components/home/LeadershipMessages';
import CoreAreas from '@/components/home/CoreAreas';
import JoinCta from '@/components/home/JoinCta';
import MembersPreview from '@/components/home/MembersPreview';
import CouncilSection from '@/components/home/CouncilSection';

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
      {/* Founder's then President's message — a human voice after the figures,
          before the leadership rosters. Renders nothing until an admin
          publishes one (Admin → Home Messages). */}
      <LeadershipMessages />
      {/* Leadership leads: who guides TNR, then what TNR does. */}
      <CouncilSection />
      <ExecutiveCommittee />
      <CoreAreas />
      <MembersPreview />
      <JoinCta />
      <SiteFooter />
      <AiFab />
    </main>
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



