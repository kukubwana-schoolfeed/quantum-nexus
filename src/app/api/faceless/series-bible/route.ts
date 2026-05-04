import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { SeriesBibleDTO } from '@/lib/api/schema';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('series_bibles')
      .select('id, storyline_id, world_rules, recurring_themes, tone_notes, character_arcs')
      .eq('tenant_id', tenantId);

    if (error) throw error;

    const result: SeriesBibleDTO[] = (data ?? []).map((row) => ({
      id: row.id,
      storylineId: row.storyline_id,
      worldRules: row.world_rules,
      recurringThemes: row.recurring_themes ?? [],
      toneNotes: row.tone_notes,
      characterArcs: row.character_arcs ?? null,
    }));

    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load series bible');
  }
}
