import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tid)
      .eq('read', false);

    if (error) {
      console.error('[Notifications] Failed to count unread:', error.message);
      return apiResponse({ count: 0 });
    }

    return apiResponse({ count: count ?? 0 });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load unread count');
  }
}
