import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function POST(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('tenant_id', tid)
      .eq('read', false);

    if (error) {
      console.error('[Notifications] Failed to mark all read:', error.message);
      return apiResponse({ success: true, message: 'Failed to mark all as read' });
    }

    return apiResponse({ success: true, message: 'All notifications marked as read' });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to mark all notifications as read');
  }
}
