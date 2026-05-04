import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { PendingAccountDTO } from '@/lib/api/schema';

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('tenants')
      .select('id, business_name, created_at, tier')
      .eq('status', 'pending_approval');

    if (error) {
      console.error('[admin/approvals] DB error:', error.message);
      return apiResponse<PendingAccountDTO[]>([]);
    }

    const result: PendingAccountDTO[] = (data ?? []).map((row) => ({
      id: row.id,
      businessName: row.business_name,
      submittedAt: row.created_at,
      tier: row.tier,
    }));

    return apiResponse(result);
  } catch (e) {
    console.error('[admin/approvals] Unexpected error:', e);
    return apiResponse<PendingAccountDTO[]>([]);
  }
}
