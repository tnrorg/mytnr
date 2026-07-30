'use client';
import { useEffect, useMemo, useState } from 'react';
import { Search, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton, EmptyState, VerifiedBadge } from '@/components/ui';
import { COLORS, FONT, MOTION } from '@/lib/design/tokens';
import { initials } from '@/content/advisoryCouncil';

const glass = 'rounded-tnr-lg border border-gray-100 bg-white/85 backdrop-blur-sm shadow-tnr-flat';

function Card({ m, i }) {
  const meta = [m.organisation || m.affiliation, m.country].filter(Boolean);
  return (
    <motion.article className={`${glass} flex flex-col overflow-hidden transition-all duration-standard
      hover:-translate-y-[3px] hover:shadow-tnr-raise hover:border-[rgba(23,107,73,.22)]`}
      initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: MOTION.reveal, delay: Math.min(i * 0.04, 0.3), ease: MOTION.ease }}>

      {/* Portrait fills the card width — at four across, a small left-aligned
          thumbnail left the row looking empty. */}
      <div className="relative aspect-[4/5] bg-gray-100">
        {m.photo_url
          ? <img src={m.photo_url} alt={m.name} loading="lazy" className="w-full h-full object-cover object-top" />
          : <div role="img" aria-label={m.name}
              className="w-full h-full grid place-items-center text-4xl font-extrabold text-white"
              style={{ background: `linear-gradient(140deg,${COLORS.green700},${COLORS.green950})` }}>
              <span aria-hidden="true">{initials(m.name || '')}</span>
            </div>}

        {m.designation && (
          <span className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm"
            style={{ background: 'rgba(6,45,33,.78)', color: COLORS.gold400 }}>
            {m.designation}
          </span>
        )}
        {m.verified !== false && (
          <span className="absolute top-3 right-3 grid place-items-center w-7 h-7 rounded-full backdrop-blur-sm"
            style={{ background: 'rgba(6,45,33,.78)' }} title="Verified member">
            <VerifiedBadge size={17} fill={COLORS.gold400} />
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-extrabold text-[15px] leading-snug" style={{ color: COLORS.green900 }}>
          {m.name}
        </h3>
        {(m.profession || m.qualification) && (
          <div className="mt-1 text-[12.5px] font-semibold leading-snug" style={{ color: COLORS.green700 }}>
            {m.profession || m.qualification}
          </div>
        )}
        {!!meta.length && (
          <div className="mt-1 text-[11.5px] leading-snug" style={{ color: COLORS.muted }}>
            {meta.join(' · ')}
          </div>
        )}

        {m.intro && (
          <p className="mt-2.5 text-[12px] leading-relaxed line-clamp-2" style={{ color: COLORS.muted }}>
            {m.intro}
          </p>
        )}

        {!!(m.expertise || []).length && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {m.expertise.slice(0, 2).map(e => (
              <span key={e} className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
                style={{ background: 'rgba(23,107,73,.08)', color: COLORS.green700 }}>{e}</span>
            ))}
            {m.expertise.length > 2 && (
              <span className="px-1 py-0.5 text-[10.5px]" style={{ color: COLORS.muted }}>
                +{m.expertise.length - 2}
              </span>
            )}
          </div>
        )}

        <a href={`/council/${m.slug}`}
          className="group mt-auto pt-4 inline-flex items-center justify-center gap-1.5 text-[12.5px] font-bold"
          style={{ color: COLORS.green700 }}>
          View Full Profile
          <ArrowRight size={13} strokeWidth={2.5} aria-hidden="true"
            className="transition-transform duration-micro group-hover:translate-x-0.5" />
        </a>
      </div>
    </motion.article>
  );
}

/** Council roster with search and filters. `limit` renders a homepage preview. */
export default function CouncilDirectory({ limit, showFilters = true }) {
  const [d, setD] = useState(null);
  const [f, setF] = useState({ q: '', country: '', profession: '', expertise: '' });
  const [openFilters, setOpenFilters] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      fetch('/api/public/council?' + new URLSearchParams(f), { cache: 'no-store' })
        .then(r => r.json()).then(j => j?.ok && setD(j)).catch(() => setD({ members: [], filters: {} }));
    }, 200);
    return () => clearTimeout(t);
  }, [f]);

  const members = useMemo(
    () => (limit ? (d?.members || []).slice(0, limit) : d?.members || []), [d, limit]);
  const active = Object.entries(f).filter(([k, v]) => k !== 'q' && v).length;
  const sel = 'rounded-tnr border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#176B49] bg-white';

  if (!d) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: limit || 8 }).map((_, i) => <Skeleton key={i} height="h-80" />)}
    </div>
  );

  return (
    <div style={FONT}>
      {showFilters && (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} strokeWidth={2.2} aria-hidden="true"
                className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: COLORS.muted }} />
              <input value={f.q} onChange={e => setF(s => ({ ...s, q: e.target.value }))}
                aria-label="Search council members"
                placeholder="Search by name, profession, expertise, organisation or country"
                className={sel + ' w-full pl-10'} />
            </div>
            <button onClick={() => setOpenFilters(o => !o)}
              className="sm:hidden inline-flex items-center gap-1.5 rounded-tnr px-4 text-sm font-bold text-white shrink-0"
              style={{ background: COLORS.green700 }}>
              <SlidersHorizontal size={15} strokeWidth={2.2} aria-hidden="true" />
              {active > 0 && <span>{active}</span>}
            </button>
          </div>

          <div className={`${openFilters ? 'grid' : 'hidden'} sm:grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2`}>
            {[['country', 'All Countries', 'countries'],
              ['profession', 'All Professions', 'professions'],
              ['expertise', 'All Expertise', 'expertise']].map(([key, label, list]) => (
              <select key={key} value={f[key]} aria-label={label} className={sel}
                onChange={e => setF(s => ({ ...s, [key]: e.target.value }))}>
                <option value="">{label}</option>
                {(d.filters?.[list] || []).map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            ))}
          </div>

          {(active > 0 || f.q) && (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-[12px]" style={{ color: COLORS.muted }}>
                {members.length} member{members.length === 1 ? '' : 's'}
              </span>
              <button onClick={() => setF({ q: '', country: '', profession: '', expertise: '' })}
                className="text-[12px] font-bold underline" style={{ color: COLORS.green700 }}>Clear</button>
            </div>
          )}
        </>
      )}

      {members.length === 0 ? (
        <EmptyState className="mt-6" icon="🎓"
          title={f.q || active ? 'No members match your search' : 'Council profiles coming soon'}
          message={f.q || active
            ? 'Try a different name, profession or country.'
            : 'Advisory Council profiles will appear here once published.'} />
      ) : (
        <div className={`${showFilters ? 'mt-6' : ''} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5`}>
          {members.map((m, i) => <Card key={m.slug} m={m} i={i} />)}
        </div>
      )}
    </div>
  );
}
