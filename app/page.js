'use client';

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
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="w-10 h-10 rounded-full grid place-items-center bg-white ring-2 ring-[#D4A72C] overflow-hidden shadow">
              <img src="/tnr-logo.png" alt="TNR" className="w-full h-full object-contain p-0.5" />
            </span>
            <span style={mont} className="font-extrabold text-[#063D2B] leading-tight text-sm sm:text-base">TNR</span>
          </a>
          <nav className="hidden lg:flex items-center gap-1 mx-auto">
            <a href="/" className="px-3 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide text-gray-600 hover:text-[#0B6B4F] hover:bg-[#0B6B4F]/5 transition">Home</a>
            <a href="/election-portal" className="px-3 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide text-gray-600 hover:text-[#0B6B4F] hover:bg-[#0B6B4F]/5 transition">Election Portal</a>
          </nav>
          <a href="/election-portal" className="ml-auto lg:ml-0 px-4 py-2 rounded-xl text-sm font-bold text-[#063D2B] shadow"
            style={{ background: 'linear-gradient(180deg,#F3E4B3,#D4A72C)' }}>ELECTION PORTAL</a>
        </div>
      </header>

      <section className="flex-1 grid place-items-center px-4 py-24 text-center">
        <div>
          <img src="/tnr-logo.png" alt="TNR" className="w-24 h-24 mx-auto object-contain" />
          <h1 style={mont} className="mt-6 text-3xl sm:text-4xl font-black text-[#063D2B]">
            Tehreek-e-Nojawanan Roundu
          </h1>
          <p className="mt-3 text-gray-500">Website coming soon.</p>
          <a href="/election-portal" className="inline-block mt-8 px-6 py-3 rounded-xl font-bold text-[#063D2B] shadow"
            style={{ background: 'linear-gradient(180deg,#F3E4B3,#D4A72C)' }}>
            Go to Election Portal →
          </a>
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-white" style={{ background: '#000000' }}>
        © {new Date().getFullYear()} Tehreek-e-Nojawanan Roundu (TNR) · Developed by:{' '}
        <a href="https://www.northdigitaltech.com/" target="_blank" rel="noopener noreferrer"
          className="font-semibold hover:underline" style={{ color: '#4FC3F7' }}>Shabbir Hussain</a>
      </footer>
    </main>
  );
}

// Shared dark footer used by /results and /dashboard — keep this export.
export function Footer({ t, rtl }) {
  return <footer className="border-t border-tnr-line py-6 text-center text-tnr-cream/50 text-xs">
    © {new Date().getFullYear()} {t?.org || 'Tehreek-e-Nojawanan Roundu'} ({t?.short || 'TNR'}) · Developed by: <a href="https://www.northdigitaltech.com/" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline" style={{ color: '#4FC3F7' }}>Shabbir Hussain</a>
  </footer>;
}
