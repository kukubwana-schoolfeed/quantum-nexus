import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('monetisation_opportunities')
      .select('id, brand_name, campaign_type, estimated_pay, deadline, status')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('[UGC Monetisation] Query error:', error.message);
      return apiResponse([]);
    }

    const result = (data ?? []).map(row => ({
      id: row.id,
      brandName: row.brand_name,
      campaignType: row.campaign_type,
      estimatedPay: Number(row.estimated_pay),
      deadline: row.deadline,
      status: row.status,
    }));

    return apiResponse(result);
  } catch (e) {
    console.error('[UGC Monetisation] Unexpected error:', e);
    return apiResponse([]);
  }
}
