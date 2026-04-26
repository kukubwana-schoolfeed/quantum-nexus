import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getOverview } from '@/server/routes/business/reputation-layer';

export async function GET(req: NextRequest) {
  try {
    const result = await getOverview(getTenantId(req));
    return apiResponse(result.data);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load reputation overview');
  }
}
