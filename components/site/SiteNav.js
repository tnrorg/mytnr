'use client';
import { useState, useEffect, useRef } from 'react';
import { NAV } from './navConfig';

const G = '#063D2B', GOLD = '#D4A72C';
const mont = { fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif' };

export default function SiteNav() {
  const [open, setOpen] = useState(null);      // desktop dropdown label
  const [mobile, setMobile] = useState(false);
  const [acc, setAcc] = useState(null);        // mobile accordion
  const [search, setSearch] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(null); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm relative">
      <div ref={ref} className="max-w-[1400px] mx-auto px-4 py-2.5 flex items-center gap-3">
        {/* Mobile: REGISTER on the LEFT */}
        <a href="/membership/join" className="xl:hidden px-3.5 py-2 rounded-xl text-[13px] font-bold text-[#063D2B] shadow whitespace-nowrap shrink-0"
          style={{ background: 'linear-gradient(180deg,#F3E4B3,#D4A72C)' }}>REGISTER</a>

        {/* Logo — centred on mobile, left on desktop */}
        <a href="/" className="flex items-center gap-2.5 shrink-0 absolute left-1/2 -translate-x-1/2 xl:static xl:translate-x-0">
          <span className="w-10 h-10 rounded-full grid place-items-center bg-white ring-2 ring-[#D4A72C] overflow-hidden shadow">
            <img src="/tnr-logo.png" alt="TNR" className="w-full h-full object-contain p-0.5" />
          </span>
          <span style={mont} className="font-extrabold text-[#063D2B] leading-tight text-sm sm:text-base">TNR</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden xl:flex items-center gap-0.5 mx-auto">
          {NAV.map(n => (
            <div key={n.label} className="relative"
              onMouseEnter={() => n.items && setOpen(n.label)}
              onMouseLeave={() => n.items && setOpen(null)}>
              <a href={n.href || '#'}
                className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-[13px] font-semibold uppercase tracking-wide transition whitespace-nowrap
                  ${n.highlight ? 'text-[#0B6B4F]' : 'text-gray-600'} hover:text-[#0B6B4F] hover:bg-[#0B6B4F]/5`}>
                {n.label}
                {n.items && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="opacity-50">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </a>
              {n.items && open === n.label && (
                <div className="absolute left-0 top-full pt-1 w-60">
                  <div className="rounded-2xl bg-white shadow-2xl border border-gray-100 py-2 animate-fade-up">
                    {n.items.map(([l, h]) => (
                      <a key={l} href={h} className="block px-4 py-2 text-sm text-gray-600 hover:text-[#0B6B4F] hover:bg-[#0B6B4F]/5 transition">{l}</a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => setSearch(!search)} aria-label="search"
            className="hidden xl:grid place-items-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          <a href="/membership/login" className="hidden xl:inline-block px-3 py-2 rounded-xl text-[13px] font-semibold text-[#063D2B] border border-[#063D2B]/15 hover:bg-[#063D2B]/5">LOGIN</a>
          <a href="/membership/join" className="hidden xl:inline-block px-3.5 py-2 rounded-xl text-[13px] font-bold text-[#063D2B] shadow whitespace-nowrap"
            style={{ background: 'linear-gradient(180deg,#F3E4B3,#D4A72C)' }}>REGISTER</a>
          <button className="xl:hidden p-2 -mr-1 text-gray-600" onClick={() => setMobile(!mobile)} aria-label="menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>

      {search && (
        <div className="border-t border-gray-100 bg-white px-4 py-3">
          <div className="max-w-[1400px] mx-auto">
            <input autoFocus placeholder="Search TNR — members, scholarships, jobs, news…"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0B6B4F]" />
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobile && (
        <div className="xl:hidden border-t border-gray-100 bg-white max-h-[75vh] overflow-auto">
          {NAV.map(n => (
            <div key={n.label} className="border-b border-gray-50">
              {n.items ? (
                <>
                  <button onClick={() => setAcc(acc === n.label ? null : n.label)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
                    {n.label}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={`transition ${acc === n.label ? 'rotate-180' : ''}`}>
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  {acc === n.label && (
                    <div className="pb-2 bg-gray-50/60">
                      {n.href && <a href={n.href} className="block px-7 py-2 text-sm font-semibold text-[#0B6B4F]">Open {n.label} →</a>}
                      {n.items.map(([l, h]) => (
                        <a key={l} href={h} onClick={() => setMobile(false)} className="block px-7 py-2 text-sm text-gray-600">{l}</a>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <a href={n.href} onClick={() => setMobile(false)}
                  className="block px-4 py-3 text-sm font-semibold uppercase tracking-wide text-gray-700">{n.label}</a>
              )}
            </div>
          ))}
          <a href="/membership/login" className="block px-4 py-3 text-sm font-semibold text-[#063D2B]">LOGIN</a>
        </div>
      )}
    </header>
  );
}
