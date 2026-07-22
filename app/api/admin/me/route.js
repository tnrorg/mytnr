import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireAdmin, isSuperAdmin } from '@/lib/guard';
import { ok } from '@/lib/api';

export const dynamic = 'force-dynamic';

// The client never decides its own role. The server verifies the signed token,
// re-reads the CURRENT role from the database, and returns the extra tabs only
// to a genuine Super Admin. A normal admin's response contains no trace of them.
export async function GET(req) {
  const { admin, res } = requireAdmin(req); if (res) return res;
  const sb = supabaseAdmin();

  const { data: row } = await sb.from('admin_users')
    .select('id, username, full_name, role').eq('id', admin.sub).maybeSingle();
  if (!row) return ok({ username: admin.username, full_name: null, extra_tabs: [] });

  const superUser = isSuperAdmin({ role: row.role });
  return ok({
    username: row.username,
    full_name: row.full_name,
    label: superUser ? 'Super Admin' : 'Control Panel',
    // Labels live on the server — a normal admin never downloads these strings.
    extra_tabs: superUser
      ? [['committee', 'Committee Vote Entry', '🔐'], ['voterdata', 'Voter Data', '🗃️'], ['admins', 'Admin Accounts', '🛡️']]
      : [],
  });
}
