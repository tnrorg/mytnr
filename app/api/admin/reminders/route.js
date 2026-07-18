import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/guard';
import { getActiveElection } from '@/lib/election';
import { sendNotice, fillTokens } from '@/lib/mailer';
import { logAudit, clientIp } from '@/lib/audit';
import { ok, fail, readJson } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

const MAX_BATCH = 25; // keep each request inside the serverless time limit

// Returns the recipient list for the chosen audience (approved members with an email).
async function recipients(audience, election) {
  const sb = supabaseAdmin();
  // select('*') so a missing optional column can never blank the whole query
  const { data: members, error: memErr } = await sb.from('members').select('*');
  if (memErr) { const e = new Error('members query failed: ' + memErr.message); e.dbError = true; throw e; }
  // Status match is case-insensitive so 'approved' / 'APPROVED' still count.
  let list = (members || [])
    .filter(m => String(m.status || '').trim().toLowerCase() === 'approved')
    .map(m => ({ ...m, email: String(m.email || '').trim() }))
    .filter(m => m.email.includes('@'));

  if (!election || audience === 'all') return list;

  // Restrict to the locked voter list for this election
  const { data: locked } = await sb.from('locked_voter_list').select('member_id').eq('election_id', election.id);
  const onList = new Set((locked || []).map(r => r.member_id));
  if (election.voter_list_locked && onList.size) list = list.filter(m => onList.has(m.id));

  if (audience === 'voted' || audience === 'not_voted') {
    const { data: votes } = await sb.from('votes').select('member_id').eq('election_id', election.id);
    const voted = new Set((votes || []).map(v => v.member_id));
    list = list.filter(m => audience === 'voted' ? voted.has(m.id) : !voted.has(m.id));
  }
  return list;
}

// GET → audience counts so the admin can preview before sending
export async function GET(req) {
  const { res } = requireAdmin(req);
  if (res) return res;
  try {
  const election = await getActiveElection();
  const [all, notVoted, voted] = await Promise.all([
    recipients('all', election), recipients('not_voted', election), recipients('voted', election),
  ]);
  // Diagnostics so a zero count explains itself in the UI
  const sb = supabaseAdmin();
  const { data: raw, error: rawErr } = await sb.from('members').select('*');
  if (rawErr) return fail('DB_ERROR', 500, { message: 'Could not read members table.', detail: rawErr.message });
  const rows = raw || [];
  const sample = rows[0] ? Object.keys(rows[0]) : [];
  const approved = rows.filter(m => String(m.status || '').trim().toLowerCase() === 'approved');
  const noEmail = approved.filter(m => !String(m.email || '').trim().includes('@')).length;
  const statuses = {};
  rows.forEach(m => { const k = String(m.status || '(blank)').trim(); statuses[k] = (statuses[k] || 0) + 1; });

  return ok({
    election: election ? { id: election.id, title: election.title, voting_open: !!election.voting_open } : null,
    counts: { all: all.length, not_voted: notVoted.length, voted: voted.length, missing_email: noEmail },
    diagnostics: { total_members: rows.length, approved: approved.length, statuses, columns: sample, has_email_column: sample.includes('email') },
    smtp_configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
  });
  } catch (e) {
    return fail('DIAG_FAILED', 500, { message: 'Could not build recipient list.', detail: e.message });
  }
}

// POST → send one batch. The client loops with `offset` until done:true.
export async function POST(req) {
  const { admin, res } = requireAdmin(req);
  if (res) return res;
  const b = await readJson(req);
  const subject = String(b.subject || '').trim();
  const message = String(b.message || '').trim();
  const heading = String(b.heading || '').trim();
  const audience = ['all', 'not_voted', 'voted'].includes(b.audience) ? b.audience : 'not_voted';
  const offset = Math.max(0, Number(b.offset || 0));
  const ip = clientIp(req);

  if (!subject || !message)
    return fail('INVALID', 400, { message: 'Subject and message are both required.' });

  const election = await getActiveElection();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const ctaUrl = b.include_button === false ? null : `${origin}/vote`;
  const ctaText = 'Cast Your Vote';

  // Test send — one email to the admin, nothing recorded against members.
  if (b.test_email) {
    try {
      await sendNotice({
        to: String(b.test_email).trim(), subject: `[TEST] ${subject}`, heading,
        body: fillTokens(message, { full_name: 'Test Member', member_code: 'TNR-000' }),
        ctaText: ctaUrl ? ctaText : null, ctaUrl,
      });
      return ok({ test: true, sent: 1 });
    } catch (e) {
      return fail('SEND_FAILED', 502, { message: 'Test email failed.', detail: e.message });
    }
  }

  const all = await recipients(audience, election);
  const batch = all.slice(offset, offset + MAX_BATCH);
  if (!batch.length)
    return ok({ done: true, total: all.length, sent: 0, failed: 0, next_offset: offset, errors: [] });

  let sent = 0; const errors = [];
  for (const m of batch) {
    try {
      await sendNotice({
        to: m.email, subject, heading,
        body: fillTokens(message, m),
        ctaText: ctaUrl ? ctaText : null, ctaUrl,
      });
      sent++;
    } catch (e) {
      errors.push(`${m.email}: ${e.message}`);
    }
  }

  const next_offset = offset + batch.length;
  const done = next_offset >= all.length;

  await logAudit({
    action: 'REMINDER_EMAIL_SENT', actor: admin?.username || 'admin',
    details: `${audience} · ${sent} sent, ${errors.length} failed (${offset + 1}-${next_offset} of ${all.length}) · "${subject}"`,
    election_id: election?.id || null, ip,
  });

  return ok({ done, total: all.length, sent, failed: errors.length, next_offset, errors: errors.slice(0, 5) });
}
