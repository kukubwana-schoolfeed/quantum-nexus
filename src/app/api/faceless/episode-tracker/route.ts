import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { EpisodeTrackerDTO } from '@/lib/api/schema';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('episode_trackers')
      .select('id, storyline_id, episode_number, title, status, published_at, views, engagement')
      .eq('tenant_id', tenantId);

    if (error) throw error;

    const result: EpisodeTrackerDTO[] = (data ?? []).map((row) => ({
      id: row.id,
      storylineId: row.storyline_id,
      episodeNumber: row.episode_number,
      title: row.title,
      status: row.status,
      publishedAt: row.published_at ?? null,
      views: row.views,
      engagement: row.engagement,
    }));

    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load episode tracker');
  }
}
