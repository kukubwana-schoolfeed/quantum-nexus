import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function POST(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const body = await req.json();
    const { customerId } = body as { customerId: string };

    if (!customerId) {
      return apiError('Missing required field: customerId', 400);
    }

    const token = MOCK_DATA.birthdayEngine.generateToken(tid, customerId);
    return apiResponse(token);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to generate token');
  }
}
