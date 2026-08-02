import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/guard';
import { logAudit, clientIp } from '@/lib/audit';
import { ok, fail, readJson } from '@/lib/api';
import { reviewFromBody } from '@/lib/cecWrite';
import { APP_STATUS_LABEL } from '@/lib/cec';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function PATCH(req, { params }) {
  const { admin, res } = requireAdmin(req); if (res) return res;
  const b = await readJson(req);

  const patch = reviewFromBody(b, admin.username);
  const { data, error } = await supabaseAdmin().from('cec_applications')
    .update(patch).eq('id', params.id).select().maybeSingle();
  if (error) return fail('SAVE_FAILED', 500, { message: error.message });
  if (!data) return fail('NOT_FOUND', 404, { message: 'Application not found.' });

  await logAudit({
    action: 'CEC_APPLICATION_REVIEWED', actor: admin.username,
    details: `${data.full_name || data.reference_no || params.id}` +
      (patch.status ? ` → ${APP_STATUS_LABEL[patch.status]}` : ' — notes updated'),
    ip: clientIp(req),
  });
  return ok({ application: data, message: 'Saved.' });
}

export async function DELETE(req, { params }) {
  const { admin, res } = requireAdmin(req); if (res) return res;
  const sb = supabaseAdmin();

  const { data: before } = await sb.from('cec_applications')
    .select('full_name, reference_no').eq('id', params.id).maybeSingle();
  const { error } = await sb.from('cec_applications').delete().eq('id', params.id);
  if (error) return fail('DELETE_FAILED', 500, { message: error.message });

  await logAudit({
    action: 'CEC_APPLICATION_DELETED', actor: admin.username,
    details: before?.reference_no || before?.full_name || params.id, ip: clientIp(req),
  });
  return ok({ message: 'Application deleted.' });
}
