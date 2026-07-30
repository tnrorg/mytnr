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
      <Panels />
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

/* ───────────────────────── Three panels ───────────────────────── */
function Panels() {
  const Head = ({ title, link, href }) => (
    <div className="flex items-center justify-between mb-4">
      <h3 style={{ ...mont, color: C.deep }} className="text-sm font-black uppercase tracking-wide">{title}</h3>
      <a href={href} className="text-xs font-semibold" style={{ color: C.green }}>{link} →</a>
    </div>
  );
  return (
    <section className="max-w-[1400px] mx-auto px-4 pb-14 w-full grid lg:grid-cols-3 gap-4">
      {/* Announcements */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
        <Head title="Latest Announcements" link="View All" href="/news" />
        <div className="space-y-3">
          {NEWS.map(([d, m, t, s, ago]) => (
            <a key={t} href="/news" className="flex gap-3 group">
              <div className="w-12 shrink-0 rounded-xl text-center py-1.5" style={{ background: '#0B6B4F12' }}>
                <div style={{ ...mont, color: C.deep }} className="text-base font-black leading-none">{d}</div>
                <div className="text-[9px] font-bold" style={{ color: C.green }}>{m}</div>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#15231D] group-hover:text-[#0B6B4F] transition leading-snug">{t}</div>
                <div className="text-xs text-gray-500 truncate">{s}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{ago}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Community statistics */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
        <Head title="Community Statistics" link="View Reports" href="/statistics" />
        <div className="grid grid-cols-2 gap-3">
          {[['Total Members', '10,248+'], ['Students', '4,350+'], ['Professionals', '3,120+'], ['Overseas Members', '2,778+']].map(([l, v]) => (
            <div key={l} className="rounded-xl p-3" style={{ background: '#0B6B4F0d' }}>
              <div className="text-[11px] text-gray-500">{l}</div>
              <div style={{ ...mont, color: C.deep }} className="text-lg font-black">{v}</div>
            </div>
          ))}
        </div>
        <a href="/statistics" className="mt-4 block text-center rounded-xl py-2.5 text-sm font-bold text-white"
          style={{ background: `linear-gradient(180deg,${C.green},${C.deep})` }}>Explore Rondo Statistics</a>
      </div>

      {/* Connect worldwide */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
        <Head title="Connect Worldwide" link="View Map" href="/community/map" />
        <p className="text-sm text-gray-500 leading-relaxed">
          TNR is present in more than <b className="text-[#063D2B]">25 countries</b>.
          Find your chapter or representative.
        </p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {['🌍', '🌏', '🌎', '🗺️', '🏔️', '🏙️', '🕌', '🎓'].map((e, i) => (
            <div key={i} className="aspect-square rounded-xl grid place-items-center text-xl" style={{ background: '#0B6B4F0d' }}>{e}</div>
          ))}
        </div>
        <a href="/community/chapters" className="mt-4 block text-center rounded-xl py-2.5 text-sm font-bold text-white"
          style={{ background: `linear-gradient(180deg,${C.green},${C.deep})` }}>Explore Chapters</a>
      </div>
    </section>
  );
}


