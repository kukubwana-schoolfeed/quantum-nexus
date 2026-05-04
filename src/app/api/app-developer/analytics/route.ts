import { NextRequest } from 'next/server';
import { getTenantId, apiResponse } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { AppAnalyticsOverviewDTO, AppRevenueDTO } from '@/lib/api/schema';

const zeroedOverview: AppAnalyticsOverviewDTO = {
  downloads: 0,
  activeUsers: 0,
  revenue: 0,
  crashRate: 0,
};

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('apps')
      .select('downloads')
      .eq('tenant_id', tid);

    if (error) throw error;

    const totalDownloads = (data ?? []).reduce((s: number, r: Record<string, unknown>) => s + ((r.downloads as number) ?? 0), 0);

    const overview: AppAnalyticsOverviewDTO = {
      downloads: totalDownloads,
      activeUsers: 0,
      revenue: 0,
      crashRate: 0,
    };

    const revenueBreakdown: AppRevenueDTO[] = [];

    return apiResponse({ overview, revenueBreakdown });
  } catch {
    return apiResponse({ overview: zeroedOverview, revenueBreakdown: [] as AppRevenueDTO[] });
  }
}
