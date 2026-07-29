'use client';
import { useState } from 'react';
import SiteNav from '@/components/site/SiteNav';
import SiteFooter from '@/components/site/SiteFooter';
import {
  GENDERS, EDUCATION_LEVELS, POSITIONS, CONTRIBUTION_AREAS,
  LEADERSHIP_OPTIONS, DECLARATION_TEXT, DECLARATION_VERSION,
} from '@/lib/membership/options';

const C = { deep: '#063D2B', green: '#0B6B4F', gold: '#D4A72C', ink: '#15231D' };
const mont = { fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif' };
const BLANK = {
  first_name: '', last_name: '', gender: '', age: '', village: '', union_council: '',
  mobile: '', email: '', education_level: '', field_of_study: '', current_position: '',
  why_join: '', contribution_areas: [], leadership_view: '', leadership_note: '',
  youth_issues: '', declaration_accepted: false, whatsapp_opt_in: false,
};

export default function ApplyPage() {
  const [f, setF] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(null);
  const set = (k, v) => { setErr(''); setF(p => ({ ...p, [k]: v })); };
  const toggleArea = (a) => setF(p => ({
    ...p, contribution_areas: p.contribution_areas.includes(a)
      ? p.contribution_areas.filter(x => x !== a) : [...p.contribution_areas, a],
  }));

  const ready = f.first_name && f.last_name && f.email && f.mobile && f.why_join
    && f.contribution_areas.length && f.leadership_view && f.youth_issues && f.declaration_accepted;

  async function submit(e) {
    e.preventDefault();
    if (!ready || busy) return;               // disables repeated clicks
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/public/membership/apply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, declaration_version: DECLARATION_VERSION }),
      }).then(x => x.json());
      if (!r.ok) { setErr(r.message || 'Could not submit. Please try again.'); setBusy(false); return; }
      setDone(r);
    } catch { setErr('Network error. Please try again.'); }
    setBusy(false);
  }

  if (done) return (
    <main className="min-h-screen flex flex-col bg-[#FDFDFD]" style={{ color: C.ink, ...mont }}>
      <SiteNav />
      <section className="flex-1 grid place-items-center px-4 py-20">
        <div className="max-w-lg w-full text-center rounded-3xl bg-white border border-gray-100 shadow-xl p-8">
          <div className="w-16 h-16 mx-auto rounded-full grid place-items-center text-3xl" style={{ background: '#0B6B4F14' }}>✅</div>
          <h1 style={{ ...mont, color: C.deep }} className="mt-4 text-2xl font-black">Application Submitted</h1>
          <p className="mt-2 text-gray-500 text-sm">Thank you for applying to Tehreek-e-Naujawanan Roundu. Your application is now pending review.</p>
          <div className="mt-5 rounded-2xl p-4" style={{ background: '#0B6B4F0d' }}>
            <div className="text-[11px] uppercase tracking-wider text-gray-500">Reference Number</div>
            <div style={{ ...mont, color: C.deep }} className="text-xl font-black tracking-wide">{done.reference_no}</div>
          </div>
          <p className="mt-4 text-xs text-gray-400">Save this reference number. You will need it with your email to check your application status.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="/membership/status" className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: `linear-gradient(180deg,${C.green},${C.deep})` }}>Check Status</a>
            <a href="/" className="flex-1 py-3 rounded-xl font-bold border-2 border-[#063D2B]/15 text-[#063D2B]">Back to Home</a>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );

  return (
    <main className="min-h-screen flex flex-col bg-[#FDFDFD]" style={{ color: C.ink, ...mont }}>
      <SiteNav />
      <section className="max-w-3xl w-full mx-auto px-4 py-10">
        <h1 style={{ ...mont, color: C.deep }} className="text-3xl font-black">Membership Application</h1>
        <p className="mt-2 text-gray-500 text-sm">Join Tehreek-e-Naujawanan Roundu. All applications are reviewed by the membership committee.</p>

        <form onSubmit={submit} className="mt-8 space-y-6">
          <Card title="A · Personal Information">
            <Grid>
              <Field label="First Name" req><Input value={f.first_name} onChange={v => set('first_name', v)} /></Field>
              <Field label="Last Name" req><Input value={f.last_name} onChange={v => set('last_name', v)} /></Field>
              <Field label="Gender"><Select value={f.gender} onChange={v => set('gender', v)} options={GENDERS} /></Field>
              <Field label="Age"><Input type="number" value={f.age} onChange={v => set('age', v)} /></Field>
              <Field label="Union Council in Roundu"><Input value={f.union_council} onChange={v => set('union_council', v)} placeholder="e.g. Roundu" /></Field>
              <Field label="Village / Area"><Input value={f.village} onChange={v => set('village', v)} /></Field>
              <Field label="Mobile / WhatsApp Number" req><Input value={f.mobile} onChange={v => set('mobile', v)} placeholder="+92 3xx xxxxxxx" /></Field>
              <Field label="Email Address" req><Input type="email" value={f.email} onChange={v => set('email', v)} placeholder="name@example.com" /></Field>
            </Grid>
          </Card>

          <Card title="B · Education & Profession">
            <Grid>
              <Field label="Highest Level of Education"><Select value={f.education_level} onChange={v => set('education_level', v)} options={EDUCATION_LEVELS} /></Field>
              <Field label="Field of Study / Profession"><Input value={f.field_of_study} onChange={v => set('field_of_study', v)} /></Field>
              <Field label="Current Position"><Select value={f.current_position} onChange={v => set('current_position', v)} options={POSITIONS} /></Field>
            </Grid>
          </Card>

          <Card title="C · Motivation & Contribution">
            <Field label="Why do you want to join تحریک نوجوانان روندو؟" req>
              <Textarea value={f.why_join} onChange={v => set('why_join', v)} rows={4} />
            </Field>
            <Field label="Which areas are you most interested in contributing to?" req>
              <div className="flex flex-wrap gap-2 mt-1">
                {CONTRIBUTION_AREAS.map(a => {
                  const on = f.contribution_areas.includes(a);
                  return <button type="button" key={a} onClick={() => toggleArea(a)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${on
                      ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-[#0B6B4F]'}`}
                    style={on ? { background: C.green } : {}}>{a}</button>;
                })}
              </div>
            </Field>
            <Field label="Do you believe educated and visionary leadership is important for the future of Roundu?" req>
              <div className="flex gap-2 mt-1">
                {LEADERSHIP_OPTIONS.map(o => (
                  <button type="button" key={o} onClick={() => set('leadership_view', o)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${f.leadership_view === o
                      ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'}`}
                    style={f.leadership_view === o ? { background: C.green } : {}}>{o}</button>
                ))}
              </div>
            </Field>
            <Field label="Would you like to explain your answer? (optional)">
              <Textarea value={f.leadership_note} onChange={v => set('leadership_note', v)} rows={2} />
            </Field>
            <Field label="What are the biggest issues facing the youth of Roundu today?" req>
              <Textarea value={f.youth_issues} onChange={v => set('youth_issues', v)} rows={4} />
            </Field>
          </Card>

          <Card title="D · Declaration">
            <label className="flex gap-3 items-start cursor-pointer">
              <input type="checkbox" checked={f.declaration_accepted} className="mt-1 w-4 h-4 shrink-0"
                onChange={e => set('declaration_accepted', e.target.checked)} />
              <span className="text-sm text-gray-600 leading-relaxed">{DECLARATION_TEXT}</span>
            </label>
          </Card>

          <Card title="E · WhatsApp Group (optional)">
            <label className="flex gap-3 items-center cursor-pointer">
              <input type="checkbox" checked={f.whatsapp_opt_in} className="w-4 h-4 shrink-0"
                onChange={e => set('whatsapp_opt_in', e.target.checked)} />
              <span className="text-sm text-gray-600">
                I would like to join the official WhatsApp Group of Tehreek-e-Naujawanan Roundu.
              </span>
            </label>
            <p className="mt-2 text-xs text-gray-400">The group link is shared only with approved members after login.</p>
          </Card>

          {err && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{err}</div>}

          <button type="submit" disabled={!ready || busy}
            className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(180deg,${C.green},${C.deep})` }}>
            {busy ? 'Submitting…' : 'Submit Application'}
          </button>
          <p className="text-center text-xs text-gray-400">
            Already applied? <a href="/membership/status" className="font-semibold" style={{ color: C.green }}>Check your application status</a>
          </p>
        </form>
      </section>
      <SiteFooter />
    </main>
  );
}

/* ── small building blocks ── */
function Card({ title, children }) {
  return <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 sm:p-6">
    <h2 style={{ ...mont, color: C.deep }} className="text-sm font-black uppercase tracking-wide">{title}</h2>
    <div className="mt-4 space-y-4">{children}</div>
  </div>;
}
const Grid = ({ children }) => <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
function Field({ label, req, children }) {
  return <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
      {label}{req && <span className="text-red-500"> *</span>}
    </label>{children}
  </div>;
}
const base = 'w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#0B6B4F] transition bg-white';
const Input = ({ value, onChange, type = 'text', placeholder }) =>
  <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} className={base} />;
const Textarea = ({ value, onChange, rows = 3 }) =>
  <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} className={base + ' leading-relaxed'} />;
const Select = ({ value, onChange, options }) =>
  <select value={value} onChange={e => onChange(e.target.value)} className={base}>
    <option value="">— select —</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>;
