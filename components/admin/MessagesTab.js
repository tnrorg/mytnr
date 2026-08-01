'use client';
import { useEffect, useState } from 'react';
import { aGet, aPatch } from './adminApi';
import { Card, Field } from './ui';
import { MESSAGE_KEYS, blankMessage } from '@/lib/leadershipMessages';

/* Founder's and President's messages shown on the home page.
 *
 * Each card saves on its own, so a half-finished President's message can never
 * block publishing the Founder's. Nothing appears publicly until "Show on the
 * home page" is ticked AND the message has text.
 */
export default function MessagesTab({ toast }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');

  async function load() {
    setErr('');
    const r = await aGet('/api/admin/messages');
    if (!r?.ok) {
      setErr(`${r?.message || 'Could not load the messages.'}${r?.hint ? ` — ${r.hint}` : ''}`);
      setRows(MESSAGE_KEYS.map(blankMessage));
      return;
    }
    setRows(r.messages);
  }
  useEffect(() => { load(); }, []);

  if (!rows) return <Card><div className="text-sm text-tnr-cream/60">Loading…</div></Card>;

  return <div className="space-y-4 max-w-3xl">
    <p className="text-sm text-tnr-cream/60">
      These appear on the home page, between the live figures and the leadership
      sections. Each is hidden until you tick “Show on the home page”.
    </p>
    {err && <Card><div className="text-sm text-red-300">{err}</div></Card>}
    {rows.map(row => (
      <MessageEditor key={row.key} row={row} toast={toast} onSaved={load} />
    ))}
  </div>;
}

function MessageEditor({ row, toast, onSaved }) {
  const [f, setF] = useState(row);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setF(row); }, [row]);

  const set = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));

  function pick(field, maxMb) {
    return (e) => {
      const file = e.target.files?.[0]; if (!file) return;
      if (file.size > maxMb * 1024 * 1024) return toast(`Image must be under ${maxMb} MB`, 'err');
      const rd = new FileReader();
      rd.onload = () => setF(s => ({
        ...s, [`${field}_data`]: rd.result, [`${field}_url`]: rd.result,
      }));
      rd.readAsDataURL(file);
    };
  }

  async function save(publishedOverride) {
    const body = { ...f, key: f.key };
    if (publishedOverride !== undefined) body.published = publishedOverride;
    if (body.published && !String(body.message || '').trim()) {
      return toast('Write the message before publishing it.', 'err');
    }
    setSaving(true);
    const r = await aPatch('/api/admin/messages', body);
    setSaving(false);
    if (!r?.ok) return toast(`${r?.message || 'Save failed'}${r?.hint ? ` — ${r.hint}` : ''}`, 'err');
    toast(body.published ? 'Saved and showing on the home page' : 'Saved — hidden from the home page');
    onSaved();
  }

  const words = String(f.message || '').trim().split(/\s+/).filter(Boolean).length;

  return <Card>
    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
      <h3 className="font-black text-tnr-cream">{f.heading || f.key}</h3>
      <span className={`text-[11px] px-2 py-1 rounded-full ${f.published
        ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-tnr-cream/50'}`}>
        {f.published ? 'Showing on the home page' : 'Hidden'}
      </span>
    </div>

    <div className="grid sm:grid-cols-2 gap-3">
      <Field label="Section heading"><input className="input" value={f.heading || ''} onChange={set('heading')} /></Field>
      <Field label="Name"><input className="input" value={f.name || ''} onChange={set('name')} placeholder="Full name" /></Field>
      <Field label="Designation"><input className="input" value={f.designation || ''} onChange={set('designation')} /></Field>
    </div>

    <Field label={`Message${words ? ` — ${words} word${words === 1 ? '' : 's'}` : ''}`}>
      <textarea className="input min-h-[190px] leading-relaxed" value={f.message || ''}
        onChange={set('message')}
        placeholder="Write the message here. Leave a blank line between paragraphs." />
    </Field>
    <p className="-mt-1 mb-3 text-[11px] text-tnr-cream/40">
      Blank lines become paragraph breaks on the home page. Around 80–150 words reads best.
    </p>

    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <span className="label">Photo</span>
        <div className="flex items-center gap-3 mt-1">
          {f.photo_url
            ? <img src={f.photo_url} alt="" className="h-16 w-16 rounded-full object-cover object-top" />
            : <div className="h-16 w-16 rounded-full bg-white/10 grid place-items-center text-[10px] text-tnr-cream/50">None</div>}
          <div>
            <input type="file" accept="image/*" onChange={pick('photo', 3)} className="text-xs text-tnr-cream/70" />
            <p className="text-[11px] text-tnr-cream/40 mt-1">Square headshot works best. Max 3 MB.</p>
          </div>
        </div>
      </div>
      <div>
        <span className="label">Signature <span className="text-tnr-cream/40">(optional)</span></span>
        <div className="flex items-center gap-3 mt-1">
          {f.signature_url
            ? <img src={f.signature_url} alt="" className="h-12 bg-white rounded-lg px-2 object-contain" />
            : <div className="h-12 w-24 rounded-lg bg-white/10 grid place-items-center text-[10px] text-tnr-cream/50">None</div>}
          <div>
            <input type="file" accept="image/*" onChange={pick('signature', 2)} className="text-xs text-tnr-cream/70" />
            <p className="text-[11px] text-tnr-cream/40 mt-1">PNG on white. Max 2 MB.</p>
          </div>
        </div>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2 mt-5">
      <button className="btn" disabled={saving} onClick={() => save()}>
        {saving ? 'Saving…' : 'Save'}
      </button>
      {f.published
        ? <button className="btn-ghost" disabled={saving} onClick={() => save(false)}>Hide from home page</button>
        : <button className="btn-ghost" disabled={saving} onClick={() => save(true)}>Publish to home page</button>}
    </div>
  </Card>;
}
