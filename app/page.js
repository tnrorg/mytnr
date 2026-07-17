'use client';
import { useEffect, useState } from 'react';

const C = { deep: '#063D2B', green: '#0B6B4F', gold: '#D4A72C', softGold: '#F3E4B3', ink: '#15231D', bg: '#FDFDFD', black: '#0B120F' };
const mont = { fontFamily: 'Montserrat, ui-sans-serif, sans-serif' };
const API = '/api/public/overview';

export default function Home() {
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [rules, setRules] = useState(false);
  const load = () => fetch(API).then(r => r.json()).then(setData).catch(() => {});
  useEffect(() => { load(); const id = setInterval(load, 20000); return () => clearInterval(id); }, []);

  const e = data?.election, stats = data?.stats, vis = data?.visibility;
  return (
    <main style={{ background: C.bg, color: C.ink, fontFamily: 'Inter, sans-serif' }} className="min-h-screen">
      <Navbar e={e} org={data?.org} />
      <Hero e={e} stats={stats} org={data?.org} onRules={() => setRules(true)} />

      <section id="candidates" className="max-w-6xl mx-auto px-4 py-14">
        <SectionTitle kicker="THE CANDIDATES" title="Choose Your Representatives" />
        {!data && <p className="text-center text-gray-400 py-10">Loading election…</p>}
        {data && !e && <p className="text-center text-gray-400 py-10">No active election right now.</p>}
        <div className="space-y-14 mt-8">
          {data?.positions?.map((p, i) => (
            <PositionSection key={p.id} p={p} i={i} vis={vis} ended={e?.ended} onProfile={setProfile} />
          ))}
        </div>
      </section>

      <LiveOverview e={e} stats={stats} />
      <Process onRules={() => setRules(true)} />
      <About />
      <Contact />
      <Footer2 org={data?.org} />

      {profile && <ProfileModal c={profile} onClose={() => setProfile(null)} />}
      {rules && <RulesModal onClose={() => setRules(false)} />}
    </main>
  );
}

/* ─────────────────────────── Countdown ─────────────────────────── */
function useCountdown(target) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!target) return;
    const tick = () => setLeft(Math.max(0, new Date(target).getTime() - Date.now()));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [target]);
  const s = Math.floor(left / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, done: left <= 0 };
}
function Countdown({ target, tone = 'light' }) {
  const t = useCountdown(target);
  if (!target) return null;
  const box = tone === 'light'
    ? 'bg-white text-[#063D2B] border border-[#D4A72C]/40'
    : 'bg-white/10 text-white border border-white/20';
  const Unit = ({ v, l }) => (
    <div className={`px-2.5 py-1.5 rounded-lg text-center ${box}`}>
      <div style={mont} className="text-base font-extrabold leading-none tabular-nums">{String(v).padStart(2, '0')}</div>
      <div className="text-[9px] uppercase tracking-wider opacity-70">{l}</div>
    </div>
  );
  return <div className="flex items-center gap-1.5">
    <Unit v={t.d} l="days" /><Unit v={t.h} l="hrs" /><Unit v={t.m} l="min" /><Unit v={t.s} l="sec" />
  </div>;
}

