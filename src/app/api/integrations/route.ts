import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('encrypted_keys')
      .select('id, key_name, encrypted_value, expires_at')
      .eq('tenant_id', tid);

    if (error) {
      console.error('[Integrations] Failed to fetch keys:', error.message);
      return apiResponse([]);
    }

    const result = (data ?? []).map((row) => ({
      id: row.id,
      keyName: row.key_name,
      isConnected: !!row.encrypted_value,
      expiresAt: row.expires_at,
    }));

    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load integrations');
  }
}
