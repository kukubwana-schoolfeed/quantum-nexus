import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function POST(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const body = await req.json();
    const { notificationId } = body as { notificationId: string };

    if (!notificationId) {
      return apiError('Missing required field: notificationId', 400);
    }

    const supabase = getSupabaseAdminClient();

    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('tenant_id', tid);

    if (error) {
      console.error('[Notifications] Failed to mark read:', error.message);
      return apiResponse({ success: true, message: 'Failed to mark as read' });
    }

    return apiResponse({ success: true, message: 'Notification marked as read' });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to mark notification as read');
  }
}
