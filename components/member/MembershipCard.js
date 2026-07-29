'use client';
import QrCode from './QrCode';
import Avatar from './Avatar';

const G='#0B5836', DEEP='#063D2B', GOLD='#C9A227', GOLD_LT='#E8C766', INK='#1F2937', MUTED='#6B7280';
const mont = { fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif' };

const STATE = {
  active:    ['ACTIVE MEMBER', GOLD, '#fff'],
  approved:  ['ACTIVE MEMBER', GOLD, '#fff'],
  suspended: ['SUSPENDED', '#DC2626', '#fff'],
  inactive:  ['INACTIVE',  '#6B7280', '#fff'],
  expired:   ['EXPIRED',   '#6B7280', '#fff'],
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB',
  { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : '—';

// Premium vertical neck card — 54 × 86 mm proportions, print-ready.
export default function MembershipCard({ m, verifyUrl }) {
  const [label, chip, chipFg] = STATE[m?.status] || STATE.inactive;
  const valid = ['active', 'approved'].includes(m?.status);

  return (
    <div id="card-sheet" className="flex flex-wrap gap-6" style={{ ...mont, color: INK }}>

      {/* ══════════ FRONT ══════════ */}
      <div className="card-face" style={face}>
        <Pattern />
        <img src="/tnr-logo.png" alt="" style={watermark} />
        <div style={badge}>TNR</div>

        <div style={safe}>
          <img src="/tnr-logo.png" alt="TNR" style={{ width: 15, height: 15, objectFit: 'contain', margin: '0 auto', display: 'block' }} />

          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <div style={org}>TEHREEK-E-NOJAWANAN</div>
            <div style={bigName}>ROUNDU</div>
            <Values />
          </div>

          <div style={rule} />
          <div style={{ fontSize: 4.8, letterSpacing: '.16em', color: GOLD, fontWeight: 900, textAlign: 'center', marginBottom: 5 }}>
            DIGITAL MEMBERSHIP CARD
          </div>

          <Avatar src={m?.photo_url} name={m?.full_name} fontSize={22}
            style={{ width: 62, height: 74, objectFit: 'cover', borderRadius: 5, border: `1px solid ${GOLD}`,
              background: '#F3F4F6', display: 'block', margin: '0 auto' }} />

          <div style={{ fontSize: 11.5, fontWeight: 900, color: DEEP, textAlign: 'center', marginTop: 6, lineHeight: 1.05 }}>
            {m?.full_name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 2 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: chip, color: chipFg,
              fontSize: 5, display: 'grid', placeItems: 'center', fontWeight: 900 }}>✓</span>
            <span style={{ fontSize: 6.4, fontWeight: 800, color: chip, letterSpacing: '.08em' }}>{label}</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6 }}>
            <tbody>
              {[['MEMBERSHIP ID', m?.membership_id],
                ['CATEGORY', m?.category || 'General Member'],
                ['VILLAGE / AREA', m?.village || '—'],
                ['UNION COUNCIL', m?.union_council || '—'],
                ['DATE OF ISSUE', fmt(m?.issued_at)],
                ['VALID UNTIL', m?.expires_at ? fmt(m.expires_at) : '—']].map(([k, v], i) => (
                <tr key={k} style={i ? { borderTop: '.4px solid #E5E7EB' } : {}}>
                  <td style={{ fontSize: 5.6, color: MUTED, fontWeight: 700, padding: '2px 0', whiteSpace: 'nowrap' }}>{k}</td>
                  <td style={{ fontSize: 5.6, color: INK, fontWeight: 800, textAlign: 'right', padding: '2px 0' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: 5 }}>
            <div style={{ width: 68, height: 1, background: '#9CA3AF', margin: '0 auto 3px' }} />
            <div style={{ fontSize: 4.6, color: MUTED, fontWeight: 700, letterSpacing: '.06em', lineHeight: 1.5 }}>
              AUTHORIZED SIGNATURE<br />
              <b style={{ color: DEEP }}>Central President</b><br />
              Tehreek-e-Nojawanan Roundu
            </div>
          </div>
        </div>

        <svg viewBox="0 0 60 14" preserveAspectRatio="none"
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 38 }}>
          <path d="M0 6 Q 15 0 30 4 T 60 2 L60 14 L0 14 Z" fill={DEEP} />
          <path d="M0 8.4 Q 15 2.6 30 6.4 T 60 4.4" fill="none" stroke={GOLD} strokeWidth=".45" />
        </svg>
        <div style={{ position: 'absolute', right: 10, bottom: 7, textAlign: 'right', color: '#fff', zIndex: 2 }}>
          <div style={{ fontSize: 4.2, letterSpacing: '.1em', opacity: .85, fontWeight: 700 }}>PROUD TO SERVE</div>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '.04em' }}>ROUNDU</div>
          <div style={{ fontSize: 4.5, color: GOLD_LT, letterSpacing: '.2em' }}>★ ★ ★</div>
        </div>
        {!valid && <Stamp text={label} />}
      </div>

      {/* ══════════ BACK ══════════ */}
      <div className="card-face" style={face}>
        <Pattern />
        <img src="/tnr-logo.png" alt="" style={watermark} />

        <div style={safe}>
          <div style={{ textAlign: 'center' }}>
            <div style={org}>TEHREEK-E-NOJAWANAN</div>
            <div style={{ ...bigName, fontSize: 13 }}>ROUNDU (TNR)</div>
            <Values />
          </div>
          <div style={rule} />

          <div style={{ width: 88, height: 88, margin: '0 auto', padding: 4, background: '#fff',
            border: `1.4px solid ${G}`, borderRadius: 5 }}>
            <QrCode value={verifyUrl} size={80} />
          </div>
          <div style={{ margin: '5px auto 0', width: 96, textAlign: 'center', color: '#fff',
            background: `linear-gradient(135deg,${G},${DEEP})`, fontSize: 5.6, fontWeight: 800,
            letterSpacing: '.08em', padding: '4px 0', borderRadius: 20 }}>SCAN TO VERIFY</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
            marginTop: 4, fontSize: 5.6, fontWeight: 900, color: G, letterSpacing: '.06em' }}>
            🛡 VERIFIED TNR MEMBER
          </div>

          <H>ABOUT TNR</H>
          <p style={p}>Tehreek-e-Nojawanan Roundu is a youth-led organization committed to education,
            unity, responsible leadership, community development, and a better future for Roundu.</p>

          <H>MEMBER BENEFITS</H>
          <ul style={{ listStyle: 'none', margin: '1px 0 0', padding: 0 }}>
            {['Participation in TNR programs and events', 'Volunteer opportunities',
              'Leadership development', 'Community welfare initiatives',
              'Access to jobs and scholarships', 'Voting rights where eligible'].map(t => (
              <li key={t} style={{ fontSize: 4.9, color: INK, padding: '1px 0 1px 9px',
                position: 'relative', lineHeight: 1.35 }}>
                <span style={{ position: 'absolute', left: 0, color: G, fontWeight: 900, fontSize: 4.6 }}>✓</span>{t}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 'auto', borderTop: `1px solid ${GOLD}`, paddingTop: 4,
            display: 'flex', justifyContent: 'space-between', gap: 3 }}>
            {[['WEBSITE', 'www.tnroundu.org'], ['EMAIL', 'info@tnroundu.org'], ['PHONE', '+92 300 1234567']].map(([k, v]) => (
              <div key={k} style={{ fontSize: 4.3, color: MUTED, textAlign: 'center', lineHeight: 1.4, flex: 1 }}>
                <b style={{ display: 'block', color: G, fontSize: 4.6, fontWeight: 900 }}>{k}</b>{v}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── shared styles ── */
const face = {
  position: 'relative', width: 227, height: 348,   // 54 × 86 mm at ~4.2 px/mm
  background: '#FFFFFF', borderRadius: 14, overflow: 'hidden',
  boxShadow: '0 10px 28px rgba(0,0,0,.14)', border: '1px solid #EEF0EF',
};
const safe = { position: 'absolute', inset: 11, display: 'flex', flexDirection: 'column', zIndex: 2 };
const org = { fontSize: 6, letterSpacing: '.14em', fontWeight: 800, color: MUTED };
const bigName = { fontSize: 15, fontWeight: 900, color: DEEP, lineHeight: 1, letterSpacing: '.02em' };
const rule = { height: 1, background: `linear-gradient(90deg,transparent,${GOLD},transparent)`, margin: '6px 0' };
const p = { fontSize: 5, lineHeight: 1.5, color: MUTED, margin: 0 };
const watermark = {
  position: 'absolute', left: '50%', top: '52%', transform: 'translate(-50%,-50%)',
  width: 165, opacity: .045, pointerEvents: 'none',
};
const badge = {
  position: 'absolute', top: 0, right: 0, width: 76, height: 42,
  background: `linear-gradient(135deg,${G},${DEEP})`, borderBottomLeftRadius: 34,
  display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 900, fontSize: 11,
  letterSpacing: '.06em', borderLeft: `1.5px solid ${GOLD}`, borderBottom: `1.5px solid ${GOLD}`, zIndex: 3,
};
const Pattern = () => (
  <div style={{
    position: 'absolute', inset: 0, opacity: .5, pointerEvents: 'none',
    backgroundImage: 'repeating-linear-gradient(45deg,#F3F5F4 0 1px,transparent 1px 5px),repeating-linear-gradient(-45deg,#F6F8F7 0 1px,transparent 1px 9px)',
  }} />
);
const Values = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
    fontSize: 4.6, letterSpacing: '.12em', color: MUTED, fontWeight: 700, marginTop: 3 }}>
    <span>UNITY</span><span>|</span><span>EDUCATION</span>
    <span style={{ color: GOLD }}>★</span><span>DEVELOPMENT</span><span>|</span><span>VISION</span>
  </div>
);
const H = ({ children }) => (
  <div style={{ fontSize: 5.6, fontWeight: 900, color: DEEP, letterSpacing: '.1em',
    margin: '7px 0 3px', display: 'flex', alignItems: 'center', gap: 4 }}>
    <span style={{ width: 9, height: 9, borderRadius: '50%', background: G }} />{children}
  </div>
);
const Stamp = ({ text }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
    pointerEvents: 'none', zIndex: 4 }}>
    <span style={{ fontSize: 34, fontWeight: 900, color: '#DC2626', opacity: .16,
      transform: 'rotate(-14deg)', letterSpacing: '.1em' }}>{text}</span>
  </div>
);
