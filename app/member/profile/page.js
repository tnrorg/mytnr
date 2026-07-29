'use client';
import { useEffect, useState } from 'react';
import MemberShell from '@/components/member/MemberShell';
import { mGet, mPatch, mPost } from '@/components/member/memberApi';

const C = { deep: '#063D2B', green: '#0B6B4F', gold: '#D4A72C' };
const mont = { fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif' };
const base = 'w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0B6B4F] bg-white';

// [key, label, fields:[name,label,type,width]]
const SECTIONS = [
  ['education', 'Education', [
    ['qualification', 'Qualification', 'text'], ['degree', 'Degree', 'text'],
    ['field_of_study', 'Field of Study', 'text'], ['institution', 'Institution', 'text'],
    ['start_date', 'Start Date', 'date'], ['end_date', 'End Date', 'date'],
    ['grade', 'Grade / CGPA', 'text'], ['description', 'Description', 'textarea'],
  ]],
  ['experience', 'Work Experience', [
    ['job_title', 'Job Title', 'text'], ['organization', 'Organization', 'text'],
    ['employment_type', 'Employment Type', 'text'], ['location', 'Location', 'text'],
    ['start_date', 'Start Date', 'date'], ['end_date', 'End Date', 'date'],
    ['responsibilities', 'Responsibilities', 'textarea'], ['achievements', 'Achievements', 'textarea'],
  ]],
  ['skills', 'Skills', [
    ['name', 'Skill', 'text'], ['category', 'Category', 'text'], ['level', 'Level', 'text'],
  ]],
  ['projects', 'Projects', [
    ['name', 'Project Name', 'text'], ['technologies', 'Technologies Used', 'text'],
    ['project_url', 'Project URL', 'text'], ['github_url', 'GitHub URL', 'text'],
    ['description', 'Description', 'textarea'],
  ]],
  ['certifications', 'Certifications', [
    ['name', 'Certificate Name', 'text'], ['issuer', 'Issuing Organization', 'text'],
    ['issue_date', 'Issue Date', 'date'], ['expiry_date', 'Expiry Date', 'date'],
    ['credential_id', 'Credential ID', 'text'], ['credential_url', 'Verification URL', 'text'],
  ]],
  ['languages', 'Languages', [
    ['language', 'Language', 'text'], ['proficiency', 'Proficiency', 'text'],
  ]],
  ['volunteer', 'Volunteer Experience', [
    ['role', 'Role', 'text'], ['organization', 'Organization', 'text'], ['area', 'Area', 'text'],
    ['start_date', 'Start Date', 'date'], ['end_date', 'End Date', 'date'],
    ['description', 'Description', 'textarea'],
  ]],
];

export default function ProfilePage() {
  const [d, setD] = useState(null);
  const [msg, setMsg] = useState('');
  const load = () => mGet('/api/member/profile').then(r => r.ok && setD(r));
  useEffect(() => { load(); }, []);

  if (!d) return <MemberShell active="/member/profile"><p className="text-gray-400">Loading…</p></MemberShell>;

  return (
    <MemberShell active="/member/profile">
      <h1 style={{ ...mont, color: C.deep }} className="text-2xl font-black">My Profile</h1>
      <p className="mt-1 text-sm text-gray-500">
        Keep your professional profile up to date — it powers your CV, cover letters and member directory listing.
      </p>
      {msg && <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: '#0B6B4F14', color: C.deep }}>{msg}</div>}

      {!!d.pending_requests?.length && (
        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Awaiting committee approval: <b>{d.pending_requests.map(r => r.field.replace(/_/g, ' ')).join(', ')}</b>
        </div>
      )}

      <CoreCard core={d.core} onSaved={m => { setMsg(m); load(); }} />
      <AboutCard profile={d.profile} onSaved={m => { setMsg(m); load(); }} />

      {SECTIONS.map(([key, label, fields]) => (
        <SectionCard key={key} sec={key} label={label} fields={fields} items={d[key] || []} reload={load} />
      ))}
    </MemberShell>
  );
}

/* ── Membership details: sensitive fields need approval ── */
function CoreCard({ core, onSaved }) {
  const [f, setF] = useState({
    first_name: core.first_name || '', last_name: core.last_name || '',
    email: core.email || '', mobile: core.mobile || '',
    village: core.village || '', union_council: core.union_council || '',
  });
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    const r = await mPatch('/api/member/profile', f);
    setBusy(false);
    if (r.ok) onSaved(r.message);
  };
  return (
    <Card title="Membership Details" note="Changes here are reviewed by the membership committee before they take effect.">
      <div className="grid sm:grid-cols-2 gap-3">
        <F l="Membership ID"><input value={core.membership_id} disabled className={base + ' opacity-60 font-mono'} /></F>
        <F l="Status"><input value={core.status} disabled className={base + ' opacity-60 uppercase'} /></F>
        {[['first_name', 'First Name'], ['last_name', 'Last Name'], ['email', 'Email'],
          ['mobile', 'Mobile'], ['village', 'Village'], ['union_council', 'Union Council']].map(([k, l]) => (
          <F key={k} l={l}><input value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} className={base} /></F>
        ))}
      </div>
      <button onClick={save} disabled={busy} className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
        style={{ background: `linear-gradient(180deg,${C.green},${C.deep})` }}>
        {busy ? 'Submitting…' : 'Request Changes'}
      </button>
    </Card>
  );
}

