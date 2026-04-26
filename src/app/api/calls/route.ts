import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getCallLog } from '@/server/routes/business/inbound-call-handler';

export async function GET(req: NextRequest) {
  try {
    const result = await getCallLog(getTenantId(req), {});
    return apiResponse(result.data);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load call log');
  }
}
