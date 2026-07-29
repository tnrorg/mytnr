'use client';
import DocPage, { C } from '@/components/site/DocPage';
import { CONSTITUTION } from '@/content/aboutTnr';

export default function ConstitutionPage() {
  return (
    <DocPage eyebrow="Governance" title="Constitution of TNR"
      lead="The supreme governance document of Tehreek-e-Nojawanan Roundu. Where any inconsistency arises between governance documents, this Constitution shall prevail."
      source="TNR Governance Handbook, Part II — Constitution, Chapter 2, Articles I–XV.">

      {/* Article index — the Constitution is long, so give readers a way in. */}
      <nav className="mb-12 rounded-2xl border border-gray-200 p-5">
        <div className="text-[11px] font-bold uppercase tracking-[.22em] mb-3" style={{ color: C.gold }}>Contents</div>
        <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
          {CONSTITUTION.map(a => (
            <li key={a.article}>
              <a href={`#${a.article.replace(/\s+/g, '-').toLowerCase()}`}
                className="text-[14px] text-gray-600 hover:text-[#0B6B4F] transition">
                <span className="font-semibold" style={{ color: C.deep }}>{a.article}</span> — {a.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {CONSTITUTION.map(a => (
        <section key={a.article} id={a.article.replace(/\s+/g, '-').toLowerCase()} className="mb-11 scroll-mt-24">
          <div className="text-[11px] font-bold uppercase tracking-[.22em] mb-1" style={{ color: C.gold }}>{a.article}</div>
          <h2 className="text-xl sm:text-2xl font-black mb-4" style={{ color: C.deep }}>{a.title}</h2>
          <div className="space-y-3">
            {a.clauses.map(([no, text], i) => (
              <div key={i} className="flex gap-3">
                {no
                  ? <span className="shrink-0 text-[12px] font-bold tabular-nums pt-[3px] w-12" style={{ color: C.green }}>{no}</span>
                  : <span className="shrink-0 w-12" />}
                <p className="text-[15px] leading-[1.85] text-gray-700">{text}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </DocPage>
  );
}
