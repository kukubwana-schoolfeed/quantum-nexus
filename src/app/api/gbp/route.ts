import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const profile = MOCK_DATA.googleBusinessProfileManager.getProfile(tid);
    const insights = MOCK_DATA.googleBusinessProfileManager.getInsights(tid);
    return apiResponse({ profile, insights });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load GBP data');
  }
}
