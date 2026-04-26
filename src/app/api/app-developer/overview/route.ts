import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const apps = MOCK_DATA.appProfileEngine.getApps(tid);
    const analytics = MOCK_DATA.appAnalyticsDashboard.getOverview(tid);
    const revenue = MOCK_DATA.appPaymentIntelligence.getRevenue(tid);
    return apiResponse({ apps, analytics, revenue });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load app developer overview');
  }
}
