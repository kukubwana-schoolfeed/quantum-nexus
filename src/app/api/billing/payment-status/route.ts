import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    // Fetch latest paid invoice for this tenant
    const { data: invoices, error: invError } = await supabase
      .from('invoices')
      .select('paid_at, due_date')
      .eq('tenant_id', tenantId)
      .eq('status', 'paid')
      .order('paid_at', { ascending: false })
      .limit(1);

    if (invError) {
      console.error('[payment-status] Invoice query error:', invError.message);
    }

    // Fetch tenant billing status
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('status')
      .eq('id', tenantId)
      .maybeSingle();

    if (tenantError) {
      console.error('[payment-status] Tenant query error:', tenantError.message);
    }

    // Determine next due date: look for the next unpaid invoice
    const { data: nextInvoice, error: nextError } = await supabase
      .from('invoices')
      .select('due_date')
      .eq('tenant_id', tenantId)
      .eq('status', 'unpaid')
      .order('due_date', { ascending: true })
      .limit(1);

    if (nextError) {
      console.error('[payment-status] Next invoice query error:', nextError.message);
    }

    const lastPaid = invoices && invoices.length > 0 ? invoices[0] : null;
    const result = {
      status: tenant?.status ?? 'active',
      lastPaymentDate: lastPaid?.paid_at ?? null,
      nextDueDate: nextInvoice && nextInvoice.length > 0 ? nextInvoice[0].due_date : null,
    };

    return apiResponse(result);
  } catch (e) {
    console.error('[payment-status] Unexpected error:', e);
    return apiResponse({
      status: 'active',
      lastPaymentDate: null,
      nextDueDate: null,
    });
  }
}