/* ─────────────────────────── Navbar ─────────────────────────── */
function Navbar({ e, org }) {
  const [open, setOpen] = useState(false);
  const live = e?.voting_open;
  const links = [['Home', '#top'], ['Candidates', '#candidates'], ['Election Process', '#process'], ['Results', '/results'], ['About', '#about'], ['Contact', '#contact']];
  return (
    <header id="top" className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-4">
        <a href="#top" className="flex items-center gap-2.5 shrink-0">
          <span className="w-10 h-10 rounded-full grid place-items-center bg-white ring-2 ring-[#D4A72C] overflow-hidden shadow">
            <img src={org?.logo_url || '/tnr-logo.png'} alt="TNR" className="w-full h-full object-contain p-0.5" />
          </span>
          <span style={mont} className="font-extrabold text-[#063D2B] leading-tight text-sm sm:text-base">
            {org?.short_name || 'TNR'}<span className="hidden sm:inline text-gray-400 font-medium"> · Election</span>
          </span>
        </a>
        <nav className="hidden lg:flex items-center gap-1 mx-auto">
          {links.map(([l, h]) => <a key={l} href={h} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#0B6B4F] hover:bg-[#0B6B4F]/5 transition">{l}</a>)}
        </nav>
        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          {live && <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: C.green }}>
            <span className="w-2 h-2 rounded-full bg-[#D4A72C] animate-pulse" /> ELECTION IS LIVE
          </span>}
          {live && e?.ends_at && <div className="hidden md:block"><Countdown target={e.ends_at} /></div>}
          <a href="/vote" className="px-4 py-2 rounded-xl text-sm font-bold text-[#063D2B] shadow" style={{ background: `linear-gradient(180deg,#F3E4B3,#D4A72C)` }}>Vote Now</a>
          <button className="lg:hidden p-2 text-gray-600" onClick={() => setOpen(!open)} aria-label="menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>
      {open && <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-2">
        {links.map(([l, h]) => <a key={l} href={h} onClick={() => setOpen(false)} className="block px-2 py-2.5 text-sm font-medium text-gray-700">{l}</a>)}
      </div>}
    </header>
  );
}

