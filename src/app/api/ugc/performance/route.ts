import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const performance = MOCK_DATA.ugcPerformanceFeedback.getPerformance(tid, 'clip1');
    const topPerforming = MOCK_DATA.ugcPerformanceFeedback.getTopPerforming(tid, {});
    return apiResponse({ performance, topPerforming });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load performance data');
  }
}
