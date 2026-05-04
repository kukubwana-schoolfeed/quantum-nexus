import { NextRequest } from 'next/server';
import { getTenantId, apiResponse } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { GeneratedDescriptionDTO, ReleaseNotesDTO, ScreenshotGenerationDTO } from '@/lib/api/schema';

const emptyDescription: GeneratedDescriptionDTO = { content: '' };
const emptyReleaseNotes: ReleaseNotesDTO = { content: '', version: '' };
const emptyScreenshots: ScreenshotGenerationDTO = { urls: [] };

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('apps')
      .select('id, name')
      .eq('tenant_id', tid)
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const description: GeneratedDescriptionDTO = data
      ? { content: data.name }
      : emptyDescription;

    return apiResponse({
      releaseNotes: emptyReleaseNotes,
      description,
      screenshots: emptyScreenshots,
    });
  } catch {
    return apiResponse({
      releaseNotes: emptyReleaseNotes,
      description: emptyDescription,
      screenshots: emptyScreenshots,
    });
  }
}
