import { NextRequest } from 'next/server';
import { getTenantId, apiResponse } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { ASOScoreDTO, AppListingDTO } from '@/lib/api/schema';

const zeroedASO: ASOScoreDTO = { score: 0, suggestions: [] };

const emptyListing: AppListingDTO = {
  title: '',
  description: '',
  keywords: [],
  screenshots: [],
};

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('apps')
      .select('id, name, category')
      .eq('tenant_id', tid)
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const listing: AppListingDTO = data
      ? { title: data.name, description: '', keywords: [], screenshots: [] }
      : emptyListing;

    return apiResponse({ listing, asoScore: zeroedASO });
  } catch {
    return apiResponse({ listing: emptyListing, asoScore: zeroedASO });
  }
}
