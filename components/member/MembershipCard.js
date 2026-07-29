'use client';
import QrCode from './QrCode';

const G = '#063D2B', GR = '#0B6B4F', GOLD = '#D4A72C', SOFT = '#F3E4B3';
const mont = { fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif' };

const STATE = {
  active: ['ACTIVE MEMBER', GOLD, G], approved: ['ACTIVE MEMBER', GOLD, G],
  suspended: ['SUSPENDED', '#F87171', '#450A0A'], inactive: ['INACTIVE', '#9CA3AF', '#111827'],
  expired: ['EXPIRED', '#9CA3AF', '#111827'],
};

export default function MembershipCard({ m, verifyUrl }) {
  const [label, chipBg, chipFg] = STATE[m?.status] || STATE.inactive;
  const valid = ['active', 'approved'].includes(m?.status);
  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '—';

  return (
    <div id="card-sheet" className="space-y-5">
      {/* FRONT */}
      <div className="relative rounded-2xl p-5 text-white shadow-2xl overflow-hidden"
        style={{ width: 340, minHeight: 214, background: `linear-gradient(150deg,${GR},${G} 60%,#04241A)`, border: `1px solid ${GOLD}55`, ...mont }}>
        {!valid && (
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <span className="text-[38px] font-black opacity-15 -rotate-12 tracking-widest">{label}</span>
          </div>
        )}
        <div className="flex items-center gap-2 relative">
          <img src="/tnr-logo.png" alt="TNR" className="w-9 h-9 rounded-full bg-white p-0.5 object-contain" />
          <div className="leading-tight">
            <div className="text-[10px] font-black tracking-widest" style={{ color: SOFT }}>TEHREEK-E-NOJAWANAN ROUNDU</div>
            <div className="text-[8px] text-white/50 tracking-wider">MEMBERSHIP CARD</div>
          </div>
          <span className="ml-auto px-2 py-0.5 rounded-full text-[8px] font-black"
            style={{ background: chipBg, color: chipFg }}>{label}</span>
        </div>

        <div className="flex gap-3 mt-4 relative">
          <img src={m?.photo_url || '/tnr-logo.png'} alt=""
            className="w-[62px] h-[72px] rounded-lg object-cover bg-white/10 shrink-0"
            style={{ border: `1px solid ${GOLD}66` }} />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-black leading-tight truncate">{m?.full_name}</div>
            <div className="text-[10px] font-mono mt-0.5" style={{ color: SOFT }}>{m?.membership_id}</div>
            <div className="text-[9px] text-white/60 mt-1.5">{m?.category || 'General Member'}</div>
            <div className="text-[9px] text-white/60">
              {[m?.village, m?.union_council].filter(Boolean).join(' · ') || '—'}
            </div>
          </div>
        </div>

        <div className="flex justify-between text-[8px] text-white/50 mt-3 relative">
          <span>ISSUED {fmt(m?.issued_at)}</span>
          {m?.expires_at && <span>EXPIRES {fmt(m.expires_at)}</span>}
        </div>
      </div>

      {/* BACK */}
      <div className="rounded-2xl p-5 shadow-2xl bg-white"
        style={{ width: 340, minHeight: 214, border: `1px solid ${GOLD}55`, ...mont, color: '#111' }}>
        <div className="flex gap-4">
          <div className="shrink-0 text-center">
            <QrCode value={verifyUrl} size={96} />
            <div className="text-[7px] text-gray-400 mt-1">SCAN TO VERIFY</div>
          </div>
          <div className="text-[8.5px] text-gray-600 leading-relaxed">
            <div className="font-black text-[9px]" style={{ color: G }}>VERIFICATION</div>
            <p className="mt-1">Scan the QR code or visit the TNR website and enter the Membership ID to confirm this member&rsquo;s status.</p>
            <p className="mt-2">This card remains the property of Tehreek-e-Nojawanan Roundu and must be returned on request.</p>
            <p className="mt-2 text-gray-400">Valid only while the membership is active.</p>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-200 flex items-end justify-between">
          <div className="text-[8px] text-gray-500">
            <div className="font-semibold" style={{ color: G }}>Tehreek-e-Nojawanan Roundu</div>
            <div>Roundu, Gilgit-Baltistan</div>
          </div>
          <div className="text-center">
            <div className="w-24 border-b border-gray-400" />
            <div className="text-[7px] text-gray-500 mt-0.5">AUTHORIZED SIGNATURE</div>
          </div>
        </div>
      </div>
    </div>
  );
}
