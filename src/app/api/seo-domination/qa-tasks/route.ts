import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('seo_tasks')
      .select('id, platform, question_text, answer_text, status, question_posted_at')
      .eq('tenant_id', tenantId)
      .eq('task_type', 'qa_seed');

    if (error) {
      console.error('[seo-domination/qa-tasks] DB error:', error.message);
      return apiResponse([]);
    }

    const tasks = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id,
      platform: row.platform,
      questionText: row.question_text,
      answerText: row.answer_text,
      status: row.status,
      questionPostedAt: row.question_posted_at,
    }));

    return apiResponse(tasks);
  } catch (e) {
    console.error('[seo-domination/qa-tasks] Unexpected error:', e);
    return apiResponse([]);
  }
}
