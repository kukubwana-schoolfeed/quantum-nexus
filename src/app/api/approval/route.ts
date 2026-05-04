import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('approval_queue_items')
      .select('id, content_type, platform, status, created_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[approval] DB error:', error.message);
      return apiResponse([]);
    }

    const result = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id,
      contentType: row.content_type,
      platform: row.platform,
      status: row.status,
      createdAt: row.created_at,
    }));

    return apiResponse(result);
  } catch (e) {
    console.error('[approval] Unexpected error:', e);
    return apiResponse([]);
  }
}
