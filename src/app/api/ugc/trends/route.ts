import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('ugc_trends')
      .select('id, trend_type, trend_text, platform, score')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('[UGC Trends] Query error:', error.message);
      return apiResponse([]);
    }

    const result = (data ?? []).map(row => ({
      id: row.id,
      trendType: row.trend_type,
      trendText: row.trend_text,
      platform: row.platform,
      score: row.score,
    }));

    return apiResponse(result);
  } catch (e) {
    console.error('[UGC Trends] Unexpected error:', e);
    return apiResponse([]);
  }
}
