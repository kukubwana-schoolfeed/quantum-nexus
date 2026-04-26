import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getVelocity } from '@/server/routes/domination/reputation-velocity-tracker';

export async function GET(req: NextRequest) {
  try {
    const result = await getVelocity(getTenantId(req));
    return apiResponse(result.data);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load velocity data');
  }
}
