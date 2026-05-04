import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    // Fetch onboarding steps for this tenant
    const { data: stepsData, error: stepsError } = await supabase
      .from('onboarding_steps')
      .select('id, step, label, status')
      .eq('tenant_id', tid)
      .order('created_at', { ascending: true });

    if (stepsError) {
      console.error('[Onboarding] Failed to fetch steps:', stepsError.message);
    }

    const steps = (stepsData ?? []).map((row) => ({
      id: row.id,
      step: row.step,
      label: row.label,
      status: row.status,
    }));

    // Fetch completeness score and unlocks from tenants table
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('completeness_score, content_generation_unlocked, publishing_unlocked, analytics_unlocked')
      .eq('id', tid)
      .maybeSingle();

    if (tenantError) {
      console.error('[Onboarding] Failed to fetch tenant:', tenantError.message);
    }

    const score = {
      completenessScore: tenantData?.completeness_score ?? 0,
      contentGenerationUnlocked: tenantData?.content_generation_unlocked ?? false,
      publishingUnlocked: tenantData?.publishing_unlocked ?? false,
      analyticsUnlocked: tenantData?.analytics_unlocked ?? false,
    };

    return apiResponse({ state: steps, score });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load onboarding data');
  }
}
