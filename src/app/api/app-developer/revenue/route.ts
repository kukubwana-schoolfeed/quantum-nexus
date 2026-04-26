import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const revenue = MOCK_DATA.appPaymentIntelligence.getRevenue(tid);
    const churnRate = MOCK_DATA.appPaymentIntelligence.getChurnRate(tid);
    const topProducts = MOCK_DATA.appPaymentIntelligence.getTopProducts(tid);
    return apiResponse({ revenue, churnRate, topProducts });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load app revenue');
  }
}
