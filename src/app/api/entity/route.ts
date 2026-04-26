import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const listings = MOCK_DATA.entityBuilder.getListings(tid);
    const consistency = MOCK_DATA.entityBuilder.checkConsistency(tid);
    return apiResponse({ listings, consistency });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load entity data');
  }
}
