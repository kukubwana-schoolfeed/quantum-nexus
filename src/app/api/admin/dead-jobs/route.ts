import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { DeadJobDTO } from '@/lib/api/schema';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('dead_jobs')
      .select('id, tenant_id, queue_name, job_type, error_message, failed_at, reviewed')
      .eq('tenant_id', tid);

    if (error) {
      console.error('[admin/dead-jobs] DB error:', error.message);
      return apiResponse<DeadJobDTO[]>([]);
    }

    const result: DeadJobDTO[] = (data ?? []).map((row) => ({
      id: row.id,
      tenantId: row.tenant_id,
      queueName: row.queue_name,
      jobType: row.job_type,
      errorMessage: row.error_message,
      failedAt: row.failed_at,
      reviewed: row.reviewed,
    }));

    return apiResponse(result);
  } catch (e) {
    console.error('[admin/dead-jobs] Unexpected error:', e);
    return apiResponse<DeadJobDTO[]>([]);
  }
}
