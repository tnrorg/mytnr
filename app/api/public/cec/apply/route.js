import { supabaseAdmin } from '@/lib/supabaseServer';
import { uploadDataUrl } from '@/lib/storage';
import { ok, fail, readJson } from '@/lib/api';
import { validateApplication } from '@/lib/cec';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const HINT = 'Run supabase/migration_cec_recruitment.sql in the Supabase SQL Editor.';

const TEXT = [
  'full_name', 'email', 'mobile', 'education_level', 'current_position',
  'organisation', 'union_council', 'village', 'membership_id',
  'relevant_experience', 'scenario_answer', 'challenge_answer',
  'leadership_answer', 'vision_answer',
];

export async function POST(req) {
  const b = await readJson(req);
  const sb = supabaseAdmin();

  // Validated with the same function the form uses, so a submission that the
  // browser let through cannot be rejected here for a different reason — and a
  // request that bypasses the form entirely is still checked.
  const errors = validateApplication(b);
  if (Object.keys(errors).length) {
    return fail('INVALID', 400, { message: 'Some answers are missing or too short.', errors });
  }

  // The advert must still be accepting. Checked server-side: a form left open
  // in a tab past the deadline would otherwise still submit.
  const { data: vacancy } = await sb.from('cec_vacancies')
    .select('id, title, status, closes_on').eq('id', b.vacancy_id).maybeSingle();
  if (!vacancy) return fail('NO_VACANCY', 404, { message: 'That position is no longer listed.' });

  const today = new Date().toISOString().slice(0, 10);
  if (vacancy.status !== 'open' || (vacancy.closes_on && vacancy.closes_on < today)) {
    return fail('CLOSED', 409, {
      message: `Applications for ${vacancy.title} are closed.`,
    });
  }

  const row = { vacancy_id: vacancy.id, declaration_accepted: true };
  for (const f of TEXT) row[f] = String(b[f] ?? '').trim();
  row.email = row.email.toLowerCase();

  if (b.cv_data) {
    try { row.cv_url = await uploadDataUrl(b.cv_data, 'cec'); }
    catch (e) { return fail('UPLOAD_FAILED', 500, { message: 'CV upload failed: ' + e.message }); }
  }

  const { data, error } = await sb.from('cec_applications').insert(row).select('id').maybeSingle();
  if (error) {
    // 23505 is the one-per-email-per-position index. Saying so plainly beats
    // "save failed", which sends people round the form again.
    if (error.code === '23505') {
      return fail('DUPLICATE', 409, {
        message: `You have already applied for ${vacancy.title} with this email address.`,
      });
    }
    return fail('SAVE_FAILED', 500, { message: error.message, hint: HINT });
  }

  // Reference assigned AFTER a successful insert: a sequence does not roll
  // back, so drawing it first would burn a number on every failed attempt.
  let reference_no = null;
  try {
    // `nextval_text` is the project's existing sequence helper — added with
    // migration_membership_phase1.sql and locked down from public roles.
    const { data: seq } = await sb.rpc('nextval_text', { seq_name: 'cec_application_seq' });
    if (seq) {
      reference_no = `TNR-CEC-${String(seq).padStart(4, '0')}`;
      await sb.from('cec_applications').update({ reference_no }).eq('id', data.id);
    }
  } catch { /* the application is saved either way; the reference is a nicety */ }

  return ok({
    reference_no,
    position: vacancy.title,
    message: 'Your application has been submitted.',
  });
}
