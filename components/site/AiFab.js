'use client';
import { useState, useEffect } from 'react';

const mont = { fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif' };

// Floating "Ask TNR AI" button — bottom-left, WhatsApp-CTA style.
export default function AiFab() {
  const [show, setShow] = useState(false);   // label bubble
  useEffect(() => { const t = setTimeout(() => setShow(true), 1200); return () => clearTimeout(t); }, []);

  return (
    <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-[60] flex items-center gap-2 flex-row-reverse">
      <a href="/tnr-ai" aria-label="Ask TNR AI"
        className="relative grid place-items-center w-14 h-14 rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(145deg,#0B6B4F,#063D2B)', border: '2px solid #D4A72C' }}>
        {/* pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: '#D4A72C' }} />
        {/* AI spark icon */}
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="relative">
          <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" fill="#F3E4B3" />
          <path d="M18.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" fill="#D4A72C" />
        </svg>
      </a>

      {show && (
        <a href="/tnr-ai"
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white shadow-xl border border-gray-100 animate-fade-up">
          <span style={mont} className="text-sm font-extrabold text-[#063D2B] whitespace-nowrap">Ask TNR AI</span>
          <span className="text-[11px] text-gray-400 whitespace-nowrap">How can I help?</span>
          <button onClick={(e) => { e.preventDefault(); setShow(false); }} aria-label="close"
            className="ml-1 text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>
        </a>
      )}
    </div>
  );
}
