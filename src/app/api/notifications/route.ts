import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('notifications')
      .select('id, type, title, body, read, read_at, action_url, priority, created_at')
      .eq('tenant_id', tid)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Notifications] Failed to fetch:', error.message);
      return apiResponse([]);
    }

    const result = (data ?? []).map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      body: row.body,
      read: row.read,
      readAt: row.read_at,
      actionUrl: row.action_url,
      priority: row.priority,
      createdAt: row.created_at,
    }));

    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load notifications');
  }
}
