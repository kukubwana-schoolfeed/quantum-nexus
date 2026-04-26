import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const opportunities = MOCK_DATA.ugcMonetisationIntelligence.getOpportunities(tid);
    const brandDeals = MOCK_DATA.ugcMonetisationIntelligence.getBrandDeals(tid);
    const suggestedRates = MOCK_DATA.ugcMonetisationIntelligence.getSuggestedRates(tid);
    return apiResponse({ opportunities, brandDeals, suggestedRates });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load monetisation data');
  }
}
