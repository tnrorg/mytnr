'use client';
import { useEffect, useState, useCallback } from 'react';
import { Logo } from '@/components/Brand';
import dynamicImport from 'next/dynamic';
import { getToken, clearToken, aGet } from '@/components/admin/adminApi';
import { Toast } from '@/components/admin/ui';
import Login from '@/components/admin/Login';
import DashboardTab from '@/components/admin/DashboardTab';
import MembersTab from '@/components/admin/MembersTab';
import CandidatesTab from '@/components/admin/CandidatesTab';
import ElectionsTab from '@/components/admin/ElectionsTab';
import RecordsTab from '@/components/admin/RecordsTab';
import ResultsTab from '@/components/admin/ResultsTab';
import LogsTab from '@/components/admin/LogsTab';
import CommitteeTab from '@/components/admin/CommitteeTab';
import RemindersTab from '@/components/admin/RemindersTab';
// Loaded on demand, only after the SERVER confirms Super Admin.
const CommitteeVoteTab = dynamicImport(() => import('@/components/admin/CommitteeVoteTab'), { ssr: false });
const AdminsTab = dynamicImport(() => import('@/components/admin/AdminsTab'), { ssr: false });

const BASE_TABS = [
  ['dashboard', 'Dashboard', '📊'], ['members', 'Members', '👥'], ['candidates', 'Candidates', '🎖️'],
  ['elections', 'Elections', '🗳️'], ['ecommittee', 'Committee', '🤝'], ['reminders', 'Reminders', '📧'], ['records', 'Voting Records', '📋'], ['results', 'Results', '🏆'], ['logs', 'Audit Logs', '🧾'],
];

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [extraTabs, setExtraTabs] = useState([]);   // supplied by the server, empty for normal admins
  const [roleLabel, setRoleLabel] = useState('Control Panel');
  const [tab, setTab] = useState('dashboard');
  // The server is the only source of truth for what this account may see.
  async function loadMe() {
    const r = await aGet('/api/admin/me');
    if (!r?.ok) { setExtraTabs([]); setRoleLabel('Control Panel'); return; }
    setAdmin(a => a || { username: r.username, full_name: r.full_name });
    setExtraTabs(r.extra_tabs || []);
    setRoleLabel(r.label || 'Control Panel');
  }
  const hasTab = (k) => extraTabs.some(t => t[0] === k);

  const [toastMsg, setToastMsg] = useState(''); const [toastTone, setToastTone] = useState('ok');
  const [elections, setElections] = useState([]);

  const toast = (msg, tone = 'ok') => { setToastMsg(msg); setToastTone(tone); setTimeout(() => setToastMsg(''), 2600); };
  const reloadElections = useCallback(() => { aGet('/api/admin/elections').then(r => r.ok && setElections(r.elections)); }, []);

  useEffect(() => {
    if (getToken()) { setAuthed(true); loadMe(); }
    const onLogout = () => { setAuthed(false); setAdmin(null); setExtraTabs([]); setRoleLabel('Control Panel'); };
    window.addEventListener('tnr-logout', onLogout);
    return () => window.removeEventListener('tnr-logout', onLogout);
  }, []);
  useEffect(() => { if (authed) reloadElections(); }, [authed, reloadElections]);

  if (!authed) return <Login onIn={a => { setAdmin(a); setAuthed(true); loadMe(); }} />;

  const TABS = [...BASE_TABS, ...extraTabs];
  const activeTab = TABS.find(t => t[0] === tab) || TABS[0];

  return <div className="min-h-screen flex flex-col md:flex-row">
    <aside className="md:w-60 md:min-h-screen border-b md:border-b-0 md:border-r border-tnr-line bg-tnr-black/40 backdrop-blur">
      <div className="p-4 flex items-center gap-3 border-b border-tnr-line"><Logo size={40} />
        <div><div className="font-bold text-sm text-tnr-cream">TNR Admin</div>
          <div className="text-[10px] text-tnr-gold uppercase tracking-widest">{roleLabel}</div></div></div>
      <nav className="p-2 flex md:flex-col gap-1 overflow-x-auto">
        {TABS.map(([k, label, icon]) => <button key={k} onClick={() => setTab(k)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm whitespace-nowrap transition ${tab === k ? 'bg-tnr-gold text-tnr-black font-semibold' : 'text-tnr-cream/70 hover:bg-white/5'}`}>
          <span>{icon}</span>{label}</button>)}
      </nav>
      <div className="p-2 md:mt-auto">
        <button onClick={() => { clearToken(); setAuthed(false); }} className="w-full btn-ghost !py-2 text-sm">Sign out</button>
      </div>
    </aside>

    <main className="flex-1 p-4 sm:p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-black heading-gold">{activeTab?.[1]}</h1>
        <a href="/" className="text-sm text-tnr-cream/50 hover:text-tnr-gold">View site →</a>
      </div>
      {tab === 'dashboard' && <DashboardTab />}
      {tab === 'members' && <MembersTab toast={toast} />}
      {tab === 'candidates' && <CandidatesTab toast={toast} elections={elections} />}
      {tab === 'elections' && <ElectionsTab toast={toast} admin={admin} reloadElections={reloadElections} />}
      {tab === 'records' && <RecordsTab />}
      {tab === 'results' && <ResultsTab elections={elections} />}
      {tab === 'logs' && <LogsTab />}
      {tab === 'ecommittee' && <CommitteeTab toast={toast} />}
      {tab === 'reminders' && <RemindersTab toast={toast} />}
      {tab === 'committee' && hasTab('committee') && <CommitteeVoteTab toast={toast} />}
      {tab === 'admins' && hasTab('admins') && <AdminsTab toast={toast} me={admin} />}
    </main>
    <Toast msg={toastMsg} tone={toastTone} />
  </div>;
}
