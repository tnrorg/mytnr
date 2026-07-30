import { supabaseAdmin } from '@/lib/supabaseServer';
import { ok, fail, readJson } from '@/lib/api';
import { clientIp } from '@/lib/audit';
import {
  normalizeEmail, normalizeMobile, isValidEmail, generateApplicationRef,
} from '@/lib/membership/core';
import { sendApplicationReceived } from '@/lib/membership/emails';
import { uploadDataUrl } from '@/lib/storage';
import { validateApplication, REQUIRED_LABELS } from '@/lib/membership/validateApplication';

export const dynamic = 'force-dynamic';

const ACTIVE = ['pending_review', 'under_review', 'correction_requested', 'approved'];

export async function POST(req) {
  const sb = supabaseAdmin();
  const b = await readJson(req);
  const ip = clientIp(req);

  // ── Required fields ──
  const first_name = String(b.first_name || '').trim();
  const last_name  = String(b.last_name || '').trim();
  const email      = normalizeEmail(b.email);
  const mobile     = normalizeMobile(b.mobile);

  // Same rule set the form uses, re-checked here so a direct POST cannot
  // create a half-empty application.
  const errors = validateApplication(b);
  if (Object.keys(errors).length) {
    const names = Object.keys(errors).map(k => REQUIRED_LABELS[k] || k);
    return fail('INCOMPLETE', 400, {
      message: `Please complete every required field: ${names.join(', ')}.`,
      fields: errors,
    });
  }
  if (!isValidEmail(email)) return fail('INVALID', 400, { message: 'Please enter a valid email address.' });

  // ── Duplicate prevention (privacy-safe: never reveal whose record it is) ──
  const { data: dupes } = await sb.from('membership_applications')
    .select('status, email_normalized, mobile_normalized')
    .or(`email_normalized.eq.${email},mobile_normalized.eq.${mobile}`);
  const blocking = (dupes || []).find(d => ACTIVE.includes(d.status));
  if (blocking) {
    const msg = blocking.status === 'approved'
      ? 'A membership already exists for these details. Please use Member Login, or contact support if you need help.'
      : 'An application with these details is already under review. Please use "Check Application Status".';
    return fail('DUPLICATE', 409, { message: msg });
  }
  const { data: existingMember } = await sb.from('membership_members')
    .select('id').eq('email_normalized', email).is('deleted_at', null).limit(1);
  if (existingMember && existingMember.length)
    return fail('DUPLICATE', 409, { message: 'A membership already exists for these details. Please use Member Login.' });

  // ── Profile photo (optional) ──
  // Validated server-side: images only, max ~4 MB decoded.
  let photo_url = null;
  if (b.photo_data) {
    const head = String(b.photo_data).slice(0, 40);
    if (!/^data:image\/(png|jpe?g|webp);base64,/i.test(head))
      return fail('BAD_PHOTO', 400, { message: 'Profile photo must be a JPG, PNG or WEBP image.' });
    const approxBytes = (String(b.photo_data).length - head.indexOf(',')) * 0.75;
    if (approxBytes > 4 * 1024 * 1024)
      return fail('PHOTO_TOO_BIG', 400, { message: 'Profile photo must be smaller than 4 MB.' });
    try { photo_url = await uploadDataUrl(b.photo_data, 'members'); }
    catch (e) { photo_url = null; }   // never block an application over a photo
  }

  // ── Insert (status ALWAYS pending_review — never auto-active) ──
  const reference_no = await generateApplicationRef();
  const row = {
    reference_no,
    first_name, last_name,
    gender: b.gender || null,
    age: b.age ? Number(b.age) : null,
    village: b.village || null,
    union_council: b.union_council || null,
    mobile, mobile_normalized: mobile,
    email, email_normalized: email,
    photo_url,
    education_level: b.education_level || null,
    field_of_study: b.field_of_study || null,
    // "Other" is stored as the text the applicant typed, so reports and the
    // directory filter show a real position rather than a bucket label.
    current_position: b.current_position === 'Other'
      ? String(b.position_other || '').trim() || 'Other'
      : (b.current_position || null),
    why_join: String(b.why_join).trim(),
    contribution_areas: b.contribution_areas,
    leadership_view: b.leadership_view,
    leadership_note: b.leadership_note || null,
    youth_issues: String(b.youth_issues).trim(),
    declaration_accepted: true,
    declaration_version: b.declaration_version || 'v1.0',
    declaration_at: new Date().toISOString(),
    submitted_ip: ip,
    submitted_user_agent: (req.headers.get('user-agent') || '').slice(0, 300),
    whatsapp_opt_in: !!b.whatsapp_opt_in,
    status: 'pending_review',
  };

  const { data, error } = await sb.from('membership_applications').insert(row)
    .select('reference_no, created_at').single();
  if (error) {
    // Unique index race → treat as duplicate, not a server error
    if (error.code === '23505')
      return fail('DUPLICATE', 409, { message: 'An application with these details already exists.' });
    return fail('SUBMIT_FAILED', 500, { message: 'Could not submit your application. Please try again.' });
  }

  await sb.from('membership_status_history').insert({
    to_status: 'pending_review', reason: 'Application submitted', changed_by: 'applicant',
  }).then(() => {}, () => {});

  // Confirmation email — never block submission if the mail server hiccups.
  try { await sendApplicationReceived({ ...row, reference_no: data.reference_no }); } catch {}

  return ok({
    reference_no: data.reference_no,
    submitted_at: data.created_at,
    message: 'Application submitted successfully.',
  });
}
