import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { EpisodeOutlineDTO } from '@/lib/api/schema';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('episode_outlines')
      .select('id, storyline_id, episode_number, title, synopsis, status')
      .eq('tenant_id', tenantId);

    if (error) throw error;

    const result: EpisodeOutlineDTO[] = (data ?? []).map((row) => ({
      id: row.id,
      storylineId: row.storyline_id,
      episodeNumber: row.episode_number,
      title: row.title,
      synopsis: row.synopsis,
      status: row.status,
    }));

    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load episodes');
  }
}
