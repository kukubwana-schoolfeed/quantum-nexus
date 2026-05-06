import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('connected_platforms')
      .select('platform, connected, token_expires_at, updated_at')
      .eq('tenant_id', tid);

    if (error) {
      console.error('[OAuth Connections] Failed to fetch:', error.message);
      return apiResponse([]);
    }

    return apiResponse(data ?? []);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load connections');
  }
}
