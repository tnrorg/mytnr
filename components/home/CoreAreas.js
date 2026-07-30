'use client';
import {
  GraduationCap, Users, Briefcase, HeartHandshake, MonitorSmartphone,
  Stethoscope, Trophy, Sparkles, Globe2, ArrowRight,
} from 'lucide-react';
import { RevealGroup, RevealItem, SectionHeading } from '@/components/ui';
import { COLORS, FONT } from '@/lib/design/tokens';

// The nine core areas from the brief. Links point only at routes that exist;
// areas without a page yet route to the membership form, where interest in
// each area is captured as a contribution area.
const AREAS = [
  ['Education & Scholarships', 'Guidance, scholarships and learning support for students.', GraduationCap, '/membership/apply'],
  ['Youth Development',        'Building confidence, skills and civic responsibility.',      Users,         '/membership/apply'],
  ['Career & Skills',          'Jobs, internships, mentorship and skills training.',         Briefcase,     '/member/opportunities'],
  ['Community Welfare',        'Relief, support and welfare rooted in our villages.',        HeartHandshake, '/volunteer'],
  ['Digital Services',         'Bringing digital access and literacy to Roundu.',            MonitorSmartphone, '/membership/apply'],
  ['Health Awareness',         'Campaigns and awareness on community health.',               Stethoscope,   '/membership/apply'],
  ['Sports & Culture',         'Celebrating the talent and heritage of Roundu.',             Trophy,        '/membership/apply'],
  ['Women Empowerment',        'Creating space, voice and opportunity for women.',           Sparkles,      '/membership/apply'],
  ['Overseas Coordination',    'Connecting our community beyond the valley.',                Globe2,        '/membership/apply'],
];

export default function CoreAreas() {
  return (
    <section className="max-w-tnr-wide mx-auto px-4 pb-16 w-full" style={FONT}>
      <SectionHeading align="center" eyebrow="What We Do" title="Our Core Areas"
        lead="Nine areas where TNR members contribute their time, skills and expertise." />

      <RevealGroup className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4" gap={0.05}>
        {AREAS.map(([title, desc, Icon, href]) => (
          <RevealItem key={title}>
            <a href={href}
              className="group h-full flex flex-col rounded-tnr-lg bg-white border border-gray-100 p-6
                shadow-tnr-flat transition-all duration-standard
                hover:-translate-y-[3px] hover:shadow-tnr-raise hover:border-[rgba(23,107,73,.22)]">
              <span className="w-11 h-11 rounded-tnr grid place-items-center transition-colors duration-standard"
                style={{ background: 'rgba(23,107,73,.09)', color: COLORS.green700 }}>
                <Icon size={20} strokeWidth={2} aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-bold text-[15px]" style={{ color: COLORS.green900 }}>{title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed flex-1" style={{ color: COLORS.muted }}>{desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-bold"
                style={{ color: COLORS.green700 }}>
                Get involved
                <ArrowRight size={13} strokeWidth={2.5} aria-hidden="true"
                  className="transition-transform duration-micro group-hover:translate-x-0.5" />
              </span>
            </a>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
