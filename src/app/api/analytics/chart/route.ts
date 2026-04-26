import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getChart } from '@/server/routes/business/analytics-dashboard';

export async function GET(req: NextRequest) {
  try {
    const chartType = req.nextUrl.searchParams.get('type') ?? 'revenue';
    const period = req.nextUrl.searchParams.get('period') ?? '7d';
    const result = await getChart(getTenantId(req), chartType, period);
    return apiResponse(result.data);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load chart data');
  }
}
