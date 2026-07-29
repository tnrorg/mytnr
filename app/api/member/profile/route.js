import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireMember } from '@/lib/membership/auth';
import { ok, fail, readJson } from '@/lib/api';
import { SECTIONS, PROFILE_FIELDS, SENSITIVE_FIELDS, FORBIDDEN_FIELDS, pick } from '@/lib/membership/profile';

export const dynamic = 'force-dynamic';

// GET — the member's complete profile (own data only).
export async function GET(req) {
  const { member, res } = await requireMember(req); if (res) return res;
  const sb = supabaseAdmin();

  const [{ data: profile }, ...sections] = await Promise.all([
    sb.from('member_profiles').select('*').eq('member_id', member.id).maybeSingle(),
    ...Object.values(SECTIONS).map(s =>
      sb.from(s.table).select('*').eq('member_id', member.id).order('sort_order').order('created_at')),
  ]);

  const out = {};
  Object.keys(SECTIONS).forEach((k, i) => { out[k] = sections[i].data || []; });

  const { data: pending } = await sb.from('profile_update_requests')
    .select('field, requested_value, status, created_at')
    .eq('member_id', member.id).eq('status', 'pending');

  const { password_hash, invite_token, invite_expires_at, session_epoch, ...core } = member;
  return ok({ core, profile: profile || {}, ...out, pending_requests: pending || [] });
}

// PATCH — update free-to-edit fields; sensitive fields become approval requests.
export async function PATCH(req) {
  const { member, res } = await requireMember(req); if (res) return res;
  const sb = supabaseAdmin();
  const b = await readJson(req);

  // 1. Reject any attempt at forbidden fields outright.
  for (const f of FORBIDDEN_FIELDS) {
    if (b[f] !== undefined)
      return fail('FORBIDDEN_FIELD', 403, { message: 'You cannot change your membership status or ID.' });
  }

  // 2. Free profile fields — written immediately.
  const patch = pick(b, PROFILE_FIELDS);
  if (Object.keys(patch).length) {
    patch.member_id = member.id;
    patch.updated_at = new Date().toISOString();
    const { error } = await sb.from('member_profiles').upsert(patch, { onConflict: 'member_id' });
    if (error) return fail('SAVE_FAILED', 500, { message: 'Could not save your profile.', detail: error.message });
  }

  // 3. Sensitive fields — queued for admin approval, never written now.
  const requests = [];
  for (const f of SENSITIVE_FIELDS) {
    if (b[f] === undefined) continue;
    const requested = String(b[f] ?? '').trim();
    const current = String(member[f] ?? '');
    if (!requested || requested === current) continue;

    const { data: dupe } = await sb.from('profile_update_requests')
      .select('id').eq('member_id', member.id).eq('field', f).eq('status', 'pending').limit(1);
    if (dupe && dupe.length) continue;      // already awaiting review

    requests.push({ member_id: member.id, field: f, current_value: current,
      requested_value: requested, reason: b.change_reason || null });
  }
  if (requests.length) await sb.from('profile_update_requests').insert(requests);

  return ok({
    saved: true,
    pending_approval: requests.map(r => r.field),
    message: requests.length
      ? 'Saved. Changes to your name, contact or location need committee approval.'
      : 'Profile updated.',
  });
}
