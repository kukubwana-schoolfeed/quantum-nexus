import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getAudits } from '@/server/routes/domination/business-audit-engine';

export async function GET(req: NextRequest) {
  try {
    const result = await getAudits(getTenantId(req));
    return apiResponse(result.data);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load audits');
  }
}
