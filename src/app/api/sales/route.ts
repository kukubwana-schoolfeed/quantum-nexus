import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('sales_campaigns')
      .select('id, name, status, targets_count, responses_count')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('[sales] DB error:', error.message);
      return apiResponse([]);
    }

    const campaigns = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      targetsCount: row.targets_count,
      responsesCount: row.responses_count,
    }));

    return apiResponse(campaigns);
  } catch (e) {
    console.error('[sales] Unexpected error:', e);
    return apiResponse([]);
  }
}
