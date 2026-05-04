import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('review_campaigns')
      .select('id, name, status, sent_count, response_count')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('[reviews/campaigns] DB error:', error.message);
      return apiResponse([]);
    }

    const campaigns = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      sentCount: row.sent_count,
      responseCount: row.response_count,
    }));

    return apiResponse(campaigns);
  } catch (e) {
    console.error('[reviews/campaigns] Unexpected error:', e);
    return apiResponse([]);
  }
}
