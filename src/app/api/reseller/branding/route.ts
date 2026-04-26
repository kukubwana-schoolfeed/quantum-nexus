import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getBranding } from '@/server/routes/admin/reseller-dashboard';

export async function GET(req: NextRequest) {
  try {
    const result = await getBranding(getTenantId(req));
    return apiResponse(result.data);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load branding');
  }
}
