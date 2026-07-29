'use client';
import { useState } from 'react';
import { initials } from '@/content/advisoryCouncil';

const C = { deep: '#063D2B', green: '#0B6B4F', gold: '#D4A72C' };

// Photo with an initials fallback: a member without a photo file still gets a
// complete-looking card instead of a broken image icon.
export function CouncilPhoto({ member, size = 'card' }) {
  const [failed, setFailed] = useState(false);
  const box = size === 'large' ? 'w-40 h-40 text-4xl' : 'w-full aspect-[4/5] text-3xl';
  const radius = size === 'large' ? 'rounded-2xl' : 'rounded-xl';

  if (failed) {
    return (
      <div className={`${box} ${radius} grid place-items-center font-black text-white shrink-0`}
        style={{ background: `linear-gradient(140deg, ${C.green}, ${C.deep})` }}>
        {initials(member.name)}
      </div>
    );
  }
  // Admin-uploaded photo wins; otherwise fall back to the /public file convention.
  const src = member.photo_url || `/advisory/${member.slug}.jpg`;
  return (
    <img src={src} alt={member.name} onError={() => setFailed(true)}
      className={`${box} ${radius} object-cover object-top shrink-0 bg-gray-100`} />
  );
}

export default function CouncilCard({ member }) {
  return (
    <article className="rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition p-4 flex flex-col">
      <CouncilPhoto member={member} />

      <h3 className="mt-4 font-black text-[15px] leading-snug text-center" style={{ color: C.deep }}>{member.name}</h3>
      <div className="mt-1 text-center text-[12px] font-bold" style={{ color: C.green }}>
        {member.degree}{member.field && <><br /><span className="font-semibold">({member.field})</span></>}
      </div>
      <p className="mt-2 text-center text-[12px] text-gray-500 leading-snug">{member.affiliation}</p>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="text-[10px] font-bold uppercase tracking-[.14em] text-center mb-2" style={{ color: C.gold }}>
          Interests / Expertise
        </div>
        <ul className="space-y-1">
          {(member.expertise || []).slice(0, 3).map(e => (
            <li key={e} className="flex gap-2 text-[12px] text-gray-600 leading-snug">
              <span className="mt-[6px] shrink-0 w-1 h-1 rounded-full" style={{ background: C.gold }} />
              <span>{e}</span>
            </li>
          ))}
          {(member.expertise || []).length > 3 && (
            <li className="text-[11px] text-gray-400 pl-3">+{(member.expertise || []).length - 3} more</li>
          )}
        </ul>
      </div>

      <a href={`/about/advisory-council/${member.slug}`}
        className="mt-4 block text-center text-[12px] font-bold py-2 rounded-xl transition hover:opacity-90"
        style={{ background: '#0B6B4F14', color: C.green }}>
        View More →
      </a>
    </article>
  );
}
