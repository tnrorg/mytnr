import { supabaseAdmin } from '@/lib/supabaseServer';
import { ok, readJson } from '@/lib/api';
import { normalizeEmail } from '@/lib/membership/core';
import { makeInviteToken, inviteExpiry, canLogin } from '@/lib/membership/auth';
import { sendPasswordReset } from '@/lib/membership/emails';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const b = await readJson(req);
  const email = normalizeEmail(b.email);
  const sb = supabaseAdmin();
  const { data: rows } = await sb.from('membership_members')
    .select('*').eq('email_normalized', email).is('deleted_at', null).limit(1);
  const m = rows && rows[0];

  // Always answer the same way — never reveal whether an account exists.
  const GENERIC = ok({ sent: true,
    message: 'If an account exists for that email, a password reset link has been sent.' });

  if (!m || !canLogin(m.status)) return GENERIC;

  const token = makeInviteToken();
  await sb.from('membership_members').update({
    invite_token: token, invite_expires_at: inviteExpiry(), invite_sent_at: new Date().toISOString(),
  }).eq('id', m.id);
  try { await sendPasswordReset(m, token); } catch {}
  return GENERIC;
}
