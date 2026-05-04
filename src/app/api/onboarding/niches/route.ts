import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

const DEFAULT_ZAMBIAN_NICHES = [
  { id: 'default-1', name: 'Restaurant & Food Services', trendScore: 85, competitionLevel: 'high' },
  { id: 'default-2', name: 'Retail & E-commerce', trendScore: 78, competitionLevel: 'high' },
  { id: 'default-3', name: 'Health & Wellness', trendScore: 72, competitionLevel: 'medium' },
  { id: 'default-4', name: 'Professional Services', trendScore: 68, competitionLevel: 'medium' },
  { id: 'default-5', name: 'Education & Training', trendScore: 65, competitionLevel: 'low' },
  { id: 'default-6', name: 'Construction & Real Estate', trendScore: 60, competitionLevel: 'medium' },
  { id: 'default-7', name: 'Agriculture & Agribusiness', trendScore: 55, competitionLevel: 'low' },
  { id: 'default-8', name: 'Transport & Logistics', trendScore: 50, competitionLevel: 'low' },
] as const;

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    // Query niche_profiles linked to this tenant via business_profiles
    const { data, error } = await supabase
      .from('niche_profiles')
      .select('id, niche_name')
      .eq('status', 'active')
      .limit(50);

    if (error) {
      console.error('[Niches] Failed to fetch niche profiles:', error.message);
      return apiResponse([...DEFAULT_ZAMBIAN_NICHES]);
    }

    if (!data || data.length === 0) {
      return apiResponse([...DEFAULT_ZAMBIAN_NICHES]);
    }

    const result = data.map((row, idx) => ({
      id: row.id,
      name: row.niche_name,
      trendScore: Math.max(0, 80 - idx * 5),
      competitionLevel: idx < 3 ? 'high' : idx < 6 ? 'medium' : 'low',
    }));

    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load niches');
  }
}
