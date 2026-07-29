'use client';
import { useEffect, useState } from 'react';
import { aGet, aPatch, aPost } from './adminApi';
import { exportExcel } from './exporters';

const TONE = {
  active: 'bg-green-500/15 text-green-300 border-green-500/30',
  approved: 'bg-green-500/15 text-green-300 border-green-500/30',
  suspended: 'bg-red-500/15 text-red-300 border-red-500/30',
  inactive: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
  expired: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
};

export default function MembersDirectoryTab({ toast }) {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    const q = new URLSearchParams({ status, search });
    aGet('/api/admin/membership/members?' + q).then(r => r.ok && setRows(r.members || []));
  };
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t);
    /* eslint-disable-next-line */ }, [status, search]);

  async function change(m, patch, confirmText) {
    if (confirmText && !confirm(confirmText)) return;
    if (patch.status && ['suspended', 'inactive', 'expired'].includes(patch.status)) {
      const reason = prompt(`Reason for setting this member to ${patch.status} (shown to the member):`);
      if (!reason || !reason.trim()) return;
      patch.reason = reason.trim();
    }
    const r = await aPatch('/api/admin/membership/members/' + m.id, patch);
    if (!r.ok) return toast?.(r.message || 'Failed', 'err');
    toast?.('Member updated', 'ok'); load();
  }

  async function resend(m) {
    const r = await aPost(`/api/admin/membership/members/${m.id}/resend-invite`, {});
    toast?.(r.ok ? 'Invitation sent' : (r.message || 'Failed'), r.ok ? 'ok' : 'err');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <h2 className="text-xl font-bold text-tnr-cream">Members</h2>
          <p className="text-sm text-tnr-cream/50 mt-1">
            Approved members. Suspending a member blocks portal access and removes them from the public directory.
          </p>
        </div>
        <button className="btn-ghost !py-2 text-sm"
          onClick={() => exportExcel(rows.map(m => ({
            'Membership ID': m.membership_id, Name: m.full_name, Email: m.email, Mobile: m.mobile,
            Gender: m.gender, Village: m.village, 'Union Council': m.union_council,
            Education: m.education_level, Position: m.current_position,
            Status: m.status, Public: m.public_visible ? 'Yes' : 'No',
            Approved: m.approved_at ? new Date(m.approved_at).toLocaleDateString('en-GB') : '',
          })), 'Members', 'tnr-membership.xlsx')}>⬇ Export Excel</button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <input className="input max-w-xs" placeholder="Search name / email / ID / village"
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex flex-wrap gap-1.5">
          {[['', 'All'], ['active', 'Active'], ['suspended', 'Suspended'], ['inactive', 'Inactive'], ['expired', 'Expired']].map(([k, l]) => (
            <button key={k || 'all'} onClick={() => setStatus(k)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition ${status === k
                ? 'bg-tnr-gold text-tnr-black border-tnr-gold font-semibold'
                : 'border-tnr-line text-tnr-cream/60 hover:bg-white/5'}`}>{l}</button>
          ))}
        </div>
        <span className="ml-auto text-xs text-tnr-cream/40">{rows.length} member(s)</span>
      </div>

      <div className="rounded-2xl border border-tnr-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-tnr-cream/50 border-b border-tnr-line">
              <th className="px-3 py-2.5">Membership ID</th><th className="px-3 py-2.5">Name</th>
              <th className="px-3 py-2.5">Email</th><th className="px-3 py-2.5">Village</th>
              <th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5">Public</th>
              <th className="px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(m => (
              <tr key={m.id} className="border-t border-tnr-line/40 hover:bg-white/5">
                <td className="px-3 py-2 font-mono text-xs text-tnr-gold/90 whitespace-nowrap">{m.membership_id}</td>
                <td className="px-3 py-2 font-medium text-tnr-cream">{m.full_name}</td>
                <td className="px-3 py-2 text-tnr-cream/70">{m.email}</td>
                <td className="px-3 py-2 text-tnr-cream/70">{m.village || '—'}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${TONE[m.status] || ''}`}>
                    {m.status}</span></td>
                <td className="px-3 py-2">
                  <button onClick={() => change(m, { public_visible: !m.public_visible })}
                    className={`text-xs ${m.public_visible ? 'text-green-400' : 'text-tnr-cream/40'}`}>
                    {m.public_visible ? 'Visible' : 'Hidden'}</button></td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">
                  {['active', 'approved'].includes(m.status)
                    ? <button onClick={() => change(m, { status: 'suspended' })} className="text-red-400 hover:underline mr-2">Suspend</button>
                    : <button onClick={() => change(m, { status: 'active' }, `Reactivate ${m.full_name}?`)} className="text-green-400 hover:underline mr-2">Reactivate</button>}
                  <button onClick={() => resend(m)} className="text-tnr-goldLight hover:underline">Resend Invite</button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={7} className="px-3 py-10 text-center text-tnr-cream/40">
              No members yet. Approve an application to create the first member.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
