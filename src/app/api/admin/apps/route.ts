import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { AppSubmissionDTO } from '@/lib/api/schema';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('app_submissions')
      .select('id, app_id, app_name, submitted_at, status, reviewer_notes')
      .eq('tenant_id', tid);

    if (error) {
      console.error('[admin/apps] DB error:', error.message);
      return apiResponse<AppSubmissionDTO[]>([]);
    }

    const result: AppSubmissionDTO[] = (data ?? []).map((row) => ({
      id: row.id,
      appId: row.app_id,
      appName: row.app_name,
      submittedAt: row.submitted_at,
      status: row.status,
      reviewerNotes: row.reviewer_notes,
    }));

    return apiResponse(result);
  } catch (e) {
    console.error('[admin/apps] Unexpected error:', e);
    return apiResponse<AppSubmissionDTO[]>([]);
  }
}
