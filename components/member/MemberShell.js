'use client';
import { useEffect, useState } from 'react';
import { mGet, mPost, clearToken, getToken } from './memberApi';

const C = { deep: '#063D2B', green: '#0B6B4F', gold: '#D4A72C', soft: '#F3E4B3', ink: '#15231D' };
const mont = { fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif' };

export const NAV = [
  ['Dashboard', '/member/dashboard', '🏠'],
  ['My Profile', '/member/profile', '👤'],
  ['CV Builder', '/member/cv-builder', '📄'],
  ['Cover Letters', '/member/cover-letters', '✉️'],
  ['Membership Card', '/member/membership-card', '🪪'],
  ['Documents & Certificates', '/member/certificates', '🎓'],
  ['Jobs & Scholarships', '/member/opportunities', '💼'],
  ['Events & Programs', '/member/events', '📅'],
  ['Volunteer Activities', '/member/volunteer', '🤝'],
  ['Applications History', '/member/applications', '📋'],
  ['Notifications', '/member/notifications', '🔔'],
  ['Help & Support', '/member/support', '💬'],
  ['Account Settings', '/member/settings', '⚙️'],
];

// Protected shell for every /member/* page.
export default function MemberShell({ active, children }) {
  const [member, setMember] = useState(null);
  const [state, setState] = useState('loading');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) { window.location.href = '/member/login'; return; }
    mGet('/api/member/me').then(r => {
      if (r?.ok) { setMember(r.member); setState('ok'); }
      else setState('denied');
    });
  }, []);

  if (state === 'loading') return <div className="min-h-screen grid place-items-center text-gray-400" style={mont}>Loading…</div>;
  if (state === 'denied') return null;   // memberApi already redirected

  const signOut = () => { clearToken(); window.location.href = '/member/login'; };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F7F9F8]" style={{ color: C.ink, ...mont }}>
      {/* Sidebar */}
      <aside className="lg:w-64 lg:min-h-screen bg-white border-b lg:border-b-0 lg:border-r border-gray-100">
        <div className="p-4 flex items-center gap-3 border-b border-gray-100">
          <a href="/" className="w-10 h-10 rounded-full grid place-items-center bg-white ring-2 ring-[#D4A72C] overflow-hidden shrink-0">
            <img src="/tnr-logo.png" alt="TNR" className="w-full h-full object-contain p-0.5" />
          </a>
          <div className="min-w-0">
            <div style={{ ...mont, color: C.deep }} className="font-extrabold text-sm truncate">{member?.full_name}</div>
            <div className="text-[10px] font-mono" style={{ color: C.green }}>{member?.membership_id}</div>
          </div>
          <button className="lg:hidden ml-auto p-2 text-gray-500" onClick={() => setOpen(!open)} aria-label="menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        <nav className={`${open ? 'block' : 'hidden'} lg:block p-2 space-y-0.5`}>
          {NAV.map(([label, href, icon]) => (
            <a key={href} href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition ${active === href
                ? 'text-white font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
              style={active === href ? { background: `linear-gradient(180deg,${C.green},${C.deep})` } : {}}>
              <span className="text-base">{icon}</span>{label}
            </a>
          ))}
          <button onClick={signOut} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 mt-2">
            <span>↩</span>Sign Out
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-4 sm:p-8 max-w-6xl">{typeof children === 'function' ? children(member) : children}</main>
    </div>
  );
}
