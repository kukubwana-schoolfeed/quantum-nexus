import { NextRequest } from 'next/server';
import { getTenantId, apiResponse } from '@/lib/api/route-helper';
import type { AppRevenueDTO, AppChurnDTO } from '@/lib/api/schema';

const zeroedRevenue: AppRevenueDTO = {
  today: 0,
  thisWeek: 0,
  thisMonth: 0,
};

const zeroedChurn: AppChurnDTO = {
  rate: 0,
  trend: 'stable',
};

export async function GET(_req: NextRequest) {
  return apiResponse({
    revenue: zeroedRevenue,
    churnRate: zeroedChurn,
    topProducts: [] as Array<{ name: string; revenue: number; growth: number }>,
  });
}
