'use client';
import { useEffect, useState, useMemo } from 'react';
import { aGet, aPost } from './adminApi';
import { Card, Badge } from './ui';

export default function CommitteeVoteTab({ toast }) {
  const [data, setData] = useState(null);
  const [q, setQ] = useState('');
  const [voter, setVoter] = useState(null);
  const [positionId, setPositionId] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const load = () => aGet('/api/admin/committee-vote').then(r => { if (r.ok) setData(r); else toast(r.message || 'Forbidden', 'err'); });
  useEffect(() => { load(); }, []);

  const remaining = data?.remaining || [];
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return !s ? remaining.slice(0, 50) : remaining.filter(m => (m.full_name || '').toLowerCase().includes(s) || (m.mobile || '').includes(s)).slice(0, 50);
  }, [q, remaining]);
  const candidates = (data?.candidates || []).filter(c => !positionId || String(c.position_id) === String(positionId));
  const ready = voter && candidateId && positionId;

  async function submit() {
    setBusy(true);
    const r = await aPost('/api/admin/committee-vote', { member_id: voter.id, candidate_id: candidateId });
    setBusy(false); setConfirm(false);
    if (!r.ok) return toast(r.message, 'err');
    setDone({ voter, receipt: r.receipt_code });
    setVoter(null); setPositionId(''); setCandidateId(''); setQ('');
    load();
  }

  if (!data) return <p className="text-tnr-cream/50">Loading…</p>;
  if (!data.election) return <Card><p className="text-tnr-cream/60">No active election.</p></Card>;

  const candName = id => (data.candidates.find(c => c.id === id) || {}).name;
  const posName = id => (data.positions.find(p => String(p.id) === String(id)) || {}).title;

  return <div className="space-y-4 max-w-2xl">
    <div className="card p-3 text-xs text-tnr-cream/60 border-tnr-gold/40">
      🔒 Super Admin only. Each entry records one real ballot for a remaining eligible voter and counts exactly like an online vote. You cannot enter vote numbers directly.
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="stat"><div className="text-3xl font-black text-tnr-gold">{remaining.length}</div><div className="text-[11px] uppercase tracking-wider text-tnr-cream/50">Remaining Voters</div></div>
      <div className="stat"><div className="text-3xl font-black text-tnr-cream">{data.election.title}</div><div className="text-[11px] uppercase tracking-wider text-tnr-cream/50">Active Election</div></div>
    </div>

    <Card>
      <ol className="space-y-4">
        <li>
          <div className="label">1 · Select remaining voter</div>
          {voter ? (
            <div className="flex items-center justify-between rounded-xl border border-tnr-gold/40 bg-black/30 px-3 py-2">
              <span className="text-tnr-cream font-medium">{voter.full_name} <span className="text-tnr-cream/50 text-sm">· {voter.mobile}</span></span>
              <button className="text-tnr-goldLight text-sm hover:underline" onClick={() => setVoter(null)}>change</button>
            </div>
          ) : (
            <>
              <input className="input" placeholder="Search name or number…" value={q} onChange={e => setQ(e.target.value)} />
              <div className="mt-2 max-h-52 overflow-auto rounded-xl border border-tnr-line divide-y divide-tnr-line/40">
                {filtered.map(m => <button key={m.id} onClick={() => setVoter(m)} className="w-full text-left px-3 py-2 hover:bg-white/5 text-sm">
                  <span className="text-tnr-cream">{m.full_name}</span> <span className="text-tnr-cream/40">· {m.mobile}</span></button>)}
                {!filtered.length && <div className="px-3 py-3 text-tnr-cream/40 text-sm">No remaining voters match.</div>}
              </div>
            </>
          )}
        </li>
        <li>
          <div className="label">2 · Select position</div>
          <select className="input" value={positionId} onChange={e => { setPositionId(e.target.value); setCandidateId(''); }}>
            <option value="">— choose position —</option>
            {data.positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </li>
        <li>
          <div className="label">3 · Select candidate</div>
          <select className="input" value={candidateId} onChange={e => setCandidateId(e.target.value)} disabled={!positionId}>
            <option value="">— choose candidate —</option>
            {candidates.map(c => <option key={c.id} value={c.id}>{c.name}{c.symbol ? ` (${c.symbol})` : ''}</option>)}
          </select>
        </li>
      </ol>
      <button className="btn-gold w-full mt-5 text-lg" disabled={!ready} onClick={() => setConfirm(true)}>CONFIRM VOTE ENTRY</button>
    </Card>

    {confirm && <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setConfirm(false)}>
      <div className="card p-6 w-full max-w-sm animate-pop text-center" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-tnr-goldLight mb-2">Confirm vote entry</h3>
        <p className="text-sm text-tnr-cream/80">Record a ballot for<br /><b className="text-tnr-cream">{voter?.full_name}</b><br />
          {posName(positionId)} → <b className="text-tnr-goldLight">{candName(candidateId)}</b></p>
        <p className="text-xs text-tnr-cream/50 mt-3">This cannot be undone and counts as one valid vote.</p>
        <div className="flex gap-3 mt-4"><button className="btn-ghost flex-1" onClick={() => setConfirm(false)}>Go Back</button>
          <button className="btn-gold flex-1" disabled={busy} onClick={submit}>{busy ? '…' : 'Confirm'}</button></div>
      </div>
    </div>}

    {done && <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setDone(null)}>
      <div className="card p-6 w-full max-w-sm animate-pop text-center" onClick={e => e.stopPropagation()}>
        <div className="text-4xl mb-2">✅</div>
        <h3 className="text-lg font-bold text-tnr-goldLight">Vote entry recorded</h3>
        <p className="text-sm text-tnr-cream/70 mt-1">{done.voter.full_name} is now marked as voted.</p>
        <div className="my-3 py-2 rounded-xl bg-black/30 border border-tnr-line"><div className="text-xs text-tnr-cream/50">Receipt</div><div className="font-black tracking-widest text-tnr-gold">{done.receipt}</div></div>
        <button className="btn-gold w-full" onClick={() => setDone(null)}>Enter another</button>
      </div>
    </div>}
  </div>;
}
