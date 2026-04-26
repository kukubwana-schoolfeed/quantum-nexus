import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function POST(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const body = await req.json();
    const { step, data } = body as { step: string; data: Record<string, unknown> };

    if (!step || !data) {
      return apiError('Missing required fields: step, data', 400);
    }

    const result = MOCK_DATA.onboardingEngine.saveStep(tid, { step, ...data });
    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to save onboarding step');
  }
}
