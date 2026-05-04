import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { SceneDTO } from '@/lib/api/schema';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('scenes')
      .select('id, outline_id, scene_number, description, visual_style, duration_seconds, script_text')
      .eq('tenant_id', tenantId);

    if (error) throw error;

    const result: SceneDTO[] = (data ?? []).map((row) => ({
      id: row.id,
      outlineId: row.outline_id,
      sceneNumber: row.scene_number,
      description: row.description,
      visualStyle: row.visual_style,
      durationSeconds: row.duration_seconds,
      scriptText: row.script_text,
    }));

    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load scenes');
  }
}
