import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function POST(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { error } = await supabase
      .from('tenants')
      .update({ sprint_mode_active: false })
      .eq('id', tenantId);

    if (error) {
      console.error('[sprint/deactivate] DB error:', error.message);
      return apiError('Failed to deactivate sprint mode');
    }

    return apiResponse({ success: true, message: 'Sprint mode deactivated' });
  } catch (e) {
    console.error('[sprint/deactivate] Unexpected error:', e);
    return apiError(e instanceof Error ? e.message : 'Failed to deactivate sprint mode');
  }
}
