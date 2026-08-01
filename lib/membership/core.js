// Membership core helpers — server only.
// SINGLE SOURCE OF TRUTH for the member count used everywhere on the site.
import { supabaseAdmin } from '@/lib/supabaseServer';

export const normalizeEmail = (v) => String(v || '').trim().toLowerCase();
export const normalizeMobile = (v) => {
  const s = String(v || '').replace(/[^\d+]/g, '');
  if (s.startsWith('+')) return s;
  if (s.startsWith('00')) return '+' + s.slice(2);
  if (s.startsWith('0')) return '+92' + s.slice(1);      // default country code
  if (s.startsWith('92')) return '+' + s;
  return s ? '+' + s : '';
};
export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());

// ── THE centralized active-member count. Never hardcode a total anywhere. ──
export async function getActiveMemberCount() {
  const { count } = await supabaseAdmin()
    .from('membership_members')
    .select('*', { count: 'exact', head: true })
    .in('status', ['approved', 'active'])
    .is('deleted_at', null);
  return count || 0;
}

export async function getMembershipStats() {
  const sb = supabaseAdmin();
  const [members, apps] = await Promise.all([
    sb.from('membership_members').select('status, union_council, public_visible, deleted_at'),
    sb.from('membership_applications').select('status'),
  ]);
  const m = (members.data || []).filter(x => !x.deleted_at);
  const a = apps.data || [];
  const by = (rows, key) => rows.reduce((o, r) => { const k = r[key] || 'Unspecified'; o[k] = (o[k] || 0) + 1; return o; }, {});
  return {
    active_members:    m.filter(x => ['approved', 'active'].includes(x.status)).length,
    suspended:         m.filter(x => x.status === 'suspended').length,
    inactive:          m.filter(x => x.status === 'inactive').length,
    expired:           m.filter(x => x.status === 'expired').length,
    public_profiles:   m.filter(x => x.public_visible && ['approved', 'active'].includes(x.status)).length,
    total_applications: a.length,
    pending_review:    a.filter(x => x.status === 'pending_review').length,
    under_review:      a.filter(x => x.status === 'under_review').length,
    approved_apps:     a.filter(x => x.status === 'approved').length,
    rejected:          a.filter(x => x.status === 'rejected').length,
    by_union_council:  by(m.filter(x => ['approved', 'active'].includes(x.status)), 'union_council'),
  };
}

// ── Server-side reference generation (never on the client) ──
async function nextSeq(seqName) {
  const { data, error } = await supabaseAdmin().rpc('nextval_text', { seq_name: seqName });
  if (error || data == null) return null;
  return Number(data);
}

// Application reference — TNR-APP-0001.
//
// This tracks the APPLICATION only: it is shown on the confirmation screen and
// used to check status. Gaps here are harmless and expected, because a
// reference is only ever needed to look one application up.
//
// It is deliberately NOT the membership number. Membership numbers are issued
// at approval instead, so that a rejected or abandoned application never
// consumes one and the membership sequence stays gapless.
export async function generateApplicationRef() {
  const n = await nextSeq('membership_app_ref_seq');
  const seq = n != null ? n : Date.now() % 1000000;   // fallback, still unique-checked by DB
  return `TNR-APP-${String(seq).padStart(4, '0')}`;
}

// Membership number — TNR-MN-0001.
//
// Claimed at APPROVAL and nowhere else, so the sequence advances once per
// actual member and the numbers run consecutively: 0001, 0002, 0003 …
// Rejected applications and failed submissions never touch it.
//
// To restart either sequence after clearing test data — note MINVALUE is 1, so
// 0 is rejected:
//   select setval('membership_app_ref_seq', 1, false);
//   select setval('membership_id_seq', 1, false);
export async function generateMembershipId() {
  const n = await nextSeq('membership_id_seq');
  const seq = n != null ? n : Date.now() % 1000000;
  return `TNR-MN-${String(seq).padStart(4, '0')}`;
}

export async function logMembershipAudit(entry) {
  try { await supabaseAdmin().from('membership_audit_logs').insert(entry); } catch {}
}
