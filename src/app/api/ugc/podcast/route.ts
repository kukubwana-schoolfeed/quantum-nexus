import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('podcast_episodes')
      .select('id, title, duration_seconds, status, audio_url, published_at')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('[UGC Podcast] Query error:', error.message);
      return apiResponse([]);
    }

    const result = (data ?? []).map(row => ({
      id: row.id,
      title: row.title,
      durationSeconds: row.duration_seconds,
      status: row.status,
      audioUrl: row.audio_url,
      publishedAt: row.published_at,
    }));

    return apiResponse(result);
  } catch (e) {
    console.error('[UGC Podcast] Unexpected error:', e);
    return apiResponse([]);
  }
}
