'use client';
import { useEffect, useState } from 'react';
import { aGet, aPost, aPatch } from './adminApi';
import { Card, Badge, Field } from './ui';

export default function ElectionsTab({ toast, admin, reloadElections }) {
  const [elections, setElections] = useState([]); const [positions, setPositions] = useState([]); const [settings, setSettings] = useState([]);
  const [form, setForm] = useState(null); const [lockInfo, setLockInfo] = useState({});
  const load = () => aGet('/api/admin/elections').then(r => { if (r.ok) { setElections(r.elections); setPositions(r.positions); setSettings(r.settings); } });
  useEffect(() => { load(); }, []);
  const posOf = eid => positions.filter(p => p.election_id === eid);
  const setOf = eid => settings.find(s => s.election_id === eid) || {};

  async function create() {
    const r = await aPost('/api/admin/elections', form);
    if (!r.ok) return toast(r.message, 'err'); toast('Election created'); setForm(null); load(); reloadElections?.();
  }
  async function setStatus(e, status) {
    const r = await aPatch('/api/admin/elections/' + e.id, { status });
    if (!r.ok) return toast(r.message, 'err'); toast('Status: ' + status); load(); reloadElections?.();
  }
  async function publish(e, val) { const r = await aPatch('/api/admin/elections/' + e.id, { result_published: val }); if (!r.ok) return toast(r.message, 'err'); toast(val ? 'Results published' : 'Results hidden'); load(); }
  async function lock(e) {
    if (!confirm('Lock the voter list? All Approved members will be added and can no longer be edited for this election.')) return;
    const r = await aPost('/api/admin/lock', { election_id: e.id });
    if (!r.ok) return toast(r.message, 'err'); toast(`Locked ${r.locked_count} voters`); load();
  }
  async function saveSettings(eid, patch) {
    const r = await aPatch('/api/admin/settings', { election_id: eid, ...patch });
    if (!r.ok) return toast(r.message, 'err'); toast('Fairness settings saved'); load();
  }

  return <div className="space-y-4">
    <div className="flex justify-end"><button className="btn-green" onClick={() => setForm({ title: '', description: '', starts_at: '', ends_at: '', positions: ['President','Vice President','General Secretary','Finance Secretary','Committee Member'] })}>+ Create Election</button></div>
    {elections.map(e => { const st = setOf(e.id); return (
      <Card key={e.id}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2"><h3 className="font-bold text-tnr-cream text-lg">{e.title}</h3><Badge>{e.status}</Badge>
              {e.voter_list_locked && <Badge tone="gold">🔒 Locked</Badge>}{e.result_published && <Badge>📢 Published</Badge>}</div>
            <p className="text-sm text-tnr-cream/60 mt-1">{e.description}</p>
            <p className="text-xs text-tnr-cream/40 mt-1">{e.starts_at ? new Date(e.starts_at).toLocaleString() : '—'} → {e.ends_at ? new Date(e.ends_at).toLocaleString() : '—'}</p>
            <div className="flex flex-wrap gap-1 mt-2">{posOf(e.id).map(p => <span key={p.id} className="chip bg-white/5 text-tnr-cream/70">{p.title}</span>)}</div>
            {e.voter_list_locked && <p className="text-xs text-tnr-goldLight mt-2">Locked by {e.locked_by} · {e.locked_at ? new Date(e.locked_at).toLocaleString() : ''}</p>}
          </div>
        </div>
        <div className="gold-divider my-3" />
        <div className="flex flex-wrap gap-2">
          {!e.voter_list_locked && <button className="btn-gold !py-2 text-sm" onClick={() => lock(e)}>🔒 Lock Voter List</button>}
          {e.status !== 'Active' && <button className="btn-green !py-2 text-sm" onClick={() => setStatus(e, 'Active')}>▶ Start</button>}
          {e.status === 'Active' && <button className="btn-ghost !py-2 text-sm" onClick={() => setStatus(e, 'Paused')}>⏸ Pause</button>}
          {e.status !== 'Ended' && <button className="btn-ghost !py-2 text-sm" onClick={() => setStatus(e, 'Ended')}>⏹ End</button>}
          {!e.result_published ? <button className="btn-ghost !py-2 text-sm" onClick={() => publish(e, true)}>📢 Publish Results</button>
            : <button className="btn-ghost !py-2 text-sm" onClick={() => publish(e, false)}>Hide Results</button>}
        </div>
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-tnr-goldLight">Fairness / Result settings</summary>
          <div className="grid sm:grid-cols-2 gap-2 mt-3 text-sm">
            <Check label="Hide candidate results during voting" v={st.hide_results_during} on={v => saveSettings(e.id, { hide_results_during: v })} />
            <Check label="Show only participation while voting" v={st.show_participation_only} on={v => saveSettings(e.id, { show_participation_only: v })} />
            <Check label="Show full results after election ends" v={st.show_full_after_end} on={v => saveSettings(e.id, { show_full_after_end: v })} />
            <Check label="Admin live result preview" v={st.admin_live_preview} on={v => saveSettings(e.id, { admin_live_preview: v })} />
          </div>
          <div className="mt-3">
            <span className="label">Public result visibility (fairness)</span>
            <select className="input" value={st.result_mode || 'after_close'} onChange={ev => saveSettings(e.id, { result_mode: ev.target.value })}>
              <option value="after_close">Hide vote data until election closes (recommended)</option>
              <option value="hidden">Hide all results (until published)</option>
              <option value="leading">Show leading status only (no numbers)</option>
              <option value="percent">Show percentages + leading (no exact counts)</option>
              <option value="full">Show exact vote counts live</option>
            </select>
          </div>
        </details>
      </Card>); })}

    {form && <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setForm(null)}>
      <div className="card p-6 w-full max-w-lg animate-pop max-h-[90vh] overflow-auto" onClick={ev => ev.stopPropagation()}>
        <h3 className="font-bold text-tnr-goldLight text-lg mb-4">Create Election</h3>
        <Field label="Title *"><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Description"><textarea className="input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-x-3">
          <Field label="Start"><input type="datetime-local" className="input" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })} /></Field>
          <Field label="End"><input type="datetime-local" className="input" value={form.ends_at} onChange={e => setForm({ ...form, ends_at: e.target.value })} /></Field>
        </div>
        <Field label="Positions (comma separated)"><input className="input" value={form.positions.join(', ')} onChange={e => setForm({ ...form, positions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></Field>
        <div className="flex gap-3 mt-2"><button className="btn-ghost flex-1" onClick={() => setForm(null)}>Cancel</button><button className="btn-gold flex-1" onClick={create}>Create</button></div>
      </div>
    </div>}
  </div>;
}
function Check({ label, v, on }) {
  return <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/5">
    <input type="checkbox" checked={!!v} onChange={e => on(e.target.checked)} className="w-4 h-4 accent-tnr-gold" />
    <span className="text-tnr-cream/80">{label}</span></label>;
}
