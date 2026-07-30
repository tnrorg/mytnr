'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Avatar from '@/components/member/Avatar';
import SiteNav from '@/components/site/SiteNav';
import SiteFooter from '@/components/site/SiteFooter';

const C = { deep: '#063D2B', green: '#0B6B4F', gold: '#D4A72C' };
const mont = { fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif' };

export default function PublicMemberProfile() {
  const { id } = useParams();
  const [m, setM] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch(`/api/public/member-profile/${id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(j => j?.ok ? setM(j.member) : setErr(j?.message || 'Profile not found.'))
      .catch(() => setErr('Profile not found.'));
  }, [id]);

  const Row = ({ k, v }) => v ? (
    <div className="flex justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs uppercase tracking-wide text-gray-400 font-bold">{k}</span>
      <span className="text-sm text-gray-700 text-right">{v}</span>
    </div>
  ) : null;

  return (
    <main id="main" className="light-page min-h-screen flex flex-col bg-[#FDFDFD]" style={{ color: '#15231D', ...mont }}>
      <SiteNav />
      <section className="max-w-2xl mx-auto px-4 py-12 w-full flex-1">
        <a href="/members" className="text-xs font-semibold" style={{ color: C.green }}>← Back to Members</a>

        {err && <div className="mt-6 rounded-2xl bg-white border border-gray-100 p-10 text-center">
          <h1 className="font-extrabold" style={{ color: C.deep }}>{err}</h1>
          <p className="mt-1 text-sm text-gray-500">This member may have chosen to keep their profile private.</p>
        </div>}

        {!m && !err && <div className="mt-6 h-80 rounded-2xl bg-gray-100 animate-pulse" />}

        {m && <div className="mt-6 rounded-2xl bg-white border border-gray-100 p-8 text-center">
          <Avatar src={m.photo_url} name={m.full_name} fontSize={34}
            className="w-28 h-28 mx-auto rounded-full object-cover ring-2 ring-[#D4A72C]/60 bg-gray-50" />
          <h1 className="mt-4 text-2xl font-black" style={{ color: C.deep }}>{m.full_name}</h1>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
            style={{ background: 'rgba(200,154,43,.14)', color: '#7A5C10' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l2.4 1.8 3-.3 1 2.8 2.6 1.5-1 2.9 1 2.9-2.6 1.5-1 2.8-3-.3L12 22l-2.4-1.8-3 .3-1-2.8L3 16.2l1-2.9-1-2.9 2.6-1.5 1-2.8 3 .3L12 2z"/>
              <path d="M10.6 14.6l-2.2-2.2 1.1-1.1 1.1 1.1 3.4-3.4 1.1 1.1-4.5 4.5z" fill="#fff"/>
            </svg>
            Verified Member
          </div>

          <div className="mt-6 text-left">
            <Row k="Profession" v={m.current_position} />
            <Row k="Village / Area" v={m.village} />
            <Row k="Union Council" v={m.union_council} />
            <Row k="Education" v={m.education_level} />
            <Row k="Category" v={m.category} />
          </div>

          {!!(m.contribution_areas || []).length && <div className="mt-6 text-left">
            <div className="text-xs uppercase tracking-wide text-gray-400 font-bold">Contribution Interests</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {m.contribution_areas.map(t => (
                <span key={t} className="rounded-full px-3 py-1 text-xs text-gray-600" style={{ background: '#F6FAF8' }}>{t}</span>
              ))}
            </div>
          </div>}
        </div>}
      </section>
      <SiteFooter />
    </main>
  );
}
