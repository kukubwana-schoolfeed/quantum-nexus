import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('ugc_clips')
      .select('id, video_id, start_time, end_time, score, hook_text, status')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('[UGC Clips] Query error:', error.message);
      return apiResponse([]);
    }

    const result = (data ?? []).map(row => ({
      id: row.id,
      videoId: row.video_id,
      startTime: Number(row.start_time),
      endTime: Number(row.end_time),
      score: row.score,
      hookText: row.hook_text,
      status: row.status,
    }));

    return apiResponse(result);
  } catch (e) {
    console.error('[UGC Clips] Unexpected error:', e);
    return apiResponse([]);
  }
}
