import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';
import { getPricing } from '@/server/routes/admin/reseller-dashboard';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const tiers = MOCK_DATA.tierSystem.getTiers();
    const pricing = await getPricing(tid);
    return apiResponse({ tiers, pricing: pricing.data });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load pricing');
  }
}
