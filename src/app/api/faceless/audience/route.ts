import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import type { AudienceInsightsDTO, AudienceGrowthDTO } from '@/lib/api/schema';

export async function GET(req: NextRequest) {
  try {
    getTenantId(req); // consume tenant for future use

    const insights: AudienceInsightsDTO = {
      avgViewDuration: 0,
      topDemographic: '',
      engagementPeakDay: '',
      suggestedPostTime: '',
    };

    const growthData: AudienceGrowthDTO = {
      subscribers: 0,
      views: 0,
      growthRate: 0,
    };

    return apiResponse({ insights, growthData });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load audience data');
  }
}
