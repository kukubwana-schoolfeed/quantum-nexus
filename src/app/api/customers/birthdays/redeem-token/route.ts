import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function POST(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const body = await req.json();
    const { token } = body as { token: string };

    if (!token) {
      return apiError('Missing required field: token', 400);
    }

    const result = MOCK_DATA.birthdayEngine.redeemToken(tid, token, 'staff');
    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to redeem token');
  }
}
