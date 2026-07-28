'use client';
import { NAV, FOOTER_LINKS } from './navConfig';

const mont = { fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif' };

export default function SiteFooter() {
  const cols = NAV.filter(n => n.items).slice(0, 4);
  return (
    <footer className="mt-auto">
      <div style={{ background: '#063D2B' }} className="text-white">
        <div className="max-w-[1400px] mx-auto px-4 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="w-11 h-11 rounded-full grid place-items-center bg-white ring-2 ring-[#D4A72C] overflow-hidden">
                <img src="/tnr-logo.png" alt="TNR" className="w-full h-full object-contain p-0.5" />
              </span>
              <span style={mont} className="font-extrabold">TNR</span>
            </div>
            <p className="mt-3 text-sm text-white/60 leading-relaxed">
              Tehreek-e-Nojawanan Roundu — serving the Rondo community through education,
              welfare, and youth empowerment.
            </p>
          </div>
          {cols.map(c => (
            <div key={c.label}>
              <h4 style={mont} className="text-[13px] font-bold uppercase tracking-wider text-[#F3E4B3]">{c.label}</h4>
              <ul className="mt-3 space-y-1.5">
                {c.items.slice(0, 6).map(([l, h]) => (
                  <li key={l}><a href={h} className="text-sm text-white/60 hover:text-white transition">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 py-4 flex flex-wrap gap-x-4 gap-y-2 justify-center">
            {FOOTER_LINKS.map(([l, h]) => (
              <a key={l} href={h} className="text-xs text-white/50 hover:text-white transition">{l}</a>
            ))}
          </div>
        </div>
      </div>

      <div className="py-5 text-center text-xs text-white" style={{ background: '#000000' }}>
        © {new Date().getFullYear()} Tehreek-e-Nojawanan Roundu (TNR) · Developed by:{' '}
        <a href="https://www.northdigitaltech.com/" target="_blank" rel="noopener noreferrer"
          className="font-semibold hover:underline" style={{ color: '#4FC3F7' }}>Shabbir Hussain</a>
      </div>
    </footer>
  );
}
