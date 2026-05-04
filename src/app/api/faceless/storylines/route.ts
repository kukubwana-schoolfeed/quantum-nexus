import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { StorylineDTO } from '@/lib/api/schema';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('storylines')
      .select('id, title, character_id, episode_count, status, description')
      .eq('tenant_id', tenantId);

    if (error) throw error;

    const result: StorylineDTO[] = (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      characterId: row.character_id,
      episodeCount: row.episode_count,
      status: row.status,
      description: row.description ?? null,
    }));

    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load storylines');
  }
}
