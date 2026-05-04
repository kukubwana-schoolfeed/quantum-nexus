import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('tenants')
      .select('sprint_mode_active, sprint_mode_ends_at')
      .eq('id', tenantId)
      .maybeSingle();

    if (error) {
      console.error('[sprint] DB error:', error.message);
    }

    const config = {
      active: data?.sprint_mode_active ?? false,
      postingMultiplier: 3,
      clipExtractionMode: 'maximum',
      commentResponseSpeed: 'every',
      trendCheckFrequency: 'daily',
      warmupOverride: false,
      endsAt: data?.sprint_mode_ends_at ?? null,
    };

    return apiResponse(config);
  } catch (e) {
    console.error('[sprint] Unexpected error:', e);
    return apiResponse({
      active: false,
      postingMultiplier: 3,
      clipExtractionMode: 'maximum',
      commentResponseSpeed: 'every',
      trendCheckFrequency: 'daily',
      warmupOverride: false,
      endsAt: null,
    });
  }
}
