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

// TNR-MN-0001. This single number follows a person all the way through: it is
// issued when they submit, shown on the confirmation screen, used to check
// application status, and becomes their permanent membership ID on approval.
// Nobody has to learn a second number.
export async function generateApplicationRef() {
  const n = await nextSeq('membership_app_ref_seq');
  const seq = n != null ? n : Date.now() % 1000000;   // fallback, still unique-checked by DB
  return `TNR-MN-${String(seq).padStart(4, '0')}`;
}

// FALLBACK ONLY. Approval normally carries the application reference through
// as the membership ID (see the applications route), so this runs solely for
// older applications that predate that change, or a member created without an
// application. Uses its own sequence, hence the different TNR-0001 shape.
//
// To restart either sequence after clearing test data — note MINVALUE is 1, so
// 0 is rejected:
//   select setval('membership_app_ref_seq', 1, false);
//   select setval('membership_id_seq', 1, false);
export async function generateMembershipId() {
  const n = await nextSeq('membership_id_seq');
  const seq = n != null ? n : Date.now() % 1000000;
  return `TNR-${String(seq).padStart(4, '0')}`;
}

export async function logMembershipAudit(entry) {
  try { await supabaseAdmin().from('membership_audit_logs').insert(entry); } catch {}
}
