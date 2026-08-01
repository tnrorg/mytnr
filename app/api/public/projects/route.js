import { supabaseAdmin } from '@/lib/supabaseServer';
import { ok } from '@/lib/api';
import { PUBLIC_PROJECT_COLUMNS, summarise } from '@/lib/projects';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/* Public, read-only: published TNR projects and their roll-up counts.
 *
 * An empty list is a valid answer — the statistics page then says there are no
 * projects recorded yet, which is honest. A missing table (migration not run)
 * behaves the same way rather than erroring.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin().from('tnr_projects')
      .select(PUBLIC_PROJECT_COLUMNS)
      .eq('published', true)
      .order('sort_order').order('created_at', { ascending: false });
    if (error) return ok({ projects: [], stats: summarise([]) });

    const projects = data || [];
    return ok({ projects, stats: summarise(projects) });
  } catch {
    return ok({ projects: [], stats: summarise([]) });
  }
}
