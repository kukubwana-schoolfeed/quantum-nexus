import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    // Fetch the latest business_audit for this tenant
    const { data: audit, error: auditError } = await supabase
      .from('business_audits')
      .select('domain_authority, total_indexed_pages, backlink_count')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (auditError) {
      console.error('[seo-domination] Audit query error:', auditError.message);
    }

    const overview = {
      domainAuthority: audit?.domain_authority ?? 0,
      indexedPages: audit?.total_indexed_pages ?? 0,
      backlinks: audit?.backlink_count ?? 0,
    };

    return apiResponse(overview);
  } catch (e) {
    console.error('[seo-domination] Unexpected error:', e);
    return apiResponse({ domainAuthority: 0, indexedPages: 0, backlinks: 0 });
  }
}
