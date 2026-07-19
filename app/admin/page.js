'use client';
import { useEffect, useState, useCallback } from 'react';
import { Logo } from '@/components/Brand';
import { getToken, clearToken, aGet, isSuper } from '@/components/admin/adminApi';
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
import CommitteeVoteTab from '@/components/admin/CommitteeVoteTab';
import AdminsTab from '@/components/admin/AdminsTab';

const BASE_TABS = [
  ['dashboard', 'Dashboard', '📊'], ['members', 'Members', '👥'], ['candidates', 'Candidates', '🎖️'],
  ['elections', 'Elections', '🗳️'], ['ecommittee', 'Committee', '🤝'], ['reminders', 'Reminders', '📧'], ['records', 'Voting Records', '📋'], ['results', 'Results', '🏆'], ['logs', 'Audit Logs', '🧾'],
];
// Super-Admin-only tabs
const SUPER_TAB = ['committee', 'Committee Vote Entry', '🔐'];
const SUPER_TAB_ADMINS = ['admins', 'Admin Accounts', '🛡️'];

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [superAdmin, setSuperAdmin] = useState(false);
  const [tab, setTab] = useState('dashboard');
  const [toastMsg, setToastMsg] = useState(''); const [toastTone, setToastTone] = useState('ok');
  const [elections, setElections] = useState([]);

  const toast = (msg, tone = 'ok') => { setToastMsg(msg); setToastTone(tone); setTimeout(() => setToastMsg(''), 2600); };
  const reloadElections = useCallback(() => { aGet('/api/admin/elections').then(r => r.ok && setElections(r.elections)); }, []);

  useEffect(() => {
    if (getToken()) { setAuthed(true); setSuperAdmin(isSuper()); }
    const onLogout = () => { setAuthed(false); setAdmin(null); setSuperAdmin(false); };
    window.addEventListener('tnr-logout', onLogout);
    return () => window.removeEventListener('tnr-logout', onLogout);
  }, []);
  useEffect(() => { if (authed) reloadElections(); }, [authed, reloadElections]);

  if (!authed) return <Login onIn={a => { setAdmin(a); setAuthed(true); setSuperAdmin(a?.role === 'super_admin' || a?.role === 'superadmin'); }} />;

  const TABS = superAdmin ? [...BASE_TABS, SUPER_TAB, SUPER_TAB_ADMINS] : BASE_TABS;
  const activeTab = TABS.find(t => t[0] === tab) || TABS[0];

  return <div className="min-h-screen flex flex-col md:flex-row">
    <aside className="md:w-60 md:min-h-screen border-b md:border-b-0 md:border-r border-tnr-line bg-tnr-black/40 backdrop-blur">
      <div className="p-4 flex items-center gap-3 border-b border-tnr-line"><Logo size={40} />
        <div><div className="font-bold text-sm text-tnr-cream">TNR Admin</div>
          <div className="text-[10px] text-tnr-gold uppercase tracking-widest">{superAdmin ? 'Super Admin' : 'Control Panel'}</div></div></div>
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
      {tab === 'committee' && superAdmin && <CommitteeVoteTab toast={toast} />}
      {tab === 'admins' && superAdmin && <AdminsTab toast={toast} me={admin} />}
    </main>
    <Toast msg={toastMsg} tone={toastTone} />
  </div>;
}
