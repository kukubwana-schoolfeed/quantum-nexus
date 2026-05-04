import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { CostOverviewDTO } from '@/lib/api/schema';

const ZEROED_COST: CostOverviewDTO = {
  anthropic: 0,
  elevenlabs: 0,
  twilio: 0,
  runway: 0,
  total: 0,
};

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('invoices')
      .select('amount_zmw')
      .eq('tenant_id', tid);

    if (error) {
      console.error('[admin/costs] DB error:', error.message);
      return apiResponse<CostOverviewDTO>(ZEROED_COST);
    }

    const total = (data ?? []).reduce(
      (sum, row) => sum + (Number(row.amount_zmw) || 0),
      0,
    );

    const result: CostOverviewDTO = {
      anthropic: 0,
      elevenlabs: 0,
      twilio: 0,
      runway: 0,
      total,
    };

    return apiResponse(result);
  } catch (e) {
    console.error('[admin/costs] Unexpected error:', e);
    return apiResponse<CostOverviewDTO>(ZEROED_COST);
  }
}
