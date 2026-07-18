'use client';
import { useState, useEffect, useRef } from 'react';
import { useLang } from '@/components/useLang';
import { BrandHeader, Logo } from '@/components/Brand';

const api = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());

export default function VotePage() {
  const { lang, toggle, t } = useLang();
  const rtl = lang === 'ur';
  const [step, setStep] = useState('mobile'); // mobile | otp | candidates | success | error
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState('');
  const [otpId, setOtpId] = useState(null);
  const [devCode, setDevCode] = useState(null);
  const [channel, setChannel] = useState(null);
  const [voteToken, setVoteToken] = useState(null);
  const [memberInfo, setMemberInfo] = useState(null);
  const [data, setData] = useState({ positions: [], candidates: [] });
  const [selected, setSelected] = useState(null);
  const [confirmCand, setConfirmCand] = useState(null);
  const [detailCand, setDetailCand] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [errMsg, setErrMsg] = useState('');
  const [errKind, setErrKind] = useState('');
  const [errDetail, setErrDetail] = useState('');

  async function requestOtp(e) {
    e?.preventDefault(); setLoading(true); setErrMsg('');
    const r = await api('/api/vote/request-otp', { mobile });
    setLoading(false);
    if (!r.ok) { setErrKind(r.error); setErrMsg(r.message || 'Error'); setErrDetail(r.detail || ''); setStep('error'); return; }
    setOtpId(r.otp_id); setChannel(r.channel); setDevCode(r.dev_code || null); setStep('otp');
  }
  async function verifyOtp(code) {
    setLoading(true); setErrMsg('');
    const r = await api('/api/vote/verify-otp', { otp_id: otpId, code });
    if (!r.ok) { setLoading(false); return { error: r.message }; }
    setVoteToken(r.vote_token);
    setMemberInfo(r.member || null);
    const cr = await api('/api/public/candidates', { vote_token: r.vote_token });
    setLoading(false);
    if (!cr.ok) return { error: cr.message };
    setData({ positions: cr.positions, candidates: cr.candidates }); setStep('member');
    return {};
  }
  async function castVote() {
    setLoading(true);
    const r = await api('/api/vote/cast', { vote_token: voteToken, candidate_id: confirmCand.id });
    setLoading(false); setConfirmCand(null);
    if (!r.ok) { setErrKind(r.error); setErrMsg(r.message); setStep('error'); return; }
    setReceipt(r.receipt_code); setStep('success');
  }

  return (
    <main className="min-h-screen flex flex-col" dir={rtl ? 'rtl' : 'ltr'}>
      <BrandHeader lang={lang} onToggle={toggle} t={t} />
      <section className="flex-1 flex items-start sm:items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          <Steps step={step} rtl={rtl} />
          {step === 'mobile' && (
            <div className="card p-6 sm:p-8 animate-fade-up">
              <div className="flex flex-col items-center text-center gap-2 mb-6"><Logo size={64} />
                <h1 className={`text-2xl font-bold ${rtl ? 'urdu' : ''}`}>{t.enterMobile}</h1></div>
              <form onSubmit={requestOtp} className="space-y-4">
                <input className="input text-center text-lg tracking-wider" value={mobile} onChange={e => setMobile(e.target.value)}
                  placeholder={t.mobilePlaceholder} inputMode="email" autoCapitalize="none" autoFocus />
                <button className="btn-gold w-full text-lg" disabled={loading || mobile.length < 5}>
                  {loading ? '…' : t.sendOtp}</button>
              </form>
              <p className={`mt-4 text-xs text-center text-tnr-cream/50 ${rtl ? 'urdu' : ''}`}>
                {rtl ? 'صرف رجسٹرڈ اور منظور شدہ اراکین ووٹ ڈال سکتے ہیں۔' : 'Only registered & approved members can vote.'}</p>
            </div>
          )}
          {step === 'otp' && <OtpStep t={t} rtl={rtl} channel={channel} devCode={devCode} loading={loading}
            onVerify={verifyOtp} onResend={requestOtp} />}
          {step === 'member' && <MemberDetails t={t} rtl={rtl} member={memberInfo} onContinue={() => setStep('candidates')} />}
          {step === 'candidates' && <Candidates t={t} rtl={rtl} data={data} onPick={setConfirmCand} onDetail={setDetailCand} />}
          {step === 'success' && <Success t={t} rtl={rtl} receipt={receipt} />}
          {step === 'error' && <ErrorState t={t} rtl={rtl} kind={errKind} msg={errMsg} detail={errDetail} />}
        </div>
      </section>

      {confirmCand && <ConfirmModal t={t} rtl={rtl} cand={confirmCand} positions={data.positions}
        loading={loading} onConfirm={castVote} onCancel={() => setConfirmCand(null)} />}
      {detailCand && <DetailModal t={t} rtl={rtl} cand={detailCand} positions={data.positions} onClose={() => setDetailCand(null)} />}
    </main>
  );
}

