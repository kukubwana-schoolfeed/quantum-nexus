import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getKeywordStrategy } from '@/server/routes/business/seo-engine';

export async function GET(req: NextRequest) {
  try {
    const result = await getKeywordStrategy(getTenantId(req));
    return apiResponse(result.data);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load keyword strategy');
  }
}
