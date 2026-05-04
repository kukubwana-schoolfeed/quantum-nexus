import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('broadcasts')
      .select('id, type, subject, body, status, sent_at, scheduled_for, recipient_count')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[broadcasts] DB error:', error.message);
      return apiResponse([]);
    }

    const result = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id,
      type: row.type,
      subject: row.subject,
      body: row.body,
      status: row.status,
      sentAt: row.sent_at,
      scheduledFor: row.scheduled_for,
      recipientCount: row.recipient_count,
    }));

    return apiResponse(result);
  } catch (e) {
    console.error('[broadcasts] Unexpected error:', e);
    return apiResponse([]);
  }
}
