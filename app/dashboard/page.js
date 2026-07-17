'use client';
import { useEffect, useState } from 'react';
import { useLang } from '@/components/useLang';
import { BrandHeader } from '@/components/Brand';
import { Footer } from '@/app/page';

export default function Dashboard() {
  const { lang, toggle, t } = useLang();
  const rtl = lang === 'ur';
  const [s, setS] = useState(null);
  const load = () => fetch('/api/public/stats?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()).then(setS).catch(() => {});
  useEffect(() => { load(); const id = setInterval(load, 15000); return () => clearInterval(id); }, []);
  const pct = s?.participation || 0;

  return (
    <main className="min-h-screen flex flex-col" dir={rtl ? 'rtl' : 'ltr'}>
      <BrandHeader lang={lang} onToggle={toggle} t={t} />
      <section className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className={`text-3xl font-black heading-gold ${rtl ? 'urdu' : ''}`}>{t.liveDashboard}</h1>
            {s?.election && <p className="text-tnr-cream/60">{s.election.title}</p>}</div>
          <span className="chip bg-tnr-green2/50 text-tnr-goldLight border border-tnr-line"><span className="w-2 h-2 rounded-full bg-tnr-gold animate-pulse" />Live</span>
        </div>
        {!s?.election && <p className="text-tnr-cream/50">No active election.</p>}
        {s?.election && <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <KPI label={t.totalVoters} value={s.total_voters} />
            <KPI label={t.votesCast} value={s.votes_cast} gold />
            <KPI label={t.remaining} value={s.remaining} />
            <KPI label={t.participation} value={`${s.participation}%`} gold />
          </div>
          <div className="card p-8 flex flex-col items-center">
            <Ring pct={pct} />
            <p className={`mt-4 text-tnr-cream/70 text-center ${rtl ? 'urdu' : ''}`}>
              {s.votes_cast} / {s.total_voters} {rtl ? 'اراکین نے ووٹ ڈالا' : 'members have voted'}</p>
            {s.fairness_note && <div className={`mt-5 chip bg-tnr-gold/15 text-tnr-goldLight border border-tnr-line text-center ${rtl ? 'urdu' : ''}`}>🔒 {t.resultsHidden}</div>}
            {s.results_visible && <a href="/results" className="btn-gold mt-5">{t.results}</a>}
          </div>
        </>}
      </section>
      <Footer t={t} rtl={rtl} />
    </main>
  );
}
function KPI({ label, value, gold }) {
  return <div className="stat items-center text-center">
    <div className={`text-3xl font-black ${gold ? 'text-tnr-gold' : 'text-tnr-cream'}`}>{value}</div>
    <div className="text-[11px] uppercase tracking-wider text-tnr-cream/50">{label}</div></div>;
}
function Ring({ pct }) {
  const R = 84, C = 2 * Math.PI * R, off = C - (pct / 100) * C;
  return <svg width="220" height="220" viewBox="0 0 220 220" className="animate-fade-up">
    <circle cx="110" cy="110" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" />
    <circle cx="110" cy="110" r={R} fill="none" stroke="url(#gr)" strokeWidth="16" strokeLinecap="round"
      strokeDasharray={C} strokeDashoffset={off} transform="rotate(-90 110 110)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
    <defs><linearGradient id="gr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#12603F" /><stop offset="1" stopColor="#E4C25B" /></linearGradient></defs>
    <text x="110" y="104" textAnchor="middle" fontSize="40" fontWeight="800" fill="#E4C25B">{pct}%</text>
    <text x="110" y="132" textAnchor="middle" fontSize="13" fill="rgba(247,245,238,0.6)">participation</text>
  </svg>;
}
