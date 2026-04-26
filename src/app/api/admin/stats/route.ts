import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getPlatformStats } from '@/server/routes/admin/super-admin-dashboard';

export async function GET(req: NextRequest) {
  try {
    const result = await getPlatformStats(getTenantId(req));
    return apiResponse(result.data);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load platform stats');
  }
}
