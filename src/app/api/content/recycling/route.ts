import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    // Fetch recycling records joined with original and new post details
    const { data, error } = await supabase
      .from('content_recycling')
      .select(`
        id,
        original_post_id,
        new_post_id,
        new_format,
        recycled_at,
        created_at
      `)
      .eq('tenant_id', tenantId)
      .order('recycled_at', { ascending: false });

    if (error) {
      console.error('[content/recycling] DB error:', error.message);
      return apiResponse({ candidates: [], history: [] });
    }

    const rows = data ?? [];

    // Map recycling rows to RecyclingCandidateDTO shape
    const mapped = rows.map((row: Record<string, unknown>) => ({
      id: row.id,
      originalPostId: row.original_post_id,
      newPostId: row.new_post_id,
      newFormat: row.new_format,
      recycledAt: row.recycled_at,
      createdAt: row.created_at,
    }));

    // Candidates are pending (future recycling), history is already recycled
    // Since recycled_at indicates when it was recycled, all rows with recycled_at in the past are history
    const now = new Date().toISOString();
    const candidates = mapped.filter((r: Record<string, unknown>) => r.recycledAt && String(r.recycledAt) > now);
    const history = mapped.filter((r: Record<string, unknown>) => !r.recycledAt || String(r.recycledAt) <= now);

    return apiResponse({ candidates, history });
  } catch (e) {
    console.error('[content/recycling] Unexpected error:', e);
    return apiResponse({ candidates: [], history: [] });
  }
}
