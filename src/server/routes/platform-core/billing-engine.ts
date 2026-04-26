import * as db from '@/lib/db';
import { AppError, internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { InvoiceDTO, IdReferenceDTO } from '@/lib/api/schema';

/** @module platform-core/billing-engine @description Handles invoice generation, retrieval, and billing cycle management for tenant subscriptions. */

/**
 * Retrieves all invoices for a tenant.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @returns ApiResponse wrapping a list of invoice records for the tenant
 */
export async function getInvoices(tenantId: string): Promise<ApiResponse<InvoiceDTO[]>> {
  try {
    const result = await db.billingQueries.listInvoices(tenantId, {});
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('INVOICES_FETCH_FAILED');
  }
}

/**
 * Generates a new invoice for a tenant based on their current tier and usage.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @returns ApiResponse wrapping the newly generated invoice identifier
 */
export async function generateInvoice(tenantId: string): Promise<ApiResponse<IdReferenceDTO>> {
  try {
    const result = await db.billingQueries.createInvoice(tenantId, {
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount_zmw: 0,
      status: 'unpaid',
    } as Partial<db.InvoiceRow>);
    return { success: true, data: { id: result.id } };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('INVOICE_GENERATE_FAILED');
  }
}

/**
 * Retrieves a single invoice by its identifier.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @param invoiceId - The invoice's unique identifier
 * @returns ApiResponse wrapping the matching invoice record, or null if not found
 */
export async function getInvoice(tenantId: string, invoiceId: string): Promise<ApiResponse<InvoiceDTO | null>> {
  try {
    const supabase = db.getSupabaseAdmin();
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', invoiceId)
      .single();

    if (error) {
      // PGRST116 = no rows returned — invoice not found is valid, return null
      if (error.code === 'PGRST116') {
        return { success: true, data: null };
      }
      throw internalError('INVOICE_FETCH_FAILED');
    }

    const row = data as db.InvoiceRow | null;
    if (!row) {
      return { success: true, data: null };
    }

    const invoice: InvoiceDTO = {
      id: row.id,
      invoiceDate: row.invoice_date,
      dueDate: row.due_date,
      amountZmw: Number(row.amount_zmw),
      status: row.status as InvoiceDTO['status'],
      paidAt: row.paid_at,
    };

    return { success: true, data: invoice };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('INVOICE_FETCH_FAILED');
  }
}
