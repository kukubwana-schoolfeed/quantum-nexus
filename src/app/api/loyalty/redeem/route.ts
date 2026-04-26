import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function POST(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const body = await req.json();
    const { points, description } = body as { points: number; description: string };

    if (!points || points <= 0) {
      return apiError('Points must be a positive number', 400);
    }

    const result = MOCK_DATA.loyaltyPointsEngine.redeemPoints(tid, 'c1', points, description ?? 'Redemption');
    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to redeem points');
  }
}
