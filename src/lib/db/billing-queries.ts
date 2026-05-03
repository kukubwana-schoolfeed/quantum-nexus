/**
 * @module billing-queries
 * @description Typed Supabase query module for billing, invoicing,
 * and encrypted API key management. All tenant-scoped queries include
 * an `.eq('tenant_id', tenantId)` filter.
 */

import { getSupabaseAdmin } from '@/lib/db/client';
import type { InvoiceRow, EncryptedKeyRow } from '@/lib/db/types';
import type {
  InvoiceDTO,
  PaymentStatusDTO,
  ApiKeyDTO,
  TierDTO,
  ActionConfirmationDTO,
} from '@/lib/api/schema';

/**
 * Lists invoices for a tenant, optionally filtered by status.
 * Results are ordered by invoice date descending.
 *
 * @param tenantId - The tenant identifier to scope the query.
 * @param params - Optional filters (e.g. `{ status: 'paid' }`).
 * @returns An array of `InvoiceDTO` objects.
 * @throws If the Supabase query returns an error.
 */
export async function listInvoices(
  tenantId: string,
  params?: Record<string, unknown>,
): Promise<InvoiceDTO[]> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('invoices')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('invoice_date', { ascending: false });

  if (params?.status) {
    query = query.eq('status', params.status as string);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows: InvoiceRow[] = data ?? [];

  return rows.map((row) => ({
    id: row.id,
    invoiceDate: row.invoice_date,
    dueDate: row.due_date,
    amountZmw: Number(row.amount_zmw),
    status: row.status,
    paidAt: row.paid_at,
  }));
}

/**
 * Retrieves the most recent invoice for a tenant.
 *
 * @param tenantId - The tenant identifier to scope the query.
 * @returns The latest `InvoiceRow` or `null` if none exist.
 * @throws If the Supabase query returns an error.
 */
export async function getLatestInvoice(
  tenantId: string,
): Promise<InvoiceRow | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('invoice_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Computes the payment status for a tenant, including last payment
 * date and next due date derived from invoice history.
 *
 * @param tenantId - The tenant identifier to scope the query.
 * @returns A `PaymentStatusDTO` describing the tenant's payment standing.
 * @throws If the Supabase query returns an error.
 */
export async function getPaymentStatus(
  tenantId: string,
): Promise<PaymentStatusDTO> {
  const supabase = getSupabaseAdmin();

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('status')
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (tenantError) {
    throw tenantError;
  }

  const validStatuses = ['current', 'grace_period', 'overdue', 'suspended'] as const;
  const rawStatus = tenant?.status ?? 'current';
  const status: PaymentStatusDTO['status'] = validStatuses.includes(rawStatus as typeof validStatuses[number])
    ? (rawStatus as PaymentStatusDTO['status'])
    : 'current';

  const { data: paidInvoice, error: paidError } = await supabase
    .from('invoices')
    .select('paid_at')
    .eq('tenant_id', tenantId)
    .eq('status', 'paid')
    .order('paid_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paidError) {
    throw paidError;
  }

  const lastPaymentDate = paidInvoice?.paid_at ?? null;

  const { data: latestInvoice, error: latestError } = await supabase
    .from('invoices')
    .select('due_date')
    .eq('tenant_id', tenantId)
    .order('invoice_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) {
    throw latestError;
  }

  const nextDueDate = latestInvoice?.due_date ?? null;

  return {
    status,
    lastPaymentDate,
    nextDueDate,
  };
}

/**
 * Lists encrypted API keys for a tenant.
 *
 * @param tenantId - The tenant identifier to scope the query.
 * @returns An array of `ApiKeyDTO` objects.
 * @throws If the Supabase query returns an error.
 */
export async function listApiKeys(
  tenantId: string,
): Promise<ApiKeyDTO[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('encrypted_keys')
    .select('*')
    .eq('tenant_id', tenantId);

  if (error) {
    throw error;
  }

  const rows: EncryptedKeyRow[] = data ?? [];

  return rows.map((row) => ({
    id: row.id,
    keyName: row.key_name,
    isConnected: !!row.encrypted_value,
    expiresAt: row.expires_at,
  }));
}

/**
 * Retrieves a specific encrypted key by name for a tenant.
 *
 * @param tenantId - The tenant identifier to scope the query.
 * @param keyName - The name of the key to retrieve.
 * @returns The `EncryptedKeyRow` or `null` if not found.
 * @throws If the Supabase query returns an error.
 */
export async function getEncryptedKey(
  tenantId: string,
  keyName: string,
): Promise<EncryptedKeyRow | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('encrypted_keys')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('key_name', keyName)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Upserts an encrypted key for a tenant.
 * On conflict of (tenant_id, key_name), the existing row is updated.
 *
 * @param tenantId - The tenant identifier to associate with the key.
 * @param keyName - The name of the key.
 * @param encryptedValue - The encrypted key value.
 * @param iv - The initialization vector used during encryption.
 * @param authTag - The authentication tag from encryption.
 * @param expiresAt - Optional expiration timestamp.
 * @returns The upserted `EncryptedKeyRow`.
 * @throws If the Supabase query returns an error.
 */
export async function upsertEncryptedKey(
  tenantId: string,
  keyName: string,
  encryptedValue: string,
  iv: string,
  authTag: string,
  expiresAt?: string,
): Promise<EncryptedKeyRow> {
  const supabase = getSupabaseAdmin();

  const payload: Record<string, unknown> = {
    tenant_id: tenantId,
    key_name: keyName,
    encrypted_value: encryptedValue,
    iv,
    auth_tag: authTag,
  };

  if (expiresAt !== undefined) {
    payload.expires_at = expiresAt;
  }

  const { data, error } = await supabase
    .from('encrypted_keys')
    .upsert(payload, { onConflict: 'tenant_id,key_name' })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Deletes an encrypted key for a tenant by name.
 *
 * @param tenantId - The tenant identifier to scope the deletion.
 * @param keyName - The name of the key to delete.
 * @returns An `ActionConfirmationDTO` confirming deletion.
 * @throws If the Supabase query returns an error.
 */
export async function deleteEncryptedKey(
  tenantId: string,
  keyName: string,
): Promise<ActionConfirmationDTO> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('encrypted_keys')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('key_name', keyName);

  if (error) {
    throw error;
  }

  return { success: true };
}

/**
 * Creates a new invoice for a tenant.
 *
 * @param tenantId - The tenant identifier to associate with the invoice.
 * @param data - Partial invoice data to insert.
 * @returns The created `InvoiceRow`.
 * @throws If the Supabase query returns an error.
 */
export async function createInvoice(
  tenantId: string,
  data: Partial<InvoiceRow>,
): Promise<InvoiceRow> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('invoices')
    .insert({
      ...data,
      tenant_id: tenantId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return row;
}
