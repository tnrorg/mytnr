'use client';
import { useState } from 'react';
import SiteNav from '@/components/site/SiteNav';
import SiteFooter from '@/components/site/SiteFooter';
import {
  GENDERS, EDUCATION_LEVELS, POSITIONS, CONTRIBUTION_AREAS,
  LEADERSHIP_OPTIONS, DECLARATION_TEXT, DECLARATION_VERSION,
} from '@/lib/membership/options';
import { validateApplication, incompleteSections } from '@/lib/membership/validateApplication';

const C = { deep: '#063D2B', green: '#0B6B4F', gold: '#D4A72C', ink: '#15231D' };
const mont = { fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif' };
const BLANK = {
  photo_data: '',
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
  const [touched, setTouched] = useState({});   // fields the applicant has visited
  const [tried, setTried] = useState(false);    // they have pressed Submit at least once
  const set = (k, v) => { setErr(''); setF(p => ({ ...p, [k]: v })); };
  const blur = (k) => setTouched(t => ({ ...t, [k]: true }));

  const errors = validateApplication(f);
  // An error is only shown once the applicant has left that field, or after
  // they try to submit — no wall of red before they have typed anything.
  const showErr = (k) => (tried || touched[k]) ? errors[k] : '';
  const missing = Object.keys(errors).length;
  // Read the chosen image as a base64 data URL, downscaled to keep it small.
  function pickPhoto(file) {
    setErr('');
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type))
      return setErr('Profile photo must be a JPG, PNG or WEBP image.');
    if (file.size > 8 * 1024 * 1024)
      return setErr('Please choose an image smaller than 8 MB.');

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Downscale to max 600px on the long edge — keeps uploads fast.
        const max = 600;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        set('photo_data', c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => setErr('That image could not be read. Please try another file.');
      img.src = reader.result;
    };
    reader.onerror = () => setErr('Could not read that file.');
    reader.readAsDataURL(file);
  }

  const toggleArea = (a) => setF(p => ({
    ...p, contribution_areas: p.contribution_areas.includes(a)
      ? p.contribution_areas.filter(x => x !== a) : [...p.contribution_areas, a],
  }));

  async function submit(e) {
    e.preventDefault();
    if (busy) return;                          // disables repeated clicks
    setTried(true);
    if (missing) {
      // Every incomplete field is now flagged; jump to the first one so the
      // applicant is never left guessing what is blocking submission.
      setErr(`Please complete all required fields — ${missing} still need${missing === 1 ? 's' : ''} attention (section ${incompleteSections(errors).join(', ')}).`);
      const el = document.querySelector('[data-invalid="true"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.querySelector('input,select,textarea,button')?.focus?.();
      return;
    }
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
    <main className="light-page min-h-screen flex flex-col bg-[#FDFDFD]" style={{ color: C.ink, ...mont }}>
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
            <div className="flex items-center gap-4 pb-4 mb-4 border-b border-gray-100">
              <div className="w-24 h-28 rounded-xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 grid place-items-center shrink-0">
                {f.photo_data
                  ? <img src={f.photo_data} alt="Selected photo" className="w-full h-full object-cover" />
                  : <span className="text-3xl text-gray-300">👤</span>}
              </div>
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Profile Photo</label>
                <input type="file" accept="image/png,image/jpeg,image/webp"
                  onChange={e => pickPhoto(e.target.files?.[0])}
                  className="block w-full text-xs text-gray-600
                    file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                    file:text-xs file:font-bold file:text-white file:cursor-pointer
                    file:bg-[#0B6B4F] hover:file:bg-[#063D2B]" />
                <p className="mt-1.5 text-[11px] text-gray-400">
                  A clear passport-style photo. JPG, PNG or WEBP.
                </p>
                {f.photo_data && (
                  <button type="button" onClick={() => set('photo_data', '')}
                    className="mt-1 text-[11px] font-semibold text-red-500 hover:underline">Remove photo</button>
                )}
              </div>
            </div>
            <Grid>
              <Field label="First Name" req error={showErr('first_name')}><Input value={f.first_name} onChange={v => set('first_name', v)} onBlur={() => blur('first_name')} bad={!!showErr('first_name')} /></Field>
              <Field label="Last Name" req error={showErr('last_name')}><Input value={f.last_name} onChange={v => set('last_name', v)} onBlur={() => blur('last_name')} bad={!!showErr('last_name')} /></Field>
              <Field label="Gender" req error={showErr('gender')}><Select value={f.gender} onChange={v => set('gender', v)} options={GENDERS} onBlur={() => blur('gender')} bad={!!showErr('gender')} /></Field>
              <Field label="Age" req error={showErr('age')}><Input type="number" value={f.age} onChange={v => set('age', v)} onBlur={() => blur('age')} bad={!!showErr('age')} /></Field>
              <Field label="Union Council in Roundu" req error={showErr('union_council')}><Input value={f.union_council} onChange={v => set('union_council', v)} placeholder="e.g. Roundu" onBlur={() => blur('union_council')} bad={!!showErr('union_council')} /></Field>
              <Field label="Village / Area" req error={showErr('village')}><Input value={f.village} onChange={v => set('village', v)} onBlur={() => blur('village')} bad={!!showErr('village')} /></Field>
              <Field label="Mobile / WhatsApp Number" req error={showErr('mobile')}><Input value={f.mobile} onChange={v => set('mobile', v)} placeholder="+92 3xx xxxxxxx" onBlur={() => blur('mobile')} bad={!!showErr('mobile')} /></Field>
              <Field label="Email Address" req error={showErr('email')}><Input type="email" value={f.email} onChange={v => set('email', v)} placeholder="name@example.com" onBlur={() => blur('email')} bad={!!showErr('email')} /></Field>
            </Grid>
          </Card>

          <Card title="B · Education & Profession">
            <Grid>
              <Field label="Highest Level of Education" req error={showErr('education_level')}><Select value={f.education_level} onChange={v => set('education_level', v)} options={EDUCATION_LEVELS} onBlur={() => blur('education_level')} bad={!!showErr('education_level')} /></Field>
              <Field label="Field of Study / Profession" req error={showErr('field_of_study')}><Input value={f.field_of_study} onChange={v => set('field_of_study', v)} onBlur={() => blur('field_of_study')} bad={!!showErr('field_of_study')} /></Field>
              <Field label="Current Position" req error={showErr('current_position')}><Select value={f.current_position} onChange={v => set('current_position', v)} options={POSITIONS} onBlur={() => blur('current_position')} bad={!!showErr('current_position')} /></Field>
            </Grid>
          </Card>

          <Card title="C · Motivation & Contribution">
            <Field label="Why do you want to join تحریک نوجوانان روندو؟" req error={showErr('why_join')}>
              <Textarea value={f.why_join} onChange={v => set('why_join', v)} rows={4}
                onBlur={() => blur('why_join')} bad={!!showErr('why_join')} />
            </Field>
            <Field label="Which areas are you most interested in contributing to?" req error={showErr('contribution_areas')}>
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
            <Field label="Do you believe educated and visionary leadership is important for the future of Roundu?" req error={showErr('leadership_view')}>
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
            <Field label="What are the biggest issues facing the youth of Roundu today?" req error={showErr('youth_issues')}>
              <Textarea value={f.youth_issues} onChange={v => set('youth_issues', v)} rows={4}
                onBlur={() => blur('youth_issues')} bad={!!showErr('youth_issues')} />
            </Field>
          </Card>

          <Card title="D · Declaration">
            <div data-invalid={showErr('declaration_accepted') ? 'true' : undefined}>
            <label className="flex gap-3 items-start cursor-pointer">
              <input type="checkbox" checked={f.declaration_accepted} className="mt-1 w-4 h-4 shrink-0"
                onChange={e => set('declaration_accepted', e.target.checked)} />
              <span className="text-sm text-gray-600 leading-relaxed">{DECLARATION_TEXT}</span>
            </label>
            {showErr('declaration_accepted') &&
              <p className="mt-2 text-[11px] font-semibold text-red-600">{showErr('declaration_accepted')}</p>}
            </div>
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

          {/* The button stays clickable on purpose: a disabled button gives no
              reason why, so pressing it reveals exactly what is still missing. */}
          <button type="submit" disabled={busy}
            className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: missing && tried
              ? 'linear-gradient(180deg,#9CA3AF,#6B7280)'
              : `linear-gradient(180deg,${C.green},${C.deep})` }}>
            {busy ? 'Submitting…' : missing && tried ? `${missing} field${missing === 1 ? '' : 's'} still required` : 'Submit Application'}
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
function Field({ label, req, error, children }) {
  return <div data-invalid={error ? 'true' : undefined}>
    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
      {label}{req && <span className="text-red-500"> *</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-[11px] font-semibold text-red-600">{error}</p>}
  </div>;
}
const base = 'w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition bg-white';
const ring = (bad) => `${base} ${bad ? 'border-red-300 focus:border-red-500 bg-red-50/40' : 'border-gray-200 focus:border-[#0B6B4F]'}`;
const Input = ({ value, onChange, onBlur, bad, type = 'text', placeholder }) =>
  <input type={type} value={value} placeholder={placeholder} onBlur={onBlur}
    onChange={e => onChange(e.target.value)} className={ring(bad)} />;
const Textarea = ({ value, onChange, onBlur, bad, rows = 3 }) =>
  <textarea rows={rows} value={value} onBlur={onBlur}
    onChange={e => onChange(e.target.value)} className={ring(bad) + ' leading-relaxed'} />;
const Select = ({ value, onChange, onBlur, bad, options }) =>
  <select value={value} onBlur={onBlur} onChange={e => onChange(e.target.value)} className={ring(bad)}>
    <option value="">— select —</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>;
