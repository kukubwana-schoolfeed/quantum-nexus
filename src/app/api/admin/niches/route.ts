import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { NicheReviewDTO } from '@/lib/api/schema';

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('niche_profiles')
      .select('id, niche_name, created_at, status');

    if (error) {
      console.error('[admin/niches] DB error:', error.message);
      return apiResponse<NicheReviewDTO[]>([]);
    }

    const result: NicheReviewDTO[] = (data ?? []).map((row) => ({
      id: row.id,
      nicheName: row.niche_name,
      submittedAt: row.created_at,
      status: row.status,
    }));

    return apiResponse(result);
  } catch (e) {
    console.error('[admin/niches] Unexpected error:', e);
    return apiResponse<NicheReviewDTO[]>([]);
  }
}
