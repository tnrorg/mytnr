'use client';
import { useEffect, useState } from 'react';
import { aGet, aPost, aPatch, aDel } from './adminApi';
import { Card, Field } from './ui';
import { PROJECT_STATUSES, PROJECT_CATEGORIES, blankProject, summarise } from '@/lib/projects';
import { resizeImage } from '@/lib/imageResize';

/* TNR projects — the source for the public Projects Statistics page.
 *
 * Nothing on that page is derived from member records, so whatever is entered
 * here is exactly what the public sees. Unpublished projects are excluded from
 * the public totals as well as the list, so a draft cannot inflate the counts.
 */
export default function ProjectsTab({ toast }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const [draft, setDraft] = useState(null);

  async function load() {
    setErr('');
    const r = await aGet('/api/admin/projects');
    if (!r?.ok) {
      setErr(`${r?.message || 'Could not load projects.'}${r?.hint ? ` — ${r.hint}` : ''}`);
      setRows([]); return;
    }
    setRows(r.projects);
  }
  useEffect(() => { load(); }, []);

  if (!rows) return <Card><div className="text-sm text-tnr-cream/60">Loading…</div></Card>;

  const live = rows.filter(r => r.published);
  const s = summarise(live);

  return <div className="space-y-4 max-w-3xl">
    <p className="text-sm text-tnr-cream/60">
      Projects shown on the public Projects Statistics page. Only published
      projects are counted there.
    </p>
    {err && <Card><div className="text-sm text-red-300">{err}</div></Card>}

    {!!rows.length && (
      <Card>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[['Published', s.total], ['Completed', s.completed],
            ['People reached', s.beneficiaries], ['Volunteers', s.volunteers]].map(([l, v]) => (
            <div key={l}>
              <div className="text-2xl font-black text-tnr-goldLight">{v.toLocaleString()}</div>
              <div className="text-[10px] uppercase tracking-wider text-tnr-cream/50">{l}</div>
            </div>
          ))}
        </div>
      </Card>
    )}

    {rows.map(row => <ProjectEditor key={row.id} row={row} toast={toast} onDone={load} />)}

    {draft
      ? <ProjectEditor row={draft} isNew toast={toast}
          onDone={() => { setDraft(null); load(); }} onCancel={() => setDraft(null)} />
      : <button className="btn" onClick={() => setDraft(blankProject())}>+ Add project</button>}
  </div>;
}

function ProjectEditor({ row, isNew, toast, onDone, onCancel }) {
  const [f, setF] = useState(row);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(!!isNew);
  useEffect(() => { setF(row); }, [row]);

  const set = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));

  async function pickImage(e) {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const { dataUrl } = await resizeImage(file, { maxWidth: 1400, maxHeight: 1000 });
      setF(s => ({ ...s, image_data: dataUrl, image_url: dataUrl }));
    } catch (ex) { toast(ex.message || 'Could not read that image', 'err'); }
  }

  async function save(overrides = {}) {
    const body = { ...f, ...overrides };
    if (!String(body.title || '').trim()) return toast('Give the project a title.', 'err');
    setBusy(true);
    const r = isNew ? await aPost('/api/admin/projects', body)
                    : await aPatch(`/api/admin/projects/${f.id}`, body);
    setBusy(false);
    if (!r?.ok) return toast(`${r?.message || 'Save failed'}${r?.hint ? ` — ${r.hint}` : ''}`, 'err');
    toast(r.message || 'Saved'); onDone();
  }

  async function remove() {
    if (!confirm(`Delete “${f.title}”? This cannot be undone.`)) return;
    setBusy(true);
    const r = await aDel(`/api/admin/projects/${f.id}`);
    setBusy(false);
    if (!r?.ok) return toast(r?.message || 'Delete failed', 'err');
    toast('Project deleted'); onDone();
  }

  // Existing projects collapse to one line, so a long list stays readable.
  if (!isNew && !open) {
    return <Card>
      <div className="flex flex-wrap items-center gap-2">
        <button className="font-bold text-tnr-cream text-left" onClick={() => setOpen(true)}>
          {f.title || '(untitled)'}
        </button>
        <span className="text-[11px] text-tnr-cream/50">
          {[f.category, f.village || f.union_council, f.year].filter(Boolean).join(' · ')}
        </span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full ${f.published
          ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-tnr-cream/50'}`}>
          {f.published ? 'Published' : 'Draft'}
        </span>
        <button className="btn-ghost !py-1 !px-3 text-xs ml-auto" onClick={() => setOpen(true)}>Edit</button>
      </div>
    </Card>;
  }

  return <Card>
    <div className="flex items-center justify-between gap-2 mb-3">
      <h3 className="font-black text-tnr-cream">{isNew ? 'New project' : (f.title || '(untitled)')}</h3>
      {!isNew && <button className="btn-ghost !py-1 !px-3 text-xs" onClick={() => setOpen(false)}>Collapse</button>}
    </div>

    <Field label="Title"><input className="input" value={f.title || ''} onChange={set('title')} /></Field>

    <div className="grid sm:grid-cols-2 gap-3">
      <Field label="Category">
        <input className="input" list="tnr-project-categories" value={f.category || ''} onChange={set('category')}
          placeholder="Education" />
        <datalist id="tnr-project-categories">
          {PROJECT_CATEGORIES.map(c => <option key={c} value={c} />)}
        </datalist>
      </Field>
      <Field label="Status">
        <select className="input" value={f.status} onChange={set('status')}>
          {PROJECT_STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </Field>
      <Field label="Union Council"><input className="input" value={f.union_council || ''} onChange={set('union_council')} /></Field>
      <Field label="Village / Area"><input className="input" value={f.village || ''} onChange={set('village')} /></Field>
      <Field label="Year"><input type="number" className="input" value={f.year ?? ''} onChange={set('year')} placeholder="2026" /></Field>
      <Field label="Order — lower shows first"><input type="number" className="input" value={f.sort_order ?? 0} onChange={set('sort_order')} /></Field>
      <Field label="People reached"><input type="number" min="0" className="input" value={f.beneficiaries ?? 0} onChange={set('beneficiaries')} /></Field>
      <Field label="Volunteers involved"><input type="number" min="0" className="input" value={f.volunteers ?? 0} onChange={set('volunteers')} /></Field>
    </div>

    <Field label="Short summary">
      <textarea className="input min-h-[80px]" value={f.summary || ''} onChange={set('summary')}
        placeholder="One or two sentences about what was done." />
    </Field>

    <span className="label">Photo <span className="text-tnr-cream/40">(optional)</span></span>
    <div className="flex items-center gap-3 mt-1 mb-4">
      {f.image_url
        ? <img src={f.image_url} alt="" className="h-16 w-28 rounded-lg object-cover" />
        : <div className="h-16 w-28 rounded-lg bg-white/10 grid place-items-center text-[10px] text-tnr-cream/50">None</div>}
      <input type="file" accept="image/*" onChange={pickImage} className="text-xs text-tnr-cream/70" />
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <button className="btn" disabled={busy} onClick={() => save()}>
        {busy ? 'Saving…' : (isNew ? 'Add project' : 'Save')}
      </button>
      {isNew
        ? <button className="btn-ghost" disabled={busy} onClick={onCancel}>Cancel</button>
        : <>
            <button className="btn-ghost" disabled={busy} onClick={() => save({ published: !f.published })}>
              {f.published ? 'Unpublish' : 'Publish'}
            </button>
            <button className="btn-ghost !text-red-300 ml-auto" disabled={busy} onClick={remove}>Delete</button>
          </>}
    </div>
  </Card>;
}
