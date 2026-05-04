import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('lead_magnets')
      .select('id, title, type, status, downloads, url')
      .eq('tenant_id', tid);

    if (error) {
      console.error('[LeadMagnets] Failed to fetch magnets:', error.message);
      return apiResponse([]);
    }

    const result = (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      type: row.type,
      status: row.status,
      downloads: row.downloads,
      url: row.url,
    }));

    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load lead magnets');
  }
}
