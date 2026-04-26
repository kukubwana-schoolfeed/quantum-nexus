import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const candidates = MOCK_DATA.contentRecyclingEngine.getCandidates(tid, {});
    const history = MOCK_DATA.contentRecyclingEngine.getRecyclingHistory(tid, {});
    return apiResponse({ candidates, history });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load recycling data');
  }
}
