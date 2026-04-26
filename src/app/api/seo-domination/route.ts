import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const blogSchedule = MOCK_DATA.seoDominationEngine.getDailyBlogSchedule(tid);
    const qaTasks = MOCK_DATA.seoDominationEngine.getQaTasks(tid);
    return apiResponse({ blogSchedule, qaTasks });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load SEO domination data');
  }
}
