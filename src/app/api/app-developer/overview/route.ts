import { NextRequest } from 'next/server';
import { getTenantId, apiResponse } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { AppDTO, AppAnalyticsOverviewDTO, AppRevenueDTO } from '@/lib/api/schema';

const zeroedAnalytics: AppAnalyticsOverviewDTO = {
  downloads: 0,
  activeUsers: 0,
  revenue: 0,
  crashRate: 0,
};

const zeroedRevenue: AppRevenueDTO = {
  today: 0,
  thisWeek: 0,
  thisMonth: 0,
};

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('apps')
      .select('id, name, platform, category, status, downloads, icon_url')
      .eq('tenant_id', tid);

    if (error) throw error;

    const apps: AppDTO[] = (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      name: r.name as string,
      platform: r.platform as AppDTO['platform'],
      category: r.category as string,
      status: r.status as AppDTO['status'],
      downloads: r.downloads as number,
      iconUrl: r.icon_url as string | null,
    }));

    const totalDownloads = apps.reduce((s, a) => s + a.downloads, 0);

    const analytics: AppAnalyticsOverviewDTO = {
      downloads: totalDownloads,
      activeUsers: 0,
      revenue: 0,
      crashRate: 0,
    };

    return apiResponse({ apps, analytics, revenue: zeroedRevenue });
  } catch {
    return apiResponse({ apps: [] as AppDTO[], analytics: zeroedAnalytics, revenue: zeroedRevenue });
  }
}
