'use client';
import SiteNav from '@/components/site/SiteNav';
import SiteFooter from '@/components/site/SiteFooter';
import AiFab from '@/components/site/AiFab';

// TNR main website homepage — intentionally blank for now.
// The complete election system lives at /election-portal (unchanged).
// The dark `Footer` below is still exported here because /results and
// /dashboard import it — do not remove it.

const C = { deep: '#063D2B', gold: '#D4A72C', ink: '#15231D', bg: '#FDFDFD' };
const mont = { fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif' };

export default function Home() {
  return (
    <main style={{ background: C.bg, color: C.ink, fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif' }}
      className="min-h-screen flex flex-col">
      <SiteNav />

      <section className="flex-1 grid place-items-center px-4 py-24 text-center">
        <div>
          <img src="/tnr-logo.png" alt="TNR" className="w-24 h-24 mx-auto object-contain" />
          <h1 style={mont} className="mt-6 text-3xl sm:text-4xl font-black text-[#063D2B]">
            Tehreek-e-Nojawanan Roundu
          </h1>
          <p style={mont} className="mt-4 text-lg sm:text-xl font-extrabold text-[#0B6B4F]">
            TNR Global Digital Community Platform
          </p>
          <p className="mt-2 text-gray-500 max-w-xl mx-auto leading-relaxed">
            Currently under development — building a connected digital future for the global Rondo community.
          </p>
          <a href="/election-portal" className="inline-block mt-8 px-6 py-3 rounded-xl font-bold text-[#063D2B] shadow"
            style={{ background: 'linear-gradient(180deg,#F3E4B3,#D4A72C)' }}>
            Go to Election Portal →
          </a>
        </div>
      </section>

      <SiteFooter />
      <AiFab />
    </main>
  );
}

// Shared dark footer used by /results and /dashboard — keep this export.
export function Footer({ t, rtl }) {
  return <footer className="border-t border-tnr-line py-6 text-center text-tnr-cream/50 text-xs">
    © {new Date().getFullYear()} {t?.org || 'Tehreek-e-Nojawanan Roundu'} ({t?.short || 'TNR'}) · Developed by: <a href="https://www.northdigitaltech.com/" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline" style={{ color: '#4FC3F7' }}>Shabbir Hussain</a>
  </footer>;
}
