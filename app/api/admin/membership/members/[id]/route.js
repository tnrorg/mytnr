import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/guard';
import { ok, fail, readJson } from '@/lib/api';
import { clientIp } from '@/lib/audit';
import { logMembershipAudit } from '@/lib/membership/core';

export const dynamic = 'force-dynamic';
const STATUSES = ['approved', 'active', 'suspended', 'inactive', 'expired'];

// PATCH — status change, category, public visibility.
// Membership ID can never be altered here.
export async function PATCH(req, { params }) {
  const { admin, res } = requireAdmin(req); if (res) return res;
  const sb = supabaseAdmin();
  const b = await readJson(req);
  const ip = clientIp(req);

  const { data: m } = await sb.from('membership_members').select('*').eq('id', params.id).maybeSingle();
  if (!m) return fail('NOT_FOUND', 404, { message: 'Member not found.' });

  const patch = { updated_at: new Date().toISOString() };
  const notes = [];

  if (b.status !== undefined) {
    if (!STATUSES.includes(b.status)) return fail('BAD_STATUS', 400, { message: 'Unknown status.' });
    if (b.status !== m.status) {
      if (['suspended', 'inactive', 'expired'].includes(b.status) && !String(b.reason || '').trim())
        return fail('REASON_REQUIRED', 400, { message: 'A reason is required for this status change.' });
      patch.status = b.status;
      // Suspending also ends any active session immediately.
      if (b.status !== 'active' && b.status !== 'approved')
        patch.session_epoch = (m.session_epoch || 0) + 1;
      notes.push(`status ${m.status} → ${b.status}`);
    }
  }
  if (b.public_visible !== undefined && !!b.public_visible !== m.public_visible) {
    patch.public_visible = !!b.public_visible;
    notes.push(`public visibility ${patch.public_visible ? 'on' : 'off'}`);
  }
  if (b.category_id !== undefined && b.category_id !== m.category_id) {
    patch.category_id = b.category_id || null;
    notes.push('category changed');
  }
  if (!notes.length) return ok({ updated: false });

  const { error } = await sb.from('membership_members').update(patch).eq('id', m.id);
  if (error) return fail('UPDATE_FAILED', 500, { message: 'Could not update the member.', detail: error.message });

  if (patch.status) {
    await sb.from('membership_status_history').insert({
      member_id: m.id, from_status: m.status, to_status: patch.status,
      reason: b.reason || null, changed_by: admin.username,
    });
    await sb.from('membership_notifications').insert({
      member_id: m.id,
      title: `Membership ${patch.status}`,
      body: b.reason || `Your membership status is now ${patch.status}.`,
      category: 'membership',
    }).then(() => {}, () => {});
  }

  await logMembershipAudit({
    admin_name: admin.username, action: 'MEMBER_UPDATED', target_type: 'member',
    target_id: m.membership_id, previous_value: { status: m.status, public_visible: m.public_visible },
    new_value: patch, reason: b.reason || null, ip,
  });

  return ok({ updated: true, changes: notes });
}
