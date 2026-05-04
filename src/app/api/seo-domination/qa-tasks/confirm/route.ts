import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function POST(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const body = await req.json().catch(() => ({}));
    const { taskId, status } = body as { taskId?: string; status?: string };

    if (!taskId) {
      return apiError('Missing required field: taskId', 400);
    }

    const newStatus = status === 'complete' ? 'complete' : 'answered';
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('seo_tasks')
      .update({ status: newStatus })
      .eq('id', taskId)
      .eq('tenant_id', tenantId)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('[seo-domination/qa-tasks/confirm] DB error:', error.message);
      return apiError('Failed to update QA task status');
    }

    if (!data) {
      return apiError('QA task not found', 404);
    }

    return apiResponse({ success: true, taskId, status: newStatus });
  } catch (e) {
    console.error('[seo-domination/qa-tasks/confirm] Unexpected error:', e);
    return apiError(e instanceof Error ? e.message : 'Failed to confirm QA task');
  }
}
