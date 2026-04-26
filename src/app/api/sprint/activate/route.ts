import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function POST(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const body = await req.json().catch(() => ({}));
    const result = MOCK_DATA.sprintModeEngine.activate(tid);
    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to activate sprint mode');
  }
}
