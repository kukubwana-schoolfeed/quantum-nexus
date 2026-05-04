import { NextRequest } from 'next/server';
import { getTenantId, apiResponse } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { SupportTicketDTO } from '@/lib/api/schema';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('support_tickets')
      .select('id, app_id, user_email, subject, status, created_at')
      .eq('tenant_id', tid);

    if (error) throw error;

    const tickets: SupportTicketDTO[] = (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      appId: r.app_id as string,
      userEmail: r.user_email as string,
      subject: r.subject as string,
      status: r.status as SupportTicketDTO['status'],
      createdAt: r.created_at as string,
    }));

    return apiResponse(tickets);
  } catch {
    return apiResponse([] as SupportTicketDTO[]);
  }
}