function Steps({ step, rtl }) {
  const order = ['mobile', 'otp', 'candidates', 'success'];
  const labels = rtl ? ['نمبر','او ٹی پی','امیدوار','رسید'] : ['Number','OTP','Candidate','Receipt'];
  const key = step === 'error' ? 'mobile' : (step === 'member' ? 'otp' : step);
  const idx = Math.max(0, order.indexOf(key));
  return <div className="flex items-center justify-center gap-2 mb-6">
    {labels.map((l, i) => (<div key={i} className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full grid place-items-center text-xs font-bold border ${i <= idx ? 'bg-tnr-gold text-tnr-black border-tnr-gold' : 'border-tnr-line text-tnr-cream/40'}`}>{i + 1}</div>
      <span className={`text-xs ${i <= idx ? 'text-tnr-goldLight' : 'text-tnr-cream/40'} ${rtl ? 'urdu' : ''} hidden sm:inline`}>{l}</span>
      {i < labels.length - 1 && <div className={`w-6 h-px ${i < idx ? 'bg-tnr-gold' : 'bg-tnr-line'}`} />}
    </div>))}
  </div>;
}

function OtpStep({ t, rtl, channel, devCode, loading, onVerify, onResend }) {
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [left, setLeft] = useState(300);
  const [err, setErr] = useState('');
  const refs = useRef([]);
  useEffect(() => { const id = setInterval(() => setLeft(s => Math.max(0, s - 1)), 1000); return () => clearInterval(id); }, []);
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0');
  function setD(i, v) { v = v.replace(/\D/g, '').slice(-1); const d = [...digits]; d[i] = v; setDigits(d); if (v && i < 5) refs.current[i + 1]?.focus(); }
  async function submit() { const code = digits.join(''); if (code.length !== 6) return; const r = await onVerify(code); if (r?.error) setErr(r.error); }
  useEffect(() => { if (digits.join('').length === 6) submit(); /* eslint-disable-next-line */ }, [digits]);
  return (
    <div className="card p-6 sm:p-8 animate-fade-up text-center">
      <h1 className={`text-2xl font-bold mb-1 ${rtl ? 'urdu' : ''}`}>{t.enterOtp}</h1>
      <p className="text-xs text-tnr-cream/50 mb-5">{channel === 'dev' ? 'TEST MODE (on-screen code)' : channel === 'email' ? 'Sent to your registered email' : channel === 'whatsapp' ? 'Sent via WhatsApp' : 'Sent via SMS'}</p>
      {devCode && <div className="mb-4 chip bg-tnr-gold/20 text-tnr-goldLight border border-tnr-line mx-auto">Dev code: <b className="tracking-widest">{devCode}</b></div>}
      <div className="flex justify-center gap-2 mb-4" dir="ltr">
        {digits.map((d, i) => <input key={i} ref={el => refs.current[i] = el} value={d} onChange={e => setD(i, e.target.value)}
          onKeyDown={e => { if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus(); }}
          className="input otp-input" inputMode="numeric" maxLength={1} autoFocus={i === 0} />)}
      </div>
      {err && <p className="text-red-400 text-sm mb-3">{err}</p>}
      <button className="btn-gold w-full text-lg mb-3" disabled={loading || digits.join('').length !== 6} onClick={submit}>{loading ? '…' : t.verify}</button>
      <div className="flex items-center justify-between text-sm text-tnr-cream/60">
        <span>{t.expiresIn} <b className="text-tnr-goldLight">{mm}:{ss}</b></span>
        <button className="text-tnr-gold hover:underline disabled:opacity-40" disabled={left > 240} onClick={() => { setDigits(Array(6).fill('')); setLeft(300); setErr(''); onResend(); }}>{t.resend}</button>
      </div>
    </div>
  );
}

function MemberDetails({ t, rtl, member, onContinue }) {
  const verified = rtl ? 'تصدیق شدہ — ووٹ کے اہل' : 'IDENTITY VERIFIED — ELIGIBLE TO VOTE';
  const Row = ({ k, v }) => v ? <div className="flex justify-between gap-3 py-2 border-b border-tnr-line/50 text-sm">
    <span className="text-tnr-cream/50">{k}</span><span className="text-tnr-cream font-semibold text-right">{v}</span></div> : null;
  return (
    <div className="card p-6 sm:p-8 animate-pop text-center">
      <div className="w-16 h-16 rounded-full bg-tnr-green2 grid place-items-center mx-auto mb-3 border-2 border-tnr-gold">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#E4C25B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div className="chip bg-tnr-green2/50 text-tnr-goldLight border border-tnr-line mx-auto mb-4 text-[11px]">{verified}</div>
      <h2 className={`text-2xl font-bold text-tnr-cream ${rtl ? 'urdu' : ''}`}>{member?.full_name || (rtl ? 'رکن' : 'Member')}</h2>
      <p className={`text-sm text-tnr-cream/50 mb-4 ${rtl ? 'urdu' : ''}`}>{rtl ? 'براہ کرم اپنی تفصیلات کی تصدیق کریں' : 'Please confirm your details before voting'}</p>
      <div className="text-left rounded-2xl bg-black/30 border border-tnr-line px-4 py-2 mb-5">
        <Row k={rtl ? 'رکن نمبر' : 'Member ID'} v={member?.member_code} />
        <Row k={rtl ? 'موبائل' : 'Mobile'} v={member?.mobile} />
        <Row k={rtl ? 'گاؤں / علاقہ' : 'Village / Area'} v={member?.village} />
        <Row k={rtl ? 'یونین' : 'Union'} v={member?.union_name} />
      </div>
      <button className="btn-gold w-full text-lg" onClick={onContinue}>
        {rtl ? 'جاری رکھیں اور امیدوار منتخب کریں' : 'Continue to Choose Candidate'} →
      </button>
      <p className="mt-3 text-xs text-tnr-cream/40">{rtl ? 'اگر تفصیلات غلط ہیں تو انتظامیہ سے رابطہ کریں۔' : 'If any detail is wrong, contact the administration.'}</p>
    </div>
  );
}
function Candidates({ t, rtl, data, onPick, onDetail }) {
  const posName = Object.fromEntries(data.positions.map(p => [p.id, p.title]));
  const groups = {};
  for (const c of data.candidates) { const k = c.position_id || 0; (groups[k] = groups[k] || []).push(c); }
  return (
    <div className="animate-fade-up">
      <h1 className={`text-2xl font-bold text-center mb-5 ${rtl ? 'urdu' : ''}`}>{t.selectCandidate}</h1>
      {Object.entries(groups).map(([pid, cands]) => (
        <div key={pid} className="mb-6">
          {posName[pid] && <div className="chip bg-tnr-green2/50 text-tnr-goldLight border border-tnr-line mb-3">{posName[pid]}</div>}
          <div className="grid sm:grid-cols-2 gap-3">
            {cands.map(c => (
              <div key={c.id} className="card p-4 flex gap-3 items-center hover:border-tnr-gold/50 transition">
                <img src={c.photo_url || '/tnr-logo.png'} alt="" className="w-16 h-16 rounded-xl object-cover bg-black/30 border border-tnr-line" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-tnr-cream truncate">{c.name}</div>
                  <div className="text-xs text-tnr-cream/60 truncate">{c.symbol ? `${t.symbol}: ${c.symbol}` : ''}{c.union_name ? ` · ${c.union_name}` : ''}</div>
                  <div className="flex gap-2 mt-2">
                    <button className="btn-gold !py-1.5 !px-3 text-sm" onClick={() => onPick(c)}>{t.voteFor}</button>
                    <button className="btn-ghost !py-1.5 !px-3 text-sm" onClick={() => onDetail(c)}>{t.details}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {!data.candidates.length && <p className="text-center text-tnr-cream/50">No candidates yet.</p>}
    </div>
  );
}

function ConfirmModal({ t, rtl, cand, positions, loading, onConfirm, onCancel }) {
  const pos = positions.find(p => p.id === cand.position_id)?.title;
  return <Modal onClose={onCancel}>
    <div className="text-center">
      <h3 className={`text-xl font-bold mb-1 ${rtl ? 'urdu' : ''}`}>{t.confirmTitle}</h3>
      <img src={cand.photo_url || '/tnr-logo.png'} className="w-20 h-20 rounded-2xl object-cover mx-auto my-4 border border-tnr-line" alt="" />
      <div className="text-lg font-bold text-tnr-goldLight">{cand.name}</div>
      {pos && <div className="text-sm text-tnr-cream/60">{pos}</div>}
      <p className={`text-sm text-tnr-cream/70 my-4 ${rtl ? 'urdu' : ''}`}>{t.confirmBody}</p>
      <div className="flex gap-3">
        <button className="btn-ghost flex-1" onClick={onCancel}>{t.cancel}</button>
        <button className="btn-gold flex-1" disabled={loading} onClick={onConfirm}>{loading ? '…' : t.confirm}</button>
      </div>
    </div>
  </Modal>;
}
function DetailModal({ t, rtl, cand, positions, onClose }) {
  const pos = positions.find(p => p.id === cand.position_id)?.title;
  const Row = ({ k, v }) => v ? <div className="flex gap-2 py-1.5 border-b border-tnr-line/60"><span className="text-tnr-cream/50 text-sm w-28">{k}</span><span className="text-tnr-cream text-sm flex-1">{v}</span></div> : null;
  return <Modal onClose={onClose}>
    <div className="text-center mb-3"><img src={cand.photo_url || '/tnr-logo.png'} className="w-24 h-24 rounded-2xl object-cover mx-auto border border-tnr-line" alt="" />
      <div className="text-xl font-bold text-tnr-goldLight mt-3">{cand.name}</div></div>
    <Row k={t.position} v={pos} /><Row k={t.symbol} v={cand.symbol} /><Row k={t.area} v={cand.union_name} />
    <Row k={t.education} v={cand.education} /><Row k={t.manifesto} v={cand.manifesto} />
    <button className="btn-ghost w-full mt-4" onClick={onClose}>{t.cancel}</button>
  </Modal>;
}
function Success({ t, rtl, receipt }) {
  return <div className="card p-8 text-center animate-pop">
    <div className="w-20 h-20 rounded-full bg-tnr-green2 grid place-items-center mx-auto mb-4 border-2 border-tnr-gold">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#E4C25B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
    <h1 className={`text-2xl font-bold text-tnr-goldLight ${rtl ? 'urdu' : ''}`}>{t.successTitle}</h1>
    <div className="my-5 py-4 rounded-xl bg-black/30 border border-tnr-line">
      <div className="text-xs uppercase tracking-wider text-tnr-cream/50">{t.receipt}</div>
      <div className="text-2xl font-black tracking-widest text-tnr-gold mt-1">{receipt}</div></div>
    <a href="/" className="btn-gold w-full">{t.backHome}</a>
  </div>;
}
function ErrorState({ t, rtl, kind, msg, detail }) {
  const voted = kind === 'ALREADY_VOTED';
  return <div className="card p-8 text-center animate-pop">
    <div className={`w-20 h-20 rounded-full grid place-items-center mx-auto mb-4 border-2 ${voted ? 'bg-tnr-green2 border-tnr-gold' : 'bg-red-900/40 border-red-500/60'}`}>
      <span className="text-4xl">{voted ? '✓' : '!'}</span></div>
    <p className={`text-lg text-tnr-cream ${rtl ? 'urdu' : ''}`}>{msg}</p>
    {detail && <p className="mt-3 text-xs text-red-300/80 break-words font-mono bg-black/30 border border-red-500/20 rounded-lg px-3 py-2">{detail}</p>}
    <a href="/" className="btn-ghost w-full mt-6">{t.backHome}</a>
  </div>;
}
function Modal({ children, onClose }) {
  return <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
    <div className="card p-6 w-full max-w-sm animate-pop" onClick={e => e.stopPropagation()}>{children}</div>
  </div>;
}
