import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { AssemblyJobDTO } from '@/lib/api/schema';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('assembly_jobs')
      .select('id, episode_id, status, progress, preview_url, output_url')
      .eq('tenant_id', tenantId);

    if (error) throw error;

    const result: AssemblyJobDTO[] = (data ?? []).map((row) => ({
      id: row.id,
      episodeId: row.episode_id,
      status: row.status,
      progress: row.progress,
      previewUrl: row.preview_url ?? null,
      outputUrl: row.output_url ?? null,
    }));

    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load assembly jobs');
  }
}
