'use client';
import { useEffect, useState } from 'react';
import Avatar from '@/components/member/Avatar';
import SiteNav from '@/components/site/SiteNav';
import SiteFooter from '@/components/site/SiteFooter';

const C = { deep: '#063D2B', green: '#0B6B4F', gold: '#D4A72C' };
const mont = { fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif' };

export default function DirectoryPage() {
  const [d, setD] = useState(null);
  const [search, setSearch] = useState('');
  const [uc, setUc] = useState('');
  const [prof, setProf] = useState('');

  const load = () => {
    const q = new URLSearchParams({ search, union_council: uc, profession: prof });
    fetch('/api/public/members?' + q, { cache: 'no-store' }).then(r => r.json()).then(r => r.ok && setD(r));
  };
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t);
    /* eslint-disable-next-line */ }, [search, uc, prof]);

  const sel = 'rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0B6B4F] bg-white';

  return (
    <main className="light-page min-h-screen flex flex-col bg-[#FDFDFD]" style={{ color: '#15231D', ...mont }}>
      <SiteNav />

      <section className="text-white py-14" style={{ background: `linear-gradient(165deg,${C.deep},#04241A)` }}>
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <h1 style={mont} className="text-3xl sm:text-4xl font-black uppercase">Our Members</h1>
          <p className="mt-3 text-white/60 max-w-xl mx-auto text-sm">
            Members of Tehreek-e-Nojawanan Roundu who have chosen to appear publicly.
          </p>
          {d && <div className="mt-6 text-3xl font-black" style={{ color: '#F3E4B3' }}>{d.total}</div>}
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 py-10 w-full">
        <div className="flex flex-wrap gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, village or profession"
            className={sel + ' flex-1 min-w-[220px]'} />
          <select value={uc} onChange={e => setUc(e.target.value)} className={sel}>
            <option value="">All Union Councils</option>
            {(d?.union_councils || []).map(x => <option key={x} value={x}>{x}</option>)}
          </select>
          <select value={prof} onChange={e => setProf(e.target.value)} className={sel}>
            <option value="">All Professions</option>
            {(d?.professions || []).map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>

        {!d && <p className="mt-8 text-sm text-gray-400">Loading…</p>}

        {d && d.members.length === 0 && (
          <div className="mt-8 rounded-2xl bg-white border border-gray-100 shadow-sm p-10 text-center">
            <div className="text-4xl">👥</div>
            <h3 style={{ ...mont, color: C.deep }} className="mt-2 font-extrabold">No public members yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Members appear here once they enable public visibility in their profile settings.
            </p>
          </div>
        )}

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(d?.members || []).map(m => (
            <div key={m.membership_id} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 text-center">
              <Avatar src={m.photo_url} name={m.full_name} fontSize={24}
                className="w-20 h-20 mx-auto rounded-full object-cover ring-2 ring-[#D4A72C]/60 bg-gray-50" />
              <h3 style={{ ...mont, color: C.deep }} className="mt-3 font-extrabold text-sm">{m.full_name}</h3>
              {m.current_position && <div className="text-xs text-gray-500 mt-0.5">{m.current_position}</div>}
              <div className="text-[11px] text-gray-400 mt-1">
                {[m.village, m.union_council].filter(Boolean).join(' · ')}
              </div>
              <div className="mt-3 inline-block px-3 py-1 rounded-full text-[10px] font-bold"
                style={{ background: '#0B6B4F14', color: C.green }}>
                ✔ {m.category || 'Verified Member'}
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
