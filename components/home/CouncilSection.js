'use client';
import { ArrowRight } from 'lucide-react';
import CouncilDirectory from '@/components/council/CouncilDirectory';
import { SectionHeading } from '@/components/ui';
import { COLORS, FONT } from '@/lib/design/tokens';

// Homepage preview: card-level information only. The full professional profile
// — biography, education, publications, certifications — lives on the profile
// page behind "View Full Profile".
export default function CouncilSection() {
  return (
    <section className="max-w-tnr-wide mx-auto px-4 pb-16 w-full" style={FONT}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Senior Leadership" title="TNR Advisory Council Members"
          lead="Experienced professionals, academics and community leaders guiding TNR." />
        <a href="/about/advisory-council"
          className="group inline-flex items-center gap-1.5 rounded-tnr px-5 py-2.5 text-sm font-bold
            transition-colors duration-micro hover:bg-[rgba(23,107,73,.14)]"
          style={{ background: 'rgba(23,107,73,.08)', color: COLORS.green700 }}>
          View Full Council
          <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true"
            className="transition-transform duration-micro group-hover:translate-x-0.5" />
        </a>
      </div>
      <div className="mt-10">
        <CouncilDirectory limit={6} showFilters={false} />
      </div>
    </section>
  );
}
