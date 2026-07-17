import { getAdmin } from '@/lib/auth';
import { fail } from '@/lib/api';
export function requireAdmin(req) {
  const admin = getAdmin(req);
  if (!admin) return { admin: null, res: fail('UNAUTHORIZED', 401, { message: 'Admin authentication required.' }) };
  return { admin, res: null };
}
