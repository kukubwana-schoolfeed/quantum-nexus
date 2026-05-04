import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { VoiceJobDTO, FacelessCharacterDTO } from '@/lib/api/schema';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const [voiceResult, charResult] = await Promise.all([
      supabase
        .from('voice_jobs')
        .select('id, character_id, provider, voice_id, sample_url, status')
        .eq('tenant_id', tenantId),
      supabase
        .from('faceless_characters')
        .select('id, name, personality, voice_id, avatar_style, backstory, is_active')
        .eq('tenant_id', tenantId),
    ]);

    if (voiceResult.error) throw voiceResult.error;
    if (charResult.error) throw charResult.error;

    const voices: VoiceJobDTO[] = (voiceResult.data ?? []).map((row) => ({
      id: row.id,
      characterId: row.character_id,
      provider: row.provider,
      voiceId: row.voice_id,
      sampleUrl: row.sample_url ?? null,
      status: row.status,
    }));

    const characters: FacelessCharacterDTO[] = (charResult.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      personality: row.personality,
      voiceId: row.voice_id,
      avatarStyle: row.avatar_style,
      backstory: row.backstory ?? null,
      isActive: row.is_active,
    }));

    return apiResponse({ voices, characters });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load voices');
  }
}
