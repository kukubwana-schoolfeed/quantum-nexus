import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getConnectedPlatforms } from '@/server/routes/business/social-media-layer';

export async function GET(req: NextRequest) {
  try {
    const result = await getConnectedPlatforms(getTenantId(req));
    return apiResponse(result.data);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load connected platforms');
  }
}
