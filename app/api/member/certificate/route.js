import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireMember } from '@/lib/membership/auth';
import { ok, fail } from '@/lib/api';
import { generateCertificateNo } from '@/lib/membership/verify';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Returns the member's membership certificate, issuing one on first request.
export async function GET(req) {
  const { member, res } = await requireMember(req); if (res) return res;
  const sb = supabaseAdmin();
  try {

  let { data: cert, error: readErr } = await sb.from('membership_certificates')
    .select('*').eq('member_id', member.id).eq('type', 'membership')
    .order('issued_at', { ascending: false }).limit(1).maybeSingle();
  if (readErr) return fail('CERT_TABLE', 500, {
    message: 'Certificate storage is not ready.', detail: readErr.message });

  // Issue one on first request.
  // The number is DERIVED from the Membership ID, so it is unique by
  // construction, stable for the member, and safe to retry — no sequence,
  // no randomness, no possibility of collision between members.
  if (!cert) {
    const certificate_no = String(member.membership_id || '')
      .replace(/^TNR-/, 'TNR-CERT-') || `TNR-CERT-${member.id.slice(0, 8).toUpperCase()}`;

    const { data, error } = await sb.from('membership_certificates').insert({
      member_id: member.id, certificate_no, type: 'membership',
      title: 'Certificate of Membership', issued_by: 'TNR Membership Committee',
    }).select('*').single();

    if (!error) cert = data;
    else {
      // Already issued (this member, or a stale row with the same number).
      const { data: existing } = await sb.from('membership_certificates')
        .select('*').eq('certificate_no', certificate_no).limit(1).maybeSingle();
      if (existing && existing.member_id === member.id) cert = existing;
      else return fail('ISSUE_FAILED', 500, {
        message: 'Could not issue your certificate.', detail: error.message });
    }
  }

  // Re-read the member row explicitly so the card always shows current data
  // (photo, village, status) rather than a copy taken during authentication.
  const { data: fresh } = await sb.from('membership_members')
    .select(`membership_id, full_name, first_name, photo_url, village, union_council,
             status, issued_at, approved_at, expires_at, category_id`)
    .eq('id', member.id).maybeSingle();
  const mm = fresh || member;

  let category = null;
  if (mm.category_id) {
    const { data: c } = await sb.from('membership_categories').select('name').eq('id', mm.category_id).maybeSingle();
    category = c?.name || null;
  }

  return ok({
    certificate: cert,
    member: {
      membership_id: mm.membership_id, full_name: mm.full_name, first_name: mm.first_name,
      photo_url: mm.photo_url, village: mm.village, union_council: mm.union_council,
      status: mm.status, issued_at: mm.issued_at || mm.approved_at,
      expires_at: mm.expires_at, category,
    },
  });
  } catch (e) {
    return fail('CERT_FAILED', 500, { message: 'Could not load your certificate.', detail: e.message });
  }
}
