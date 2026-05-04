import { NextRequest } from 'next/server';
import { apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tenantId = body.tenantId;

    if (!tenantId || typeof tenantId !== 'string') {
      return apiError('tenantId is required', 400);
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from('tenants')
      .update({ status: 'active', activated_at: new Date().toISOString() })
      .eq('id', tenantId);

    if (error) {
      console.error('[admin/approve] DB error:', error.message);
      return apiError('Failed to approve tenant');
    }

    return apiResponse({ success: true });
  } catch (e) {
    console.error('[admin/approve] Unexpected error:', e);
    return apiError(e instanceof Error ? e.message : 'Failed to approve tenant');
  }
}
