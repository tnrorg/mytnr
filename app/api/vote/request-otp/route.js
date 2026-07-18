import { supabaseAdmin } from '@/lib/supabaseServer';
import { normalizePhone } from '@/lib/phone';
import { generateOtp, hashOtp, OTP_TTL_MS } from '@/lib/otp';
import { deliverOtp } from '@/lib/otpSender';
import { getActiveElection, isVotingOpen } from '@/lib/election';
import { logAudit, clientIp } from '@/lib/audit';
import { ok, fail, readJson } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const sb = supabaseAdmin();
  const { mobile } = await readJson(req);
  const ip = clientIp(req);
  const phone = normalizePhone(mobile);
  if (!phone || phone.length < 8) return fail('INVALID_NUMBER', 400, { message: 'This mobile number is not registered for voting.' });

  const election = await getActiveElection();
  if (!election) return fail('NO_ELECTION', 400, { message: 'No election is currently available.' });

  // Member lookup
  const { data: member } = await sb.from('members').select('*').eq('mobile', phone).maybeSingle();
  if (!member) {
    await logAudit({ action: 'OTP_REJECTED_UNREGISTERED', actor: 'member', details: phone, election_id: election.id, ip });
    return fail('NOT_REGISTERED', 404, { message: 'This mobile number is not registered for voting.' });
  }
  if (member.status === 'Blocked')  return fail('BLOCKED', 403, { message: 'Your membership has been blocked. Please contact the administration.' });
  if (member.status !== 'Approved') return fail('NOT_APPROVED', 403, { message: 'Your membership is not approved yet.' });

  // Voter list must be locked and member must be on it
  if (!election.voter_list_locked) return fail('NOT_LOCKED', 403, { message: 'Voting has not opened yet. The voter list is being finalized.' });
  const { data: locked } = await sb.from('locked_voter_list').select('id')
    .eq('election_id', election.id).eq('member_id', member.id).maybeSingle();
  if (!locked) return fail('NOT_ON_LIST', 403, { message: 'This mobile number is not on the locked voter list for this election.' });

  // Voting window
  if (!isVotingOpen(election)) return fail('NOT_ACTIVE', 403, { message: 'Voting is not currently open for this election.' });

  // Already voted?
  const { data: existing } = await sb.from('votes').select('id')
    .eq('election_id', election.id).eq('member_id', member.id).maybeSingle();
  if (existing) {
    await logAudit({ action: 'DUPLICATE_VOTE_ATTEMPT', actor: 'member', details: phone, election_id: election.id, ip });
    return fail('ALREADY_VOTED', 409, { message: 'You have already cast your vote. Duplicate voting is not allowed.' });
  }

  // Generate + store OTP (invalidate previous unconsumed ones)
  const code = generateOtp();
  await sb.from('otp_verifications').update({ consumed: true })
    .eq('election_id', election.id).eq('member_id', member.id).eq('consumed', false);
  const expires_at = new Date(Date.now() + OTP_TTL_MS).toISOString();
  const { data: otpRow, error: otpErr } = await sb.from('otp_verifications').insert({
    election_id: election.id, member_id: member.id, mobile: phone,
    code_hash: hashOtp(code), expires_at,
  }).select('id').single();
  if (otpErr) return fail('OTP_STORE_FAILED', 500, { message: 'Could not create OTP. Try again.' });

  // Deliver: WhatsApp primary, SMS backup
  try {
    const { channel } = await deliverOtp({ mobile: phone, whatsapp: member.whatsapp ? normalizePhone(member.whatsapp) : phone, code });
    await sb.from('otp_verifications').update({ channel }).eq('id', otpRow.id);
    await logAudit({ action: 'OTP_SENT', actor: 'member', details: `${phone} via ${channel}`, election_id: election.id, ip });
    return ok({ otp_id: otpRow.id, channel, expires_at, member_name: member.full_name });
  } catch (e) {
    // Test mode: when OTP_PROVIDER=dev (opt-in), show the code on screen instead of sending it.
    // e.dev is set only when the provider is explicitly 'dev', so this never leaks for a
    // misconfigured real provider in production.
    const testMode = e.dev || (process.env.NODE_ENV !== 'production' && /not configured|not set|dev/i.test(e.message));
    if (testMode) {
      await logAudit({ action: 'OTP_SENT', actor: 'system', details: `${phone} TEST-MODE (on-screen code)`, election_id: election.id, ip });
      return ok({ otp_id: otpRow.id, channel: 'dev', expires_at, member_name: member.full_name, dev_code: code });
    }
    // Log the REAL provider error so it's visible in Vercel logs + Admin → Audit Logs.
    console.error('OTP delivery failed:', e.message);
    await logAudit({ action: 'OTP_DELIVERY_FAILED', actor: 'system', details: `${phone}: ${e.message}`, election_id: election.id, ip });
    return fail('DELIVERY_FAILED', 502, {
      message: 'Could not send OTP. Please try again shortly.',
      detail: e.message,   // real reason (visible in the browser Network tab for debugging)
    });
  }
}
