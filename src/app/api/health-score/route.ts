import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getScore } from '@/server/routes/domination/client-health-score';

export async function GET(req: NextRequest) {
  try {
    const result = await getScore(getTenantId(req));
    return apiResponse(result.data);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load health score');
  }
}
