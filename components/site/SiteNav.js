'use client';
import { useState, useEffect, useRef } from 'react';
import { NAV } from './navConfig';

const G = '#063D2B', GOLD = '#D4A72C';
const mont = { fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif' };

/* A dropdown entry. Planned pages render as a non-clickable row with a "Soon"
   chip rather than a link to a 404 — the roadmap stays visible and honest. */
function NavLink({ item, onNavigate, className }) {
  if (item.soon) return (
    <span className={`${className} flex items-center justify-between cursor-default text-gray-400`}
      aria-disabled="true">
      {item.label}
      <span className="ml-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide
        bg-gray-100 text-gray-400">Soon</span>
    </span>
  );
  return <a href={item.href} onClick={onNavigate} className={className}>{item.label}</a>;
}

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

  // Full-screen mobile menu: stop the page behind it from scrolling.
  useEffect(() => {
    document.body.style.overflow = mobile ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobile]);

  return (
    <>
    {/* Utility bar */}
    <div className="hidden sm:block text-white text-[12px]" style={{ background: '#052A1E' }}>
      <div className="max-w-[1400px] mx-auto px-4 py-1.5 flex items-center gap-4">
        <span className="text-white/70">Uniting the Rondo Community Worldwide</span>
        <div className="ml-auto flex items-center gap-4">
          <a href="/help" className="text-white/70 hover:text-white transition">Help Center</a>
          <a href="/contact" className="text-white/70 hover:text-white transition">Contact Us</a>
          <div className="flex items-center gap-2">
            {[['f','https://facebook.com'],['t','https://twitter.com'],['y','https://youtube.com'],['in','https://linkedin.com'],['ig','https://instagram.com']].map(([l,h]) => (
              <a key={l} href={h} target="_blank" rel="noopener noreferrer"
                className="w-5 h-5 rounded grid place-items-center bg-white/10 hover:bg-[#D4A72C] hover:text-[#063D2B] transition text-[10px] font-bold">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm relative">
      <div ref={ref} className="max-w-[1400px] mx-auto px-4 py-2.5 flex items-center gap-3">
        {/* Mobile: REGISTER on the LEFT */}
        <a href="/membership/apply" aria-label="Register" title="Register"
          className="xl:hidden grid place-items-center w-10 h-10 rounded-full text-[#063D2B] shadow shrink-0"
          style={{ background: 'linear-gradient(180deg,#F3E4B3,#D4A72C)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="8" r="3.4" stroke="currentColor" strokeWidth="2" />
            <path d="M2.8 20c0-3.4 2.8-5.6 6.2-5.6s6.2 2.2 6.2 5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M18.5 8.5v5M21 11h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </a>

        {/* Logo — centred on mobile, left on desktop */}
        <a href="/" className="flex items-center gap-2.5 shrink-0 absolute left-1/2 -translate-x-1/2 xl:static xl:translate-x-0">
          <span className="w-10 h-10 rounded-full grid place-items-center bg-white ring-2 ring-[#D4A72C] overflow-hidden shadow">
            <img src="/tnr-logo.png" alt="TNR" className="w-full h-full object-contain p-0.5" />
          </span>
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
                    {n.items.map(item => (
                      <NavLink key={item.label} item={item}
                        className="block px-4 py-2 text-sm text-gray-600 hover:text-[#0B6B4F] hover:bg-[#0B6B4F]/5 transition-colors duration-micro" />
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
          <a href="/member/login" className="hidden xl:inline-block px-3 py-2 rounded-xl text-[13px] font-semibold text-[#063D2B] border border-[#063D2B]/15 hover:bg-[#063D2B]/5">LOGIN</a>
          <a href="/membership/apply" aria-label="Register" title="Register"
            className="hidden xl:grid place-items-center w-10 h-10 rounded-full text-[#063D2B] shadow"
            style={{ background: 'linear-gradient(180deg,#F3E4B3,#D4A72C)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="8" r="3.4" stroke="currentColor" strokeWidth="2" />
              <path d="M2.8 20c0-3.4 2.8-5.6 6.2-5.6s6.2 2.2 6.2 5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M18.5 8.5v5M21 11h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </a>
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
    </header>

      {mobile && (
        <div className="xl:hidden fixed inset-x-0 top-[61px] bottom-0 z-[45] bg-white overflow-y-auto overscroll-contain">
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
                      {n.items.map(item => (
                        <NavLink key={item.label} item={item} onNavigate={() => setMobile(false)}
                          className="block px-7 py-2.5 text-sm text-gray-600" />
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
          <a href="/member/login" className="block px-4 py-3 text-sm font-semibold text-[#063D2B]">LOGIN</a>
        </div>
      )}
    </>
  );
}
