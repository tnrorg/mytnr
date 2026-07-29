import { requireMember } from '@/lib/membership/auth';
import { ok } from '@/lib/api';
export const dynamic = 'force-dynamic';

// The member's own record — never exposes password_hash or invite tokens.
export async function GET(req) {
  const { member, res } = await requireMember(req); if (res) return res;
  const {
    password_hash, invite_token, invite_expires_at, session_epoch, deleted_at, ...safe
  } = member;
  return ok({ member: safe });
}
