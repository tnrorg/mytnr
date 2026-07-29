'use client';
import { useState } from 'react';

// Monogram for admin-created rows, which have no hard-coded monogram field.
const initialsOf = (m) => String(m.designation || m.name || '?')
  .split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

const C = { deep: '#063D2B', green: '#0B6B4F', gold: '#D4A72C', goldLt: '#E8C25A' };

export function ExecutivePhoto({ member, size = 'card' }) {
  const [failed, setFailed] = useState(false);
  const box = size === 'large' ? 'w-44 h-44' : 'w-28 h-28';

  return (
    <div className={`${box} rounded-full p-[3px] mx-auto shrink-0`}
      style={{ background: `linear-gradient(140deg, ${C.gold}, ${C.goldLt} 45%, ${C.gold})` }}>
      {failed
        ? <div className="w-full h-full rounded-full grid place-items-center font-black text-white"
            style={{ background: `linear-gradient(140deg, ${C.green}, ${C.deep})`,
                     fontSize: size === 'large' ? 44 : 28, letterSpacing: '.04em' }}>
            {member.monogram || initialsOf(member)}
          </div>
        : <img src={member.photo_url || `/executive/${member.slug}.jpg`} alt={member.name || member.designation}
            onError={() => setFailed(true)}
            className="w-full h-full rounded-full object-cover object-top bg-gray-100" />}
    </div>
  );
}

export default function ExecutiveCard({ member }) {
  const named = !!member.name;
  return (
    <article className="group relative rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition overflow-hidden flex flex-col">
      {/* deep-green crown behind the portrait, the way the printed cards read */}
      <div className="h-20" style={{ background: `linear-gradient(135deg, ${C.deep}, ${C.green})` }} />
      <div className="-mt-16 px-6 pb-6 flex flex-col flex-1">
        <ExecutivePhoto member={member} />

        <div className="mt-4 text-center">
          <div className="inline-block text-[10px] font-black uppercase tracking-[.18em] px-3 py-1 rounded-full"
            style={{ background: '#F3E4B3', color: C.deep }}>{member.designation}</div>
        </div>

        <h3 className="mt-3 text-center font-black text-[17px] leading-snug"
          style={{ color: named ? C.deep : '#9CA3AF' }}>
          {named ? member.name : 'To Be Announced'}
        </h3>

        {member.qualification && (
          <p className="mt-1 text-center text-[12.5px] font-semibold" style={{ color: C.green }}>{member.qualification}</p>
        )}

        <p className="mt-3 text-center text-[13px] text-gray-500 leading-relaxed flex-1">{member.summary}</p>

        <a href={`/about/executive-committee/${member.slug}`}
          className="mt-5 block text-center text-[12.5px] font-bold py-2.5 rounded-xl text-white transition hover:opacity-90"
          style={{ background: C.deep }}>
          View More →
        </a>
      </div>
    </article>
  );
}
