import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('knowledge_base')
      .select('id, title, content, category, source, is_active')
      .eq('tenant_id', tid);

    if (error) {
      console.error('[Knowledge] Failed to fetch entries:', error.message);
      return apiResponse([]);
    }

    const result = (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      source: row.source,
      isActive: row.is_active,
    }));

    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load knowledge base');
  }
}
