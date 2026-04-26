import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getPlatformStats, getTenantList } from '@/server/routes/admin/super-admin-dashboard';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const [stats, tenants] = await Promise.all([
      getPlatformStats(tid),
      getTenantList(tid, {}),
    ]);
    return apiResponse({ stats: stats.data, tenants: tenants.data });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load businesses');
  }
}
