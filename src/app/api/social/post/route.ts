import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { safetyGuard } from '@/middleware/safety-guard';

export async function POST(req: NextRequest) {
  const claims = getTenantId(req) as any;
  const safetyResponse = await safetyGuard(req, claims);
  if (safetyResponse.status !== 200) return safetyResponse;

  try {
    return apiResponse({ success: true });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to create social post');
  }
}