/* ─────────────────────────── Hero ─────────────────────────── */
function Hero({ e, stats, org, onRules }) {
  const fmt = (d) => d ? new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
  const date = e?.starts_at ? new Date(e.starts_at).toLocaleDateString('en-GB', { dateStyle: 'full' }) : 'To be announced';
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(900px 380px at 80% -10%, rgba(11,107,79,0.10), transparent 60%)' }} />
      <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-10 grid lg:grid-cols-[1.15fr,0.85fr] gap-10 items-center">
        <div className="animate-fade-up">
          {e?.voting_open && <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white mb-4" style={{ background: C.green }}>
            <span className="w-2 h-2 rounded-full bg-[#D4A72C] animate-pulse" /> ELECTION IS LIVE
          </span>}
          <h1 style={mont} className="text-4xl sm:text-5xl font-black leading-[1.05] text-[#063D2B]">
            {(org?.name || 'Tahreek-e-Nojawanan Roundu')}<br /><span style={{ color: C.gold }}>Online Election</span>
          </h1>
          <p className="mt-4 text-gray-600 text-lg max-w-xl">Choose your representatives and help shape the future of our youth movement.</p>

          <div className="mt-6 grid grid-cols-3 gap-3 max-w-lg">
            <MiniStat label="Registered" value={stats?.total_voters ?? '—'} />
            <MiniStat label="Votes Cast" value={stats?.votes_cast ?? '—'} gold />
            <MiniStat label="Turnout" value={stats != null ? `${stats.turnout}%` : '—'} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/vote" className="px-6 py-3.5 rounded-xl font-bold text-[#063D2B] shadow-lg hover:brightness-105 transition" style={{ background: 'linear-gradient(180deg,#F3E4B3,#D4A72C)' }}>🗳️ VOTE NOW</a>
            <button onClick={onRules} className="px-6 py-3.5 rounded-xl font-bold text-[#063D2B] border-2 border-[#063D2B]/15 hover:bg-[#063D2B]/5 transition">VIEW ELECTION RULES</button>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#0B6B4F0d', color: C.green, border: '1px solid rgba(11,107,79,0.2)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="#0B6B4F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="9" stroke="#0B6B4F" strokeWidth="1.6" /></svg>
            Secure OTP Verification · One Member, One Vote
          </div>
        </div>

        <div className="animate-pop">
          <div className="rounded-3xl p-6 sm:p-7 text-white shadow-2xl" style={{ background: `linear-gradient(160deg,${C.deep},${C.black})`, border: `1px solid rgba(212,167,44,0.35)` }}>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-14 h-14 rounded-full grid place-items-center bg-white ring-2 ring-[#D4A72C] overflow-hidden">
                <img src={org?.logo_url || '/tnr-logo.png'} className="w-full h-full object-contain p-0.5" alt="" />
              </span>
              <div><div style={mont} className="font-extrabold">{e?.title || 'TNR Election 2026'}</div>
                <div className="text-xs text-white/60">{e?.status || 'Scheduled'}</div></div>
            </div>
            <Row k="Election Date" v={date} />
            <Row k="Voting Opens" v={fmt(e?.starts_at)} />
            <Row k="Voting Closes" v={fmt(e?.ends_at)} />
            <div className="h-px my-3" style={{ background: 'linear-gradient(90deg,transparent,#D4A72C,transparent)' }} />
            {e?.voting_open && e?.ends_at ? (
              <div><div className="text-xs text-white/60 mb-2">Time remaining to vote</div><Countdown target={e.ends_at} tone="dark" /></div>
            ) : <div className="text-sm text-white/70">{e?.ended ? 'Voting has closed.' : 'Voting has not opened yet.'}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
function Row({ k, v }) { return <div className="flex justify-between gap-3 py-1.5 text-sm"><span className="text-white/55">{k}</span><span className="font-semibold text-right">{v}</span></div>; }
function MiniStat({ label, value, gold }) {
  return <div className="rounded-xl bg-white border border-gray-100 shadow-sm px-3 py-3 text-center">
    <div style={mont} className={`text-2xl font-black ${gold ? 'text-[#D4A72C]' : 'text-[#063D2B]'}`}>{value}</div>
    <div className="text-[10px] uppercase tracking-wider text-gray-400">{label}</div>
  </div>;
}
function SectionTitle({ kicker, title }) {
  return <div className="text-center">
    <div className="text-xs font-bold tracking-[0.2em] text-[#D4A72C]">{kicker}</div>
    <h2 style={mont} className="text-3xl sm:text-4xl font-black text-[#063D2B] mt-1">{title}</h2>
    <div className="w-20 h-1 rounded-full mx-auto mt-3" style={{ background: 'linear-gradient(90deg,#0B6B4F,#D4A72C)' }} />
  </div>;
}

/* ─────────────────────── Position + Candidate cards ─────────────────────── */
const POS_ICONS = [
  'M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.9 7.2 17l.9-5.4L4.2 7.7l5.4-.8z', // star (President)
  'M12 2l8 4v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6z',                        // shield (VP)
  'M4 5h16v4H4zM4 11h16v8H4z',                                               // docs (Gen Sec)
  'M3 11l18-8v18l-18-8zM3 11v4',                                             // megaphone (Info Sec)
];
function PositionSection({ p, i, vis, ended, onProfile }) {
  const cands = p.candidates || [];
  const two = cands.length === 2;
  return (
    <div className="animate-fade-up">
      <div className="rounded-2xl px-5 py-4 flex items-center gap-3 text-white shadow-lg" style={{ background: `linear-gradient(120deg,${C.deep},${C.green})`, border: '1px solid rgba(212,167,44,0.35)' }}>
        <span className="w-11 h-11 rounded-xl grid place-items-center shrink-0" style={{ background: 'rgba(212,167,44,0.18)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d={POS_ICONS[i % POS_ICONS.length]} stroke="#F3E4B3" strokeWidth="1.7" strokeLinejoin="round" /></svg>
        </span>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-[#F3E4B3]/80">Position {i + 1}</div>
          <h3 style={mont} className="text-xl sm:text-2xl font-extrabold uppercase">{p.title} Election</h3>
        </div>
      </div>

      {two ? (
        <div className="mt-5 grid md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
          <CandidateCard c={cands[0]} vis={vis} ended={ended} onProfile={onProfile} />
          <VS />
          <CandidateCard c={cands[1]} vis={vis} ended={ended} onProfile={onProfile} />
        </div>
      ) : (
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cands.map(c => <CandidateCard key={c.id} c={c} vis={vis} ended={ended} onProfile={onProfile} />)}
          {!cands.length && <p className="text-gray-400 col-span-full text-center py-6">No candidates added yet.</p>}
        </div>
      )}
    </div>
  );
}
function VS() {
  return <div className="flex md:flex-col items-center justify-center gap-2 py-1">
    <span className="w-14 h-14 rounded-full grid place-items-center text-white font-black shadow-lg" style={{ background: C.black, border: '2px solid #D4A72C', ...mont }}>VS</span>
  </div>;
}

function CandidateCard({ c, vis, ended, onProfile }) {
  if (!c) return <div />;
  const hidden = vis === 'hidden' || c.percent == null && c.votes == null && !c.status_badge;
  const elected = c.elected;
  const badge = c.status_badge;
  const glow = elected ? { boxShadow: '0 0 0 2px #D4A72C, 0 20px 60px -18px rgba(212,167,44,0.6)' } : {};
  return (
    <div className="relative rounded-3xl p-5 text-white transition-transform hover:-translate-y-1 shadow-2xl"
      style={{ background: `linear-gradient(165deg,${C.deep},${C.black})`, border: '1px solid rgba(212,167,44,0.35)', ...glow }}>
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow"
            style={{ background: elected || badge === 'ELECTED' ? 'linear-gradient(180deg,#F3E4B3,#D4A72C)' : (badge === 'LEADING' ? 'linear-gradient(180deg,#F3E4B3,#D4A72C)' : 'rgba(255,255,255,0.12)'),
              color: badge === 'TRAILING' ? '#fff' : '#063D2B', ...mont }}>
            {badge === 'LEADING' && <TrendIcon />}{badge === 'ELECTED' && '🏆 '}{badge}
          </span>
        </div>
      )}
      <div className="flex flex-col items-center text-center pt-2">
        <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-[#D4A72C]/60 bg-white/5">
          <img src={c.photo_url || '/tnr-logo.png'} alt={c.name} className="w-full h-full object-cover" />
        </div>
        <h4 style={mont} className="mt-3 text-lg font-extrabold">{c.name}</h4>
        <div className="flex items-center gap-2 mt-1 text-xs">
          <span className="px-2 py-0.5 rounded-full font-bold" style={{ color: C.gold, background: 'rgba(212,167,44,0.14)' }}>#{c.number}</span>
          {c.symbol && <span className="px-2 py-0.5 rounded-full text-[#F3E4B3]" style={{ background: 'rgba(212,167,44,0.10)' }}>{c.symbol}</span>}
        </div>
        {(c.region || c.qualification) && <div className="mt-2 text-xs text-white/60">{[c.region, c.qualification].filter(Boolean).join(' · ')}</div>}
        {c.manifesto && <p className="mt-2 text-sm text-white/75 line-clamp-2">{c.manifesto}</p>}
      </div>

      <div className="mt-4">
        {hidden ? (
          <div className="text-center py-2 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.06)', color: C.softGold }}>
            🔒 Voting in Progress
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-white/70">{c.votes != null ? `${c.votes} votes` : 'Share'}</span>
              {c.percent != null && <span style={{ ...mont, color: C.gold }} className="font-extrabold">{c.percent}%</span>}
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.percent || 0}%`, background: 'linear-gradient(90deg,#0B6B4F,#D4A72C)' }} />
            </div>
            {c.margin != null && badge && badge !== 'TIED' && (
              <div className="mt-1.5 text-xs text-white/60">{badge === 'ELECTED' ? `Won by ${c.margin} votes` : `${badge} by ${c.margin} votes`}</div>
            )}
          </>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={() => onProfile(c)} className="flex-1 py-2 rounded-xl text-sm font-semibold border border-white/15 hover:bg-white/5 transition">View Profile</button>
        <a href="/vote" className="flex-1 py-2 rounded-xl text-sm font-bold text-center text-[#063D2B]" style={{ background: 'linear-gradient(180deg,#F3E4B3,#D4A72C)' }}>Vote Now</a>
      </div>
    </div>
  );
}
function TrendIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 17l6-6 4 4 8-8M21 7h-5M21 7v5" stroke="#063D2B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }

/* ─────────────────────────── Live overview ─────────────────────────── */
function LiveOverview({ e, stats }) {
  const close = e?.ends_at ? new Date(e.ends_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
  const items = [
    ['Registered Voters', stats?.total_voters ?? '—', C.green],
    ['Votes Submitted', stats?.votes_cast ?? '—', C.gold],
    ['Remaining Voters', stats?.remaining ?? '—', C.green],
    ['Voter Turnout', stats != null ? `${stats.turnout}%` : '—', C.gold],
  ];
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <SectionTitle kicker="TRANSPARENCY" title="Live Election Overview" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {items.map(([l, v, col]) => (
          <div key={l} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 text-center">
            <div style={{ ...mont, color: col }} className="text-3xl font-black">{v}</div>
            <div className="text-xs uppercase tracking-wider text-gray-400 mt-1">{l}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        {e?.voting_open ? <>Voting closes on <b className="text-[#063D2B]">{close}</b></> : e?.ended ? 'Voting has closed.' : 'Voting has not opened yet.'}
      </div>
    </section>
  );
}

/* ─────────────────────────── Process / About / Contact ─────────────────────────── */
function Process({ onRules }) {
  const steps = [
    ['Verify', 'Enter your registered mobile number and confirm the OTP sent to your WhatsApp.'],
    ['Review', 'See every candidate — profile, symbol, and manifesto — for each position.'],
    ['Vote', 'Select one candidate per position and confirm. Your vote is final and private.'],
    ['Receipt', 'Get a unique receipt code confirming your vote was securely recorded.'],
  ];
  return <section id="process" className="max-w-6xl mx-auto px-4 py-12">
    <SectionTitle kicker="HOW IT WORKS" title="The Election Process" />
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {steps.map(([t, d], i) => (
        <div key={t} className="rounded-2xl p-5 text-white shadow-lg" style={{ background: `linear-gradient(165deg,${C.deep},${C.black})`, border: '1px solid rgba(212,167,44,0.3)' }}>
          <div className="w-9 h-9 rounded-full grid place-items-center font-black text-[#063D2B]" style={{ background: 'linear-gradient(180deg,#F3E4B3,#D4A72C)', ...mont }}>{i + 1}</div>
          <h4 style={mont} className="mt-3 font-bold text-[#F3E4B3]">{t}</h4>
          <p className="text-sm text-white/70 mt-1">{d}</p>
        </div>
      ))}
    </div>
    <div className="text-center mt-6"><button onClick={onRules} className="px-6 py-3 rounded-xl font-bold text-[#063D2B] border-2 border-[#063D2B]/15 hover:bg-[#063D2B]/5">Read Full Election Rules</button></div>
  </section>;
}
function About() {
  return <section id="about" className="max-w-4xl mx-auto px-4 py-12 text-center">
    <SectionTitle kicker="ABOUT" title="Tahreek-e-Nojawanan Roundu" />
    <p className="mt-6 text-gray-600 text-lg leading-relaxed">A youth movement built on <b className="text-[#0B6B4F]">unity</b>, <b className="text-[#0B6B4F]">awareness</b>, and <b className="text-[#0B6B4F]">action</b>. This portal ensures every member's voice is heard through a secure, transparent, and fair internal election — one member, one vote.</p>
  </section>;
}
function Contact() {
  return <section id="contact" className="max-w-4xl mx-auto px-4 pb-14">
    <div className="rounded-3xl p-8 text-center text-white shadow-xl" style={{ background: `linear-gradient(120deg,${C.deep},${C.green})`, border: '1px solid rgba(212,167,44,0.35)' }}>
      <h3 style={mont} className="text-2xl font-black">Questions about the election?</h3>
      <p className="text-white/75 mt-2">Reach the TNR Election Committee for help with verification or eligibility.</p>
      <div className="mt-5 flex flex-wrap gap-3 justify-center">
        <a href="/vote" className="px-6 py-3 rounded-xl font-bold text-[#063D2B]" style={{ background: 'linear-gradient(180deg,#F3E4B3,#D4A72C)' }}>Cast Your Vote</a>
        <a href="/results" className="px-6 py-3 rounded-xl font-bold border border-white/30 hover:bg-white/10">View Results</a>
      </div>
    </div>
  </section>;
}
function Footer2({ org }) {
  return <footer className="border-t border-gray-100 py-6 text-center text-gray-400 text-xs">
    © {new Date().getFullYear()} {org?.name || 'Tahreek-e-Nojawanan Roundu'} ({org?.short_name || 'TNR'}) · Secure & private voting · <a href="/admin" className="text-[#0B6B4F] hover:underline">Admin</a>
  </footer>;
}

/* ─────────────────────────── Modals ─────────────────────────── */
function Modal({ children, onClose }) {
  return <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
    <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-pop shadow-2xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>{children}</div>
  </div>;
}
function ProfileModal({ c, onClose }) {
  const R = ({ k, v }) => v ? <div className="flex gap-2 py-2 border-b border-gray-100 text-sm"><span className="text-gray-400 w-28">{k}</span><span className="text-[#15231D] flex-1 font-medium">{v}</span></div> : null;
  return <Modal onClose={onClose}>
    <div className="text-center">
      <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto ring-2 ring-[#D4A72C]/50">
        <img src={c.photo_url || '/tnr-logo.png'} className="w-full h-full object-cover" alt="" /></div>
      <h3 style={mont} className="text-xl font-black text-[#063D2B] mt-3">{c.name}</h3>
      <div className="text-sm text-[#D4A72C] font-bold">Candidate #{c.number}{c.symbol ? ` · ${c.symbol}` : ''}</div>
    </div>
    <div className="mt-4">
      <R k="Region" v={c.region} /><R k="Qualification" v={c.qualification} /><R k="Manifesto" v={c.manifesto} />
      {c.percent != null && <R k="Vote Share" v={`${c.percent}%${c.votes != null ? ` (${c.votes} votes)` : ''}`} />}
    </div>
    <div className="mt-5 flex gap-2">
      <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold border border-gray-200 text-gray-600">Close</button>
      <a href="/vote" className="flex-1 py-2.5 rounded-xl font-bold text-center text-[#063D2B]" style={{ background: 'linear-gradient(180deg,#F3E4B3,#D4A72C)' }}>Vote Now</a>
    </div>
  </Modal>;
}
function RulesModal({ onClose }) {
  const rules = [
    'Only registered and approved TNR members may vote.',
    'Each member votes using their registered mobile number and a one-time OTP.',
    'One member = one vote per position. Votes cannot be changed once submitted.',
    'Candidate details are shown only after successful OTP verification.',
    'Voting is only possible between the official start and end times.',
    'For fairness, exact vote totals may be hidden until the election closes.',
    'Your vote is secret — no one can see which candidate you chose.',
  ];
  return <Modal onClose={onClose}>
    <h3 style={mont} className="text-xl font-black text-[#063D2B]">Election Rules</h3>
    <ul className="mt-4 space-y-2.5">
      {rules.map((r, i) => <li key={i} className="flex gap-2.5 text-sm text-gray-700">
        <span className="mt-0.5 text-[#0B6B4F]">✔</span><span>{r}</span></li>)}
    </ul>
    <button onClick={onClose} className="mt-5 w-full py-2.5 rounded-xl font-bold text-[#063D2B]" style={{ background: 'linear-gradient(180deg,#F3E4B3,#D4A72C)' }}>Got it</button>
  </Modal>;
}

/* keep dark-theme pages working (results/dashboard import Footer from here) */
export function Footer({ t, rtl }) {
  return <footer className="border-t border-tnr-line py-6 text-center text-tnr-cream/50 text-xs">
    © {new Date().getFullYear()} {t?.org || 'Tahreek-e-Nojawanan Roundu'} ({t?.short || 'TNR'}) · <a href="/admin" className="text-tnr-gold hover:underline">Admin</a>
  </footer>;
}
