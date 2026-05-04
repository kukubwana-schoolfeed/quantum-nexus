import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('ugc_calendar_entries')
      .select('id, clip_id, platform, scheduled_for, status')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('[UGC Calendar] Query error:', error.message);
      return apiResponse([]);
    }

    const result = (data ?? []).map(row => ({
      id: row.id,
      clipId: row.clip_id,
      platform: row.platform,
      scheduledFor: row.scheduled_for,
      status: row.status,
    }));

    return apiResponse(result);
  } catch (e) {
    console.error('[UGC Calendar] Unexpected error:', e);
    return apiResponse([]);
  }
}
