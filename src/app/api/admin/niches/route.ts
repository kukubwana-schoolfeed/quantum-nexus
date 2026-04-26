import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const niches = MOCK_DATA.nicheIntelligence.getNiches(tid);
    const pendingReviews = MOCK_DATA.nicheResearchReview.getPendingReviews(tid);
    return apiResponse({ niches, pendingReviews });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load niches');
  }
}
