import { sendWhatsAppLocal } from './whatsapp';

const otpBody = (code) =>
  `TNR Election 2026\nYour One-Time Password is: ${code}\nآپ کا او ٹی پی: ${code}\nValid for 5 minutes. Do not share this code.`;

// Chooses delivery based on OTP_PROVIDER: "whatsapp" (free self-hosted) | "twilio" | "dev"
export async function deliverOtp({ mobile, whatsapp, code }) {
  const provider = (process.env.OTP_PROVIDER || 'whatsapp').toLowerCase();
  const to = whatsapp || mobile;

  if (provider === 'whatsapp') {
    await sendWhatsAppLocal(to, otpBody(code));
    return { channel: 'whatsapp' };
  }

  if (provider === 'twilio') {
    const { sendOtp } = await import('./twilio');           // WhatsApp→SMS via Twilio
    return sendOtp({ whatsapp: to, sms: mobile, code });
  }

  // dev: no external send (code surfaced by the API in non-production)
  const e = new Error('OTP_PROVIDER=dev (no external delivery configured)');
  e.dev = true; throw e;
}
