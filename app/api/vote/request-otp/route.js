import { supabaseAdmin } from '@/lib/supabaseServer';
import { normalizePhone } from '@/lib/phone';
import { generateOtp, hashOtp, OTP_TTL_MS } from '@/lib/otp';
import { deliverOtp } from '@/lib/otpSender';
import { getActiveElection, isVotingOpen } from '@/lib/election';
import { logAudit, clientIp } from '@/lib/audit';
import { ok, fail, readJson } from '@/lib/api';

export const dynamic = 'force-dynamic';
const RESEND_COOLDOWN_MS = 45 * 1000; // server-side anti-spam between OTP requests

export async function POST(req) {
  const sb = supabaseAdmin();
  const body = await readJson(req);
  const raw = String(body.email ?? body.mobile ?? body.identifier ?? '').trim();
  const ip = clientIp(req);
  const isEmail = raw.includes('@');
  const contact = isEmail ? raw.toLowerCase() : normalizePhone(raw);
  if (!contact || contact.length < 5)
    return fail('INVALID', 400, { message: isEmail ? 'Please enter a valid email address.' : 'This mobile number is not registered for voting.' });

  const election = await getActiveElection();
  if (!election) return fail('NO_ELECTION', 400, { message: 'No election is currently available.' });

  // Member lookup by email (case-insensitive) or mobile.
  // Use limit(1) (not maybeSingle) so a duplicate email/mobile can't blank the result.
  const q = isEmail
    ? sb.from('members').select('*').ilike('email', contact)
    : sb.from('members').select('*').eq('mobile', contact);
  const { data: rows } = await q.limit(1);
  const member = rows && rows[0];
  if (!member) {
    await logAudit({ action: 'OTP_REJECTED_UNREGISTERED', actor: 'member', details: contact, election_id: election.id, ip });
    return fail('NOT_REGISTERED', 404, { message: isEmail ? 'This email is not registered for voting.' : 'This mobile number is not registered for voting.' });
  }
  if (member.status === 'Blocked')  return fail('BLOCKED', 403, { message: 'Your membership has been blocked. Please contact the administration.' });
  if (member.status !== 'Approved') return fail('NOT_APPROVED', 403, { message: 'Your membership is not approved yet.' });

  // Any registered + approved member may vote. If a voter list HAS been locked,
  // it is still honoured; otherwise approval alone is enough.
  if (election.voter_list_locked) {
    const { data: locked } = await sb.from('locked_voter_list').select('id')
      .eq('election_id', election.id).eq('member_id', member.id).limit(1);
    if (!(locked && locked.length))
      return fail('NOT_ON_LIST', 403, { message: 'You are not on the voter list for this election.' });
  }

  // Voting window
  if (!isVotingOpen(election)) return fail('NOT_ACTIVE', 403, { message: 'Voting is not currently open for this election.' });

  // Already voted? Checked BEFORE any email is sent, so a completed voter never
  // consumes an OTP message. count works regardless of how many position rows exist.
  const { count: existing } = await sb.from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('election_id', election.id).eq('member_id', member.id);
  if (existing) {
    await logAudit({ action: 'DUPLICATE_VOTE_ATTEMPT', actor: 'member', details: contact, election_id: election.id, ip });
    return fail('ALREADY_VOTED', 409, { message: 'Your vote has already been successfully submitted. Duplicate voting is not allowed.' });
  }

  // Server-side resend cooldown
  const { data: recent } = await sb.from('otp_verifications').select('created_at')
    .eq('election_id', election.id).eq('member_id', member.id)
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (recent && Date.now() - new Date(recent.created_at).getTime() < RESEND_COOLDOWN_MS)
    return fail('COOLDOWN', 429, { message: 'Please wait a moment before requesting another code.' });

  // Generate + store OTP (invalidate previous unconsumed ones)
  const code = generateOtp();
  await sb.from('otp_verifications').update({ consumed: true })
    .eq('election_id', election.id).eq('member_id', member.id).eq('consumed', false);
  const expires_at = new Date(Date.now() + OTP_TTL_MS).toISOString();
  const { data: otpRow, error: otpErr } = await sb.from('otp_verifications').insert({
    election_id: election.id, member_id: member.id, mobile: contact,
    code_hash: hashOtp(code), expires_at,
  }).select('id').single();
  if (otpErr) return fail('OTP_STORE_FAILED', 500, { message: 'Could not create OTP. Try again.' });

  // Deliver via the configured provider (email by default; whatsapp/twilio/meta/dev supported)
  try {
    const phone = isEmail ? null : contact;
    const { channel } = await deliverOtp({
      mobile: phone,
      whatsapp: member.whatsapp ? normalizePhone(member.whatsapp) : phone,
      email: member.email || (isEmail ? contact : null),
      code,
    });
    await sb.from('otp_verifications').update({ channel }).eq('id', otpRow.id);
    await logAudit({ action: 'OTP_SENT', actor: 'member', details: `${contact} via ${channel}`, election_id: election.id, ip });
    // Neutral-friendly success (does not confirm delivery target details)
    return ok({ otp_id: otpRow.id, channel, expires_at, member_name: member.full_name });
  } catch (e) {
    const testMode = e.dev || (process.env.NODE_ENV !== 'production' && /not configured|not set|dev/i.test(e.message));
    if (testMode) {
      await logAudit({ action: 'OTP_SENT', actor: 'system', details: `${contact} TEST-MODE (on-screen code)`, election_id: election.id, ip });
      return ok({ otp_id: otpRow.id, channel: 'dev', expires_at, member_name: member.full_name, dev_code: code });
    }
    console.error('OTP delivery failed:', e.message);
    await logAudit({ action: 'OTP_DELIVERY_FAILED', actor: 'system', details: `${contact}: ${e.message}`, election_id: election.id, ip });
    return fail('DELIVERY_FAILED', 502, { message: 'Could not send the code. Please try again shortly.', detail: e.message });
  }
}
