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

  // Issue one on first request. Safe against concurrent loads: on a unique-key
  // clash we re-read (another request won) or retry with a fresh number.
  for (let attempt = 0; !cert && attempt < 4; attempt++) {
    const certificate_no = await generateCertificateNo();
    const { data, error } = await sb.from('membership_certificates').insert({
      member_id: member.id, certificate_no, type: 'membership',
      title: 'Certificate of Membership', issued_by: 'TNR Membership Committee',
    }).select('*').single();

    if (!error) { cert = data; break; }

    if (error.code === '23505') {
      // Did a parallel request already create this member's certificate?
      const { data: existing } = await sb.from('membership_certificates')
        .select('*').eq('member_id', member.id).eq('type', 'membership')
        .order('issued_at', { ascending: false }).limit(1).maybeSingle();
      if (existing) { cert = existing; break; }
      continue;                     // number clash only — try another number
    }
    return fail('ISSUE_FAILED', 500, {
      message: 'Could not issue the certificate.', detail: error.message });
  }
  if (!cert) return fail('ISSUE_FAILED', 500, {
    message: 'Could not issue a certificate number. Please try again.' });

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
