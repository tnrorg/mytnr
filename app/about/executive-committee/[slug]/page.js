'use client';
import DocPage, { Section, P, TickList, C } from '@/components/site/DocPage';
import { ExecutivePhoto } from '@/components/site/ExecutiveCard';
import { EXECUTIVE, execBySlug } from '@/content/executiveCommittee';
import { CORE_LEADERSHIP_CRITERIA } from '@/content/aboutTnr';

export default function ExecutiveMemberPage({ params }) {
  const m = execBySlug(params?.slug);

  if (!m) {
    return (
      <DocPage eyebrow="Executive Committee" title="Position not found"
        lead="This profile is not available."
        source="Central Executive Committee, Tehreek-e-Nojawanan Roundu.">
        <a href="/about/executive-committee" className="font-bold" style={{ color: C.green }}>← Back to the Executive Committee</a>
      </DocPage>
    );
  }

  const named = !!m.name;
  const others = EXECUTIVE.filter(x => x.slug !== m.slug);

  return (
    <DocPage eyebrow="Central Executive Committee" title={m.designation} lead={m.summary}
      source="TNR Governance Handbook — Constitution Article VII, and Chapter 4.">

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-7 mb-10">
        <ExecutivePhoto member={m} size="large" />
        <div className="min-w-0 text-center sm:text-left">
          <div className="text-[11px] font-bold uppercase tracking-[.2em] mb-1" style={{ color: C.gold }}>Office Holder</div>
          <p className="text-[20px] font-black leading-tight" style={{ color: named ? C.deep : '#9CA3AF' }}>
            {named ? m.name : 'To Be Announced'}
          </p>
          {m.qualification && <p className="mt-1 text-[15px] font-semibold" style={{ color: C.green }}>{m.qualification}</p>}
          <p className="mt-3 text-[14px] text-gray-600 leading-relaxed">
            Term of office: one (1) year, with the first six (6) months serving as a probationary period.
          </p>
        </div>
      </div>

      <Section title="Responsibilities"><TickList items={m.duties} /></Section>

      <Section title="Eligibility Criteria">
        <P>To be eligible for this position, a candidate must:</P>
        <TickList items={CORE_LEADERSHIP_CRITERIA} />
      </Section>

      <Section title="Other Committee Positions">
        <div className="flex flex-wrap gap-2">
          {others.map(o => (
            <a key={o.slug} href={`/about/executive-committee/${o.slug}`}
              className="text-[13px] font-semibold px-3 py-2 rounded-xl border border-gray-200 hover:border-[#0B6B4F] transition"
              style={{ color: C.deep }}>{o.designation}</a>
          ))}
        </div>
        <div className="mt-5">
          <a href="/about/executive-committee" className="text-[14px] font-bold" style={{ color: C.green }}>
            ← Back to the Executive Committee
          </a>
        </div>
      </Section>
    </DocPage>
  );
}
