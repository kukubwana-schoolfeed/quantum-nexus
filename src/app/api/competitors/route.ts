import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('competitors')
      .select('domain, domain_authority, indexed_pages, backlinks')
      .eq('tenant_id', tenantId)
      .order('domain_authority', { ascending: false });

    if (error) {
      console.error('[competitors] DB error:', error.message);
      return apiResponse([]);
    }

    const result = (data ?? []).map((row: Record<string, unknown>) => ({
      domain: row.domain,
      domainAuthority: row.domain_authority,
      indexedPages: row.indexed_pages,
      backlinks: row.backlinks,
    }));

    return apiResponse(result);
  } catch (e) {
    console.error('[competitors] Unexpected error:', e);
    return apiResponse([]);
  }
}
