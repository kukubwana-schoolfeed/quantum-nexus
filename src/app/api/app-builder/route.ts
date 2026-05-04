import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { AppDTO } from '@/lib/api/schema';

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

    return apiResponse(apps);
  } catch (e) {
    return apiResponse([] as AppDTO[]);
  }
}
