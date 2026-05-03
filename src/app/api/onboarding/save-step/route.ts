import { NextRequest } from 'next/server';
import { apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import { getSessionClaims } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const claims = await getSessionClaims(req);
    const userId = claims.sub;
    const body = await req.json();
    const { step, data } = body as { step: string; data: Record<string, unknown> };
    if (!step || !data) {
      return apiError('Missing required fields: step, data', 400);
    }
    const supabase = getSupabaseAdminClient();
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (step === 'business_info') {
      updateData['business_name'] = data.businessName;
      updateData['business_type'] = data.businessType;
      updateData['location'] = data.location;
      updateData['phone'] = data.phone;
      updateData['email'] = data.email;
      updateData['website'] = data.website;
    } else if (step === 'niche_selection') {
      updateData['niche_id'] = data.nicheId;
      updateData['custom_niche_name'] = data.customNicheName;
      updateData['custom_niche_description'] = data.customNicheDescription;
    } else if (step === 'brand_voice') {
      updateData['brand_tone'] = data.brandTone;
      updateData['brand_values'] = data.brandValues;
      updateData['brand_description'] = data.brandDescription;
      updateData['target_audience'] = data.targetAudience;
      updateData['competitors'] = data.competitors;
      updateData['usp'] = data.usp;
    } else if (step === 'services_pricing') {
      updateData['services'] = data.services;
      updateData['pricing_model'] = data.pricingModel;
    } else if (step === 'platforms') {
      updateData['platforms'] = data.platforms;
    }
    const { error } = await supabase
      .from('onboarding_sessions')
      .upsert({ user_id: userId, ...updateData }, { onConflict: 'user_id' });
    if (error) throw new Error(error.message);
    return apiResponse({ success: true });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to save onboarding step');
  }
}