import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getTrends } from '@/server/routes/domination/trend-intelligence-engine';

export async function GET(req: NextRequest) {
  try {
    const result = await getTrends(getTenantId(req), {});
    return apiResponse(result.data);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load trends');
  }
}
