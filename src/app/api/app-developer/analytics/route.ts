import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const overview = MOCK_DATA.appAnalyticsDashboard.getOverview(tid);
    const revenueBreakdown = MOCK_DATA.appAnalyticsDashboard.getRevenueBreakdown(tid);
    return apiResponse({ overview, revenueBreakdown });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load app analytics');
  }
}
