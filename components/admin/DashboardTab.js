'use client';
import { useEffect, useState } from 'react';
import { aGet } from './adminApi';
import { Card, Stat, Badge } from './ui';
export default function DashboardTab() {
  const [d, setD] = useState(null);
  useEffect(() => { aGet('/api/admin/dashboard').then(setD); }, []);
  if (!d?.ok) return <p className="text-tnr-cream/50">Loading…</p>;
  return <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Stat label="Total Members" value={d.members.total} />
      <Stat label="Approved" value={d.members.approved} tone="green" />
      <Stat label="Pending" value={d.members.pending} tone="gold" />
      <Stat label="Blocked" value={d.members.blocked} tone="red" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Stat label="Votes Cast" value={d.votes_cast} tone="gold" />
      <Stat label="Total Voters" value={d.total_voters} />
      <Stat label="Remaining" value={d.remaining} />
      <Stat label="Active Elections" value={d.active_elections} tone="green" />
    </div>
    <Card>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-tnr-goldLight">Election Progress</h3>
        {d.election && <Badge>{d.election.status}</Badge>}
      </div>
      {d.election ? <>
        <p className="text-tnr-cream/70 text-sm mb-2">{d.election.title}</p>
        <div className="h-3 rounded-full bg-black/40 overflow-hidden"><div className="h-full bg-gradient-to-r from-tnr-green2 to-tnr-gold" style={{ width: `${d.progress}%` }} /></div>
        <p className="text-right text-xs text-tnr-goldLight mt-1">{d.progress}% turnout</p>
      </> : <p className="text-tnr-cream/50 text-sm">No active election.</p>}
    </Card>
    {/* Recent Activity is visible to Super Admins only. */}
    {d.show_activity && <Card>
      <h3 className="font-bold text-tnr-goldLight mb-3">Recent Activity</h3>
      <div className="space-y-1.5 max-h-72 overflow-auto">
        {(d.recent_logs || []).map(l => <div key={l.id} className="flex items-center justify-between text-sm border-b border-tnr-line/50 py-1.5">
          <span className="text-tnr-cream/80"><b className="text-tnr-goldLight">{l.action}</b> {l.details ? `— ${l.details}` : ''}</span>
          <span className="text-tnr-cream/40 text-xs whitespace-nowrap ml-3">{new Date(l.created_at).toLocaleString()}</span>
        </div>)}
        {!(d.recent_logs || []).length && <p className="text-tnr-cream/40 text-sm">No activity yet.</p>}
      </div>
    </Card>}
  </div>;
}
