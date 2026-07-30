import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/guard';
import { logAudit, clientIp } from '@/lib/audit';
import { ok, fail, readJson } from '@/lib/api';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const table = (t) => t === 'village' ? 'membership_villages' : 'membership_union_councils';

export async function PATCH(req, { params }) {
  const { admin, res } = requireAdmin(req); if (res) return res;
  const b = await readJson(req);
  const patch = {};
  if ('name' in b) patch.name = String(b.name || '').trim();
  if ('active' in b) patch.active = !!b.active;
  if ('sort_order' in b) patch.sort_order = Number(b.sort_order) || 0;
  if ('union_council_id' in b) patch.union_council_id = b.union_council_id;
  if (!Object.keys(patch).length) return fail('INVALID', 400, { message: 'Nothing to update.' });

  const { data, error } = await supabaseAdmin().from(table(b.type))
    .update(patch).eq('id', params.id).select().maybeSingle();
  if (error) return fail('SAVE_FAILED', 500, { message: error.message });
  await logAudit({ action: 'AREA_UPDATED', actor: admin.username, details: patch.name || params.id, ip: clientIp(req) });
  return ok({ row: data });
}

export async function DELETE(req, { params }) {
  const { admin, res } = requireAdmin(req); if (res) return res;
  const type = new URL(req.url).searchParams.get('type');
  // Deleting a council cascades to its villages (FK on delete cascade).
  const { error } = await supabaseAdmin().from(table(type)).delete().eq('id', params.id);
  if (error) return fail('DELETE_FAILED', 500, { message: error.message });
  await logAudit({ action: 'AREA_DELETED', actor: admin.username, details: params.id, ip: clientIp(req) });
  return ok({});
}
