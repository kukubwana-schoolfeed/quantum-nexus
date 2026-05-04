import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('ugc_videos')
      .select('id, file_name, file_size, duration_seconds, status, uploaded_at, r2_url, transcript')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('[UGC Videos] Query error:', error.message);
      return apiResponse([]);
    }

    const result = (data ?? []).map(row => ({
      id: row.id,
      fileName: row.file_name,
      fileSize: Number(row.file_size),
      durationSeconds: row.duration_seconds,
      status: row.status,
      uploadedAt: row.uploaded_at,
      r2Url: row.r2_url,
      transcript: row.transcript,
    }));

    return apiResponse(result);
  } catch (e) {
    console.error('[UGC Videos] Unexpected error:', e);
    return apiResponse([]);
  }
}
