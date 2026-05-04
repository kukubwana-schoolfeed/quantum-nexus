import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    // Fetch business profile for the tenant
    const { data: profileRow, error: profileError } = await supabase
      .from('business_profiles')
      .select('niche')
      .eq('tenant_id', tid)
      .maybeSingle();

    if (profileError) {
      console.error('[GBP] Failed to fetch business profile:', profileError.message);
    }

    // Also fetch business_name from tenants table as fallback for name
    const { data: tenantRow, error: tenantError } = await supabase
      .from('tenants')
      .select('business_name')
      .eq('id', tid)
      .maybeSingle();

    if (tenantError) {
      console.error('[GBP] Failed to fetch tenant:', tenantError.message);
    }

    const profile = {
      name: profileRow?.niche || tenantRow?.business_name || '',
      category: profileRow?.niche || '',
      rating: 0,
      reviewCount: 0,
    };

    // No insights table exists yet — return zeroed values
    const insights = {
      views: 0,
      searches: 0,
      directionRequests: 0,
    };

    return apiResponse({ profile, insights });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load GBP data');
  }
}
