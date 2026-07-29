'use client';
import SiteNav from '@/components/site/SiteNav';
import SiteFooter from '@/components/site/SiteFooter';
import AiFab from '@/components/site/AiFab';
import CouncilCard from '@/components/site/CouncilCard';
import { COUNCIL, COUNCIL_TAGLINE, COUNCIL_MISSION, COUNCIL_PILLARS } from '@/content/advisoryCouncil';

const C = { deep: '#063D2B', green: '#0B6B4F', gold: '#D4A72C', soft: '#F3E4B3', ink: '#15231D', bg: '#FDFDFD' };
const mont = { fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif' };

const STATS = [
  ['10K+', 'Registered Members'], ['25+', 'Countries'], ['500+', 'Students Supported'],
  ['100+', 'Jobs Posted'], ['50+', 'Welfare Projects'], ['15+', 'Global Chapters'],
];

const MODULES = [
  ['Election Portal', 'Transparent elections and voting system', '/election-portal'],
  ['Membership', 'Join, connect and grow with the community', '/membership/apply'],
  ['Verification', 'Verify certificates and membership records', '/verify'],
  ['Education', 'Scholarships, admission guidance and resources', '/education/scholarships'],
  ['Career & Business', 'Jobs, internships and business opportunities', '/career/jobs'],
  ['Welfare', 'Charity, support and community welfare', '/welfare/projects'],
  ['Events', 'Meetings, webinars and community events', '/events'],
  ['TNR AI', 'AI assistant for your every question', '/tnr-ai'],
];

const NEWS = [
  ['25', 'JUL', 'TNR Global Education Scholarship 2026', 'Applications are now open for deserving students.', '2 hours ago'],
  ['23', 'JUL', 'Webinar: Career Growth in Digital Era', 'Join our expert session on career development.', '1 day ago'],
  ['20', 'JUL', 'TNR Community Meeting', 'Monthly online meeting for all members.', '3 days ago'],
];

const VALUES = [
  ['Unity', 'We stand together'], ['Education', 'We learn together'],
  ['Service', 'We serve together'], ['Success', 'We grow together'],
];

export default function Home() {
  return (
    <main style={{ background: C.bg, color: C.ink, fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif' }}
      className="light-page min-h-screen flex flex-col">
      <SiteNav />
      <Hero />
      <StatsBar />
      <Modules />
      <AdvisoryCouncil />
      <Panels />
      <ValuesBar />
      <SiteFooter />
      <AiFab />
    </main>
  );
}

/* ───────────────────────── Hero ───────────────────────── */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src="/hero.jpg" alt="" aria-hidden="true" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(100deg,#FDFDFD 0%,rgba(253,253,253,0.94) 38%,rgba(253,253,253,0.55) 58%,rgba(253,253,253,0.15) 78%)',
        }} />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 py-12 lg:py-16 grid lg:grid-cols-[1.25fr,0.75fr] gap-8 items-center">
        <div className="animate-fade-up">
          <h1 style={mont} className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] uppercase" >
            <span style={{ color: C.deep }}>TNR Global</span><br />
            <span style={{ color: C.deep }}>Digital Community</span>
          </h1>
          <p style={mont} className="mt-4 text-xl sm:text-2xl font-extrabold" >
            <span style={{ color: C.green }}>Together We Grow, Together We Lead</span>
          </p>
          <p className="mt-4 text-gray-600 max-w-xl leading-relaxed">
            A unified digital platform connecting the Rondo community worldwide.
            Empowering members through opportunities, education, leadership,
            and welfare for a stronger future.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="/election-portal" className="px-6 py-3.5 rounded-xl font-bold text-white shadow-lg hover:brightness-110 transition"
              style={{ background: `linear-gradient(180deg,${C.green},${C.deep})` }}>Explore Platform →</a>
            <a href="/about" className="px-6 py-3.5 rounded-xl font-bold bg-white border-2 border-[#063D2B]/15 text-[#063D2B] hover:bg-[#063D2B]/5 transition">About TNR →</a>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 shadow-sm border border-[#0B6B4F]/15 text-sm font-semibold" style={{ color: C.green }}>
            <span>🌿</span> Building a connected, educated and prosperous Rondo community
          </div>
        </div>

        {/* Under-development card */}
        <div className="rounded-3xl p-7 text-center text-white shadow-2xl"
          style={{ background: `linear-gradient(165deg,${C.deep},#04241A)`, border: '1px solid rgba(212,167,44,0.35)' }}>
          <div className="w-20 h-20 mx-auto rounded-full grid place-items-center" style={{ border: `2px solid ${C.gold}` }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <rect x="2.5" y="4" width="19" height="13" rx="2" stroke={C.soft} strokeWidth="1.8" />
              <path d="M8 20h8M12 17v3" stroke={C.soft} strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="10.5" r="2.4" stroke={C.gold} strokeWidth="1.8" />
            </svg>
          </div>
          <h3 style={mont} className="mt-5 text-lg font-extrabold uppercase tracking-wide">TNR Digital Platform<br />Under Development</h3>
          <div className="w-16 h-px mx-auto my-4" style={{ background: C.gold }} />
          <p className="text-sm text-white/70 leading-relaxed">
            We are working hard to bring a complete digital experience for our global community.
          </p>
          <a href="/contact" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(212,167,44,0.15)', color: C.soft, border: `1px solid ${C.gold}66` }}>
            🔔 Stay Connected
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Stats bar ───────────────────────── */
function StatsBar() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 -mt-2 mb-14 w-full">
      <div className="rounded-2xl shadow-2xl px-4 py-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-6 divide-y-0 lg:divide-x divide-white/10"
        style={{ background: `linear-gradient(165deg,${C.deep},#04241A)` }}>
        {STATS.map(([n, l]) => (
          <div key={l} className="text-center px-2">
            <div style={{ ...mont, color: C.soft }} className="text-2xl sm:text-3xl font-black">{n}</div>
            <div className="text-[11px] sm:text-xs text-white/60 mt-1">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Modules ───────────────────────── */
function Modules() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 pb-14 w-full">
      <div className="flex items-center justify-center gap-3">
        <span className="h-px w-10 sm:w-20" style={{ background: `${C.gold}66` }} />
        <h2 style={{ ...mont, color: C.deep }} className="text-lg sm:text-xl font-black uppercase tracking-wide text-center">Our Platform Modules</h2>
        <span className="h-px w-10 sm:w-20" style={{ background: `${C.gold}66` }} />
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {MODULES.map(([t, d, href]) => (
          <a key={t} href={href}
            className="group rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition p-4 text-center flex flex-col">
            <span className="w-12 h-12 mx-auto rounded-xl grid place-items-center text-xl"
              style={{ background: '#0B6B4F14', color: C.green }}>
              {t === 'Election Portal' ? '🗳️' : t === 'Membership' ? '👥' : t === 'Verification' ? '🛡️'
                : t === 'Education' ? '🎓' : t === 'Career & Business' ? '💼' : t === 'Welfare' ? '💚'
                : t === 'Events' ? '📅' : '🤖'}
            </span>
            <h4 style={mont} className="mt-3 font-extrabold text-sm" >{t}</h4>
            <p className="mt-1 text-[11px] text-gray-500 leading-snug flex-1">{d}</p>
            <span className="mt-3 text-[11px] font-bold group-hover:underline" style={{ color: C.green }}>Explore →</span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────── Interim Advisory Council ─────────────────── */
function AdvisoryCouncil() {
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
          {COUNCIL.map(m => <CouncilCard key={m.slug} member={m} />)}
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

/* ───────────────────────── Values bar ───────────────────────── */
function ValuesBar() {
  return (
    <section className="text-white" style={{ background: `linear-gradient(165deg,${C.deep},#04241A)` }}>
      <div className="max-w-[1400px] mx-auto px-4 py-8 grid lg:grid-cols-[1.2fr,2fr] gap-6 items-center">
        <div className="text-center lg:text-left">
          <p className="text-sm sm:text-base font-semibold italic">&ldquo;Alone we can do so little; together we can do so much.&rdquo;</p>
          <p className="text-xs text-white/50 mt-1">– Helen Keller</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {VALUES.map(([t, d]) => (
            <div key={t} className="text-center">
              <div className="text-xl" style={{ color: C.gold }}>
                {t === 'Unity' ? '🤝' : t === 'Education' ? '🎓' : t === 'Service' ? '🌿' : '📈'}
              </div>
              <div style={{ ...mont, color: C.soft }} className="mt-1 text-sm font-extrabold">{t}</div>
              <div className="text-[11px] text-white/50">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

