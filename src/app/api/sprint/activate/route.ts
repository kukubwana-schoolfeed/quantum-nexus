import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function POST(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    // Set sprint_mode_active=true and sprint_mode_ends_at to 30 days from now
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + 30);
    const endsAtISO = endsAt.toISOString();

    const { error } = await supabase
      .from('tenants')
      .update({
        sprint_mode_active: true,
        sprint_mode_ends_at: endsAtISO,
      })
      .eq('id', tenantId);

    if (error) {
      console.error('[sprint/activate] DB error:', error.message);
      return apiError('Failed to activate sprint mode');
    }

    return apiResponse({ success: true, message: 'Sprint mode activated', endsAt: endsAtISO });
  } catch (e) {
    console.error('[sprint/activate] Unexpected error:', e);
    return apiError(e instanceof Error ? e.message : 'Failed to activate sprint mode');
  }
}
