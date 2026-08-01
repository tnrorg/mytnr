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

      <PhotoCard core={d.core} onSaved={m => { setMsg(m); load(); }} />
      <CoreCard core={d.core} onSaved={m => { setMsg(m); load(); }} />
      <AboutCard profile={d.profile} onSaved={m => { setMsg(m); load(); }} />

      {SECTIONS.map(([key, label, fields]) => (
        <SectionCard key={key} sec={key} label={label} fields={fields} items={d[key] || []} reload={load} />
      ))}
    </MemberShell>
  );
}


/* ── Profile photo ── */
function PhotoCard({ core, onSaved }) {
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  function pick(file) {
    setErr('');
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) return setErr('Use a JPG, PNG or WEBP image.');
    if (file.size > 8 * 1024 * 1024) return setErr('Choose an image smaller than 8 MB.');
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 600;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        setPreview(c.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  async function save() {
    if (!preview) return;
    setBusy(true); setErr('');
    const r = await mPatch('/api/member/profile', { photo_data: preview });
    setBusy(false);
    if (!r.ok) return setErr(r.message || 'Could not save the photo.');
    setPreview('');
    window.dispatchEvent(new Event('tnr-member-updated'));   // refresh sidebar avatar
    onSaved('Profile photo updated.');
  }

  const shown = preview || core.photo_url;

  return (
    <Card title="Profile Photo" note="Your photo appears on your membership card, certificate and member directory listing.">
      <div className="flex items-center gap-5 flex-wrap">
        <div className="w-28 h-32 rounded-xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 grid place-items-center shrink-0">
          {shown
            ? <img src={shown} alt="" className="w-full h-full object-cover" />
            : <span className="text-4xl text-gray-300">👤</span>}
        </div>
        <div className="min-w-0">
          <input type="file" accept="image/png,image/jpeg,image/webp"
            onChange={e => pick(e.target.files?.[0])}
            className="block w-full text-xs text-gray-600
              file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
              file:text-xs file:font-bold file:text-white file:cursor-pointer
              file:bg-[#0B6B4F] hover:file:bg-[#063D2B]" />
          <p className="mt-1.5 text-[11px] text-gray-400">A clear passport-style photo. JPG, PNG or WEBP.</p>
          {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
          {preview && (
            <div className="mt-3 flex gap-2">
              <button onClick={save} disabled={busy}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                style={{ background: `linear-gradient(180deg,${C.green},${C.deep})` }}>
                {busy ? 'Saving…' : 'Save Photo'}</button>
              <button onClick={() => setPreview('')} className="px-4 py-2 rounded-xl text-sm border border-gray-200">Cancel</button>
            </div>
          )}
        </div>
      </div>
    </Card>
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
  // id of the entry being edited — the same form serves both, so there is one
  // set of inputs to maintain rather than two that can drift apart.
  const [editingId, setEditingId] = useState(null);
  const [f, setF] = useState({});
  const [busy, setBusy] = useState(false);

  const openForm = ()      => { setEditingId(null); setF({}); setAdding(true); };
  const openEdit = (it)    => { setEditingId(it.id); setF({ ...it }); setAdding(true); };
  const closeForm = ()     => { setEditingId(null); setF({}); setAdding(false); };

  const save = async () => {
    setBusy(true);
    const r = editingId
      ? await mPatch(`/api/member/profile/${sec}`, { ...f, id: editingId })
      : await mPost(`/api/member/profile/${sec}`, f);
    setBusy(false);
    if (r.ok) { closeForm(); reload(); }
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
    <Card title={label} action={<button onClick={() => (adding ? closeForm() : openForm())}
      className="text-xs font-bold" style={{ color: C.green }}>
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
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => openEdit(it)}
                className="text-xs font-semibold hover:underline" style={{ color: C.green }}>Edit</button>
              <button onClick={() => del(it.id)}
                className="text-xs text-red-500 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {adding && (
        <div className="mt-3 rounded-xl bg-gray-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: C.deep }}>
            {editingId ? `Edit ${label.replace(/s$/, '')}` : `New ${label.replace(/s$/, '')}`}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {fields.map(([k, l, t]) => (
              <F key={k} l={l} full={t === 'textarea'}>
                {t === 'textarea'
                  ? <textarea rows={2} value={f[k] || ''} onChange={e => setF({ ...f, [k]: e.target.value })} className={base} />
                  : <input type={t} value={f[k] || ''} onChange={e => setF({ ...f, [k]: e.target.value })} className={base} />}
              </F>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={save} disabled={busy}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40"
              style={{ background: `linear-gradient(180deg,${C.green},${C.deep})` }}>
              {busy ? 'Saving…' : editingId ? 'Save Changes' : 'Add Entry'}
            </button>
            <button onClick={closeForm} disabled={busy}
              className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-600">
              Cancel
            </button>
          </div>
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
