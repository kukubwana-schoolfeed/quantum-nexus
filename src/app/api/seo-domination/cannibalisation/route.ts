import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('cannibalisation_reports')
      .select('id, conflicting_keyword, strong_post_url, weak_post_url, recommended_action, status')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('[seo-domination/cannibalisation] DB error:', error.message);
      return apiResponse({ reports: [] });
    }

    const reports = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id,
      conflictingKeyword: row.conflicting_keyword,
      strongPostUrl: row.strong_post_url,
      weakPostUrl: row.weak_post_url,
      recommendedAction: row.recommended_action,
      status: row.status,
    }));

    return apiResponse({ reports });
  } catch (e) {
    console.error('[seo-domination/cannibalisation] Unexpected error:', e);
    return apiResponse({ reports: [] });
  }
}
