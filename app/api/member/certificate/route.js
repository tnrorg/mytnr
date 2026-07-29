import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireMember } from '@/lib/membership/auth';
import { ok, fail } from '@/lib/api';
import { generateCertificateNo } from '@/lib/membership/verify';

export const dynamic = 'force-dynamic';

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

  if (!cert) {
    const certificate_no = await generateCertificateNo();
    const { data, error } = await sb.from('membership_certificates').insert({
      member_id: member.id, certificate_no, type: 'membership',
      title: 'Certificate of Membership', issued_by: 'TNR Membership Committee',
    }).select('*').single();
    if (error) return fail('ISSUE_FAILED', 500, {
      message: 'Could not issue the certificate.', detail: error.message });
    cert = data;
  }

  let category = null;
  if (member.category_id) {
    const { data: c } = await sb.from('membership_categories').select('name').eq('id', member.category_id).maybeSingle();
    category = c?.name || null;
  }

  return ok({
    certificate: cert,
    member: {
      membership_id: member.membership_id, full_name: member.full_name,
      photo_url: member.photo_url, village: member.village, union_council: member.union_council,
      status: member.status, issued_at: member.issued_at || member.approved_at,
      expires_at: member.expires_at, category,
    },
  });
  } catch (e) {
    return fail('CERT_FAILED', 500, { message: 'Could not load your certificate.', detail: e.message });
  }
}
