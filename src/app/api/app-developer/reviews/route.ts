import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const reviews = MOCK_DATA.appReviewMonitor.getReviews(tid, {});
    const stats = MOCK_DATA.appReviewMonitor.getReviewStats(tid);
    return apiResponse({ reviews, stats });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load app reviews');
  }
}
