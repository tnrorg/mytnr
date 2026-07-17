'use client';
import { useEffect, useState } from 'react';
import { aGet, aPost, aPatch, aDel } from './adminApi';
import { parseFile, exportExcel } from './exporters';
import { Card, Badge, Field } from './ui';

const empty = { member_code: '', full_name: '', father_name: '', cnic: '', mobile: '', whatsapp: '', email: '', village: '', union_id: '', gender: '', status: 'Pending' };

export default function MembersTab({ toast }) {
  const [members, setMembers] = useState([]);
  const [unions, setUnions] = useState([]);
  const [search, setSearch] = useState(''); const [status, setStatus] = useState(''); const [union, setUnion] = useState('');
  const [form, setForm] = useState(null);
  const load = () => { const q = new URLSearchParams({ search, status, union }); aGet('/api/admin/members?' + q).then(r => r.ok && setMembers(r.members)); };
  useEffect(() => { aGet('/api/admin/unions').then(r => r.ok && setUnions(r.unions)); }, []);
  useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id); /* eslint-disable-next-line */ }, [search, status, union]);
  const uname = id => unions.find(u => u.id === id)?.union_name || '-';

  async function save() {
    const body = { ...form, union_id: form.union_id ? Number(form.union_id) : null };
    const r = form.id ? await aPatch('/api/admin/members/' + form.id, body) : await aPost('/api/admin/members', body);
    if (!r.ok) return toast(r.message, 'err');
    toast(form.id ? 'Member updated' : 'Member added'); setForm(null); load();
  }
  async function setStatusOf(m, s) { const r = await aPatch('/api/admin/members/' + m.id, { status: s }); if (!r.ok) return toast(r.message, 'err'); toast('Updated'); load(); }
  async function del(m) { if (!confirm('Delete ' + m.full_name + '?')) return; const r = await aDel('/api/admin/members/' + m.id); if (!r.ok) return toast(r.message, 'err'); toast('Deleted'); load(); }
  async function onImport(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const rows = await parseFile(file);
    const approve = confirm('Import ' + rows.length + ' rows.\n\nOK = mark them all APPROVED (ready to vote)\nCancel = import as Pending');
    const r = await aPost('/api/admin/members/import', { rows, default_status: approve ? 'Approved' : 'Pending' });
    e.target.value = '';
    if (!r.ok) return toast(r.message, 'err');
    toast('Imported ' + r.inserted + ', skipped ' + r.skipped); load();
  }
  async function approveAll() {
    if (!confirm('Approve ALL pending members?')) return;
    const r = await aPost('/api/admin/members/approve-all', {});
    if (!r.ok) return toast(r.message || 'Failed', 'err');
    toast('Approved ' + r.approved + ' members'); load();
  }

  return <div className="space-y-4">
    <div className="flex flex-wrap gap-2 items-center">
      <input className="input max-w-xs" placeholder="Search name / mobile / CNIC" value={search} onChange={e => setSearch(e.target.value)} />
      <select className="input max-w-[160px]" value={status} onChange={e => setStatus(e.target.value)}>
        <option value="">All status</option><option>Pending</option><option>Approved</option><option>Blocked</option></select>
      <select className="input max-w-[180px]" value={union} onChange={e => setUnion(e.target.value)}>
        <option value="">All unions</option>{unions.map(u => <option key={u.id} value={u.id}>{u.union_name}</option>)}</select>
      <div className="flex-1" />
      <button className="btn-green" onClick={() => setForm({ ...empty })}>+ Add Member</button>
      <button className="btn-ghost" onClick={approveAll}>Approve All Pending</button>
      <label className="btn-ghost cursor-pointer">Import CSV/Excel<input type="file" accept=".csv,.xlsx,.xls" hidden onChange={onImport} /></label>
      <button className="btn-ghost" onClick={() => exportExcel(members.map(m => ({ 'TNR-MN': m.member_code, Name: m.full_name, Father: m.father_name, CNIC: m.cnic, Mobile: m.mobile, WhatsApp: m.whatsapp, Email: m.email, Union: uname(m.union_id), Gender: m.gender, Status: m.status, Voting: m.voting_status })), 'Members', 'tnr-members.xlsx')}>Export</button>
    </div>

    <Card className="!p-0 overflow-hidden">
      <div className="overflow-auto max-h-[65vh]">
        <table className="w-full text-sm">
          <thead className="bg-black/30 sticky top-0"><tr className="text-tnr-cream/60 text-left">
            {['TNR-MN','Name','Mobile','Union','Status','Voting',''].map(h => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {members.map(m => <tr key={m.id} className="border-t border-tnr-line/40 hover:bg-white/5">
              <td className="px-3 py-2 text-tnr-gold/90 font-mono text-xs whitespace-nowrap">{m.member_code || '—'}</td>
              <td className="px-3 py-2"><div className="font-medium text-tnr-cream">{m.full_name}</div><div className="text-xs text-tnr-cream/40">{m.father_name}</div></td>
              <td className="px-3 py-2 text-tnr-cream/80">{m.mobile}</td>
              <td className="px-3 py-2 text-tnr-cream/70">{uname(m.union_id)}</td>
              <td className="px-3 py-2"><Badge>{m.status}</Badge></td>
              <td className="px-3 py-2"><Badge>{m.voting_status}</Badge></td>
              <td className="px-3 py-2 whitespace-nowrap">
                {m.status !== 'Approved' && <button className="text-green-400 hover:underline mr-2" onClick={() => setStatusOf(m, 'Approved')}>Approve</button>}
                {m.status !== 'Blocked' && <button className="text-red-400 hover:underline mr-2" onClick={() => setStatusOf(m, 'Blocked')}>Block</button>}
                <button className="text-tnr-goldLight hover:underline mr-2" onClick={() => setForm({ ...m, union_id: m.union_id || '' })}>Edit</button>
                <button className="text-tnr-cream/50 hover:underline" onClick={() => del(m)}>Del</button>
              </td>
            </tr>)}
            {!members.length && <tr><td colSpan={7} className="px-3 py-8 text-center text-tnr-cream/40">No members found.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>

    {form && <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setForm(null)}>
      <div className="card p-6 w-full max-w-lg animate-pop max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-tnr-goldLight text-lg mb-4">{form.id ? 'Edit' : 'Add'} Member</h3>
        <div className="grid grid-cols-2 gap-x-3">
          <Field label="TNR-MN Code"><input className="input" placeholder="TNR-MN-0001" value={form.member_code || ''} onChange={e => setForm({ ...form, member_code: e.target.value })} /></Field>
          <Field label="Full Name *"><input className="input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></Field>
          <Field label="Father Name"><input className="input" value={form.father_name || ''} onChange={e => setForm({ ...form, father_name: e.target.value })} /></Field>
          <Field label="CNIC / ID"><input className="input" value={form.cnic || ''} onChange={e => setForm({ ...form, cnic: e.target.value })} /></Field>
          <Field label="Mobile *"><input className="input" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} /></Field>
          <Field label="WhatsApp"><input className="input" value={form.whatsapp || ''} onChange={e => setForm({ ...form, whatsapp: e.target.value })} /></Field>
          <Field label="Email"><input className="input" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Village / Area"><input className="input" value={form.village || ''} onChange={e => setForm({ ...form, village: e.target.value })} /></Field>
          <Field label="Union"><select className="input" value={form.union_id || ''} onChange={e => setForm({ ...form, union_id: e.target.value })}>
            <option value="">—</option>{unions.map(u => <option key={u.id} value={u.id}>{u.union_name}</option>)}</select></Field>
          <Field label="Gender"><select className="input" value={form.gender || ''} onChange={e => setForm({ ...form, gender: e.target.value })}>
            <option value="">—</option><option>Male</option><option>Female</option><option>Other</option></select></Field>
          <Field label="Status"><select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option>Pending</option><option>Approved</option><option>Blocked</option></select></Field>
        </div>
        <div className="flex gap-3 mt-3"><button className="btn-ghost flex-1" onClick={() => setForm(null)}>Cancel</button>
          <button className="btn-gold flex-1" onClick={save}>Save</button></div>
      </div>
    </div>}
  </div>;
}
