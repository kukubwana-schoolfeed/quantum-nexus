import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const listing = MOCK_DATA.appStoreOptimizer.getListing(tid, 'ap1');
    const asoScore = MOCK_DATA.appStoreOptimizer.getASOScore(tid, 'ap1');
    return apiResponse({ listing, asoScore });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load ASO data');
  }
}