/* ── Free-to-edit professional info ── */
function AboutCard({ profile, onSaved }) {
  const KEYS = [['headline', 'Professional Headline', 'text'], ['summary', 'Professional Summary', 'textarea'],
    ['country', 'Current Country', 'text'], ['city', 'Current City', 'text'],
    ['whatsapp', 'WhatsApp Number', 'text'], ['address', 'Address', 'text'],
    ['linkedin_url', 'LinkedIn URL', 'text'], ['portfolio_url', 'Portfolio URL', 'text'],
    ['github_url', 'GitHub URL', 'text'], ['tnr_contributions', 'TNR Contributions', 'textarea'],
    ['awards', 'Awards & Achievements', 'textarea']];
  const [f, setF] = useState(Object.fromEntries(KEYS.map(([k]) => [k, profile[k] || ''])));
  const [busy, setBusy] = useState(false);
  const save = async () => { setBusy(true); const r = await mPatch('/api/member/profile', f); setBusy(false); if (r.ok) onSaved('Profile updated.'); };
  return (
    <Card title="Professional Information">
      <div className="grid sm:grid-cols-2 gap-3">
        {KEYS.map(([k, l, t]) => (
          <F key={k} l={l} full={t === 'textarea'}>
            {t === 'textarea'
              ? <textarea rows={3} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} className={base} />
              : <input value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} className={base} />}
          </F>
        ))}
      </div>
      <button onClick={save} disabled={busy} className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
        style={{ background: `linear-gradient(180deg,${C.green},${C.deep})` }}>{busy ? 'Saving…' : 'Save'}</button>
    </Card>
  );
}

/* ── Repeatable sections ── */
function SectionCard({ sec, label, fields, items, reload }) {
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({});
  const [busy, setBusy] = useState(false);

  const add = async () => {
    setBusy(true);
    const r = await mPost(`/api/member/profile/${sec}`, f);
    setBusy(false);
    if (r.ok) { setF({}); setAdding(false); reload(); }
  };
  const del = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await fetch(`/api/member/profile/${sec}?id=${id}`, {
      method: 'DELETE', headers: { Authorization: 'Bearer ' + localStorage.getItem('tnr_member_token') },
    });
    reload();
  };
  const title = (it) => it.name || it.job_title || it.qualification || it.degree || it.language || it.role || '—';
  const sub = (it) => [it.institution, it.organization, it.issuer, it.proficiency, it.level, it.area]
    .filter(Boolean).join(' · ');

  return (
    <Card title={label} action={<button onClick={() => setAdding(!adding)} className="text-xs font-bold" style={{ color: C.green }}>
      {adding ? 'Cancel' : '+ Add'}</button>}>
      {!items.length && !adding && <p className="text-sm text-gray-400">No entries yet.</p>}

      <div className="space-y-2">
        {items.map(it => (
          <div key={it.id} className="flex items-start gap-3 rounded-xl border border-gray-100 p-3">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm" style={{ color: C.deep }}>{title(it)}</div>
              {sub(it) && <div className="text-xs text-gray-500">{sub(it)}</div>}
              {(it.start_date || it.end_date) && (
                <div className="text-[11px] text-gray-400 mt-0.5">
                  {it.start_date || '—'} → {it.end_date || 'Present'}
                </div>)}
            </div>
            <button onClick={() => del(it.id)} className="text-xs text-red-500 hover:underline shrink-0">Delete</button>
          </div>
        ))}
      </div>

      {adding && (
        <div className="mt-3 rounded-xl bg-gray-50 p-4">
          <div className="grid sm:grid-cols-2 gap-3">
            {fields.map(([k, l, t]) => (
              <F key={k} l={l} full={t === 'textarea'}>
                {t === 'textarea'
                  ? <textarea rows={2} value={f[k] || ''} onChange={e => setF({ ...f, [k]: e.target.value })} className={base} />
                  : <input type={t} value={f[k] || ''} onChange={e => setF({ ...f, [k]: e.target.value })} className={base} />}
              </F>
            ))}
          </div>
          <button onClick={add} disabled={busy} className="mt-3 px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40"
            style={{ background: `linear-gradient(180deg,${C.green},${C.deep})` }}>{busy ? 'Saving…' : 'Add Entry'}</button>
        </div>
      )}
    </Card>
  );
}

/* ── shared bits ── */
function Card({ title, note, action, children }) {
  return <div className="mt-5 rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
    <div className="flex items-center justify-between">
      <h2 style={{ ...mont, color: C.deep }} className="text-sm font-black uppercase tracking-wide">{title}</h2>
      {action}
    </div>
    {note && <p className="mt-1 text-xs text-gray-400">{note}</p>}
    <div className="mt-4">{children}</div>
  </div>;
}
const F = ({ l, full, children }) => (
  <div className={full ? 'sm:col-span-2' : ''}>
    <label className="block text-xs font-semibold text-gray-500 mb-1">{l}</label>{children}
  </div>
);
