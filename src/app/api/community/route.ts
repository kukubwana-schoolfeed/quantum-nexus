import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('community_posts')
      .select('id, author_id, content, likes_count, comments_count, created_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[community] DB error:', error.message);
      return apiResponse([]);
    }

    const result = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id,
      authorId: row.author_id,
      content: row.content,
      likesCount: row.likes_count,
      commentsCount: row.comments_count,
      createdAt: row.created_at,
    }));

    return apiResponse(result);
  } catch (e) {
    console.error('[community] Unexpected error:', e);
    return apiResponse([]);
  }
}
