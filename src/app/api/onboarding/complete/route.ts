import { NextRequest } from 'next/server';
import { apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import { getSessionClaims } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const claims = await getSessionClaims(req);
    const userId = claims.sub;
    const supabase = getSupabaseAdminClient();

    // Get staged onboarding data
    const { data: session, error: sessionError } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      return apiError('No onboarding session found. Please complete all steps first.');
    }

    if (!session.business_name) {
      return apiError('Business name is required.');
    }

    // Generate slug from business name
    const slug = session.business_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Math.random().toString(36).slice(2, 7);

    // Create tenant row
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        user_id: userId,
        business_name: session.business_name,
        slug,
        user_type: 'business',
        tier: 'basic',
        status: 'active',
        activated_at: new Date().toISOString(),
        sprint_mode_active: true,
        sprint_mode_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        completeness_score: 80,
        content_generation_unlocked: true,
        publishing_unlocked: true,
        analytics_unlocked: false,
      })
      .select('id')
      .single();

    if (tenantError) {
      // If tenant already exists for this user, just return success
      if (tenantError.code === '23505') {
        return apiResponse({ success: true, activated: true });
      }
      throw new Error(tenantError.message);
    }

    // Clean up staging data
    await supabase.from('onboarding_sessions').delete().eq('user_id', userId);

    return apiResponse({ success: true, activated: true, tenantId: tenant.id });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to complete onboarding');
  }
}