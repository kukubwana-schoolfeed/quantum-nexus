import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const insights = MOCK_DATA.facelessAudienceIntelligence.getInsights(tid);
    const growthData = MOCK_DATA.facelessAudienceIntelligence.getGrowthData(tid);
    return apiResponse({ insights, growthData });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load audience data');
  }
}
