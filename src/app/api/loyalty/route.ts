import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const balance = MOCK_DATA.loyaltyPointsEngine.getBalance(tid, 'c1');
    const transactions = MOCK_DATA.loyaltyPointsEngine.getTransactions(tid, 'c1', {});
    return apiResponse({ balance, transactions });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load loyalty data');
  }
}
