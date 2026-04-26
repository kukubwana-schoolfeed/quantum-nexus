import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getHealth } from '@/server/routes/admin/platform-health-monitor';

export async function GET(req: NextRequest) {
  try {
    const result = await getHealth(getTenantId(req));
    return apiResponse(result.data);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load platform health');
  }
}
