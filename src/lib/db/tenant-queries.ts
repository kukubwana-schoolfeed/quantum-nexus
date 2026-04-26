/**
 * Tenant Query Module
 * @module db/tenant-queries
 * @description Typed Supabase query functions for the tenants, platform_users,
 * and resellers tables. Every tenant-scoped query enforces .eq('tenant_id', tenantId)
 * at the application layer. Uses the service role Supabase client which bypasses RLS.
 */

import { getSupabaseAdmin } from '@/lib/db/client';
import type { TenantRow, PlatformUserRow, ResellerRow } from '@/lib/db/types';
import type {
  TenantSummaryDTO,
  TenantDetailsDTO,
  PlatformStatsDTO,
  ActionConfirmationDTO,
} from '@/lib/api/schema';

// ─── Tenant queries ──────────────────────────────────────────────────

/**
 * Fetch a single tenant row by its primary key.
 *
 * @param tenantId - The tenant's UUID
 * @returns The full TenantRow, or null when not found
 */
export async function getTenantById(
  tenantId: string,
): Promise<TenantRow | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch a single tenant row by its URL slug.
 *
 * @param slug - The unique slug assigned to the tenant
 * @returns The full TenantRow, or null when not found
 */
export async function getTenantBySlug(
  slug: string,
): Promise<TenantRow | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Partial-update a tenant row by its primary key.
 *
 * @param tenantId - The tenant's UUID
 * @param data - A subset of TenantRow fields to update
 * @returns The updated TenantRow
 */
export async function updateTenant(
  tenantId: string,
  data: Partial<TenantRow>,
): Promise<TenantRow> {
  const supabase = getSupabaseAdmin();

  const { data: updated, error } = await supabase
    .from('tenants')
    .update(data)
    .eq('id', tenantId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return updated;
}

/**
 * List tenants filtered by status, with pagination.
 *
 * @param status - The tenant status value to filter on
 * @param page   - 1-based page number
 * @param pageSize - Number of rows per page
 * @returns An object containing the page of TenantRow[] and the exact total count
 */
export async function listTenantsByStatus(
  status: string,
  page: number,
  pageSize: number,
): Promise<{ data: TenantRow[]; total: number }> {
  const supabase = getSupabaseAdmin();
  const offset = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from('tenants')
    .select('*', { count: 'exact' })
    .eq('status', status)
    .range(offset, offset + pageSize - 1);

  if (error) throw new Error(error.message);
  return { data: data ?? [], total: count ?? 0 };
}

/**
 * List tenants with optional dynamic filters.
 *
 * Accepted keys in `params`:
 * - `status`   — exact match on tenant status
 * - `tier`     — exact match on tenant tier
 * - `search`   — case-insensitive LIKE on business_name
 * - `page`     — 1-based page number (default 1)
 * - `pageSize` — rows per page (default 50)
 *
 * Filters are only applied when present in the params object.
 *
 * @param params - A record of optional filter criteria
 * @returns An array of matching TenantRow objects
 */
export async function listTenants(
  params: Record<string, unknown>,
): Promise<TenantRow[]> {
  const supabase = getSupabaseAdmin();

  const status = params.status as string | undefined;
  const tier = params.tier as string | undefined;
  const search = params.search as string | undefined;
  const page = (params.page as number) ?? 1;
  const pageSize = (params.pageSize as number) ?? 50;
  const offset = (page - 1) * pageSize;

  let query = supabase.from('tenants').select('*');

  if (status) query = query.eq('status', status);
  if (tier) query = query.eq('tier', tier);
  if (search) query = query.ilike('business_name', `%${search}%`);

  query = query.range(offset, offset + pageSize - 1);

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Compute platform-wide statistics across all tenants.
 *
 * Queries tenants for total and active counts, and invoices for revenue
 * and month-over-month growth.
 *
 * @returns A PlatformStatsDTO with totalTenants, activeTenants, totalRevenue, and monthlyGrowth
 */
export async function getPlatformStats(): Promise<PlatformStatsDTO> {
  const supabase = getSupabaseAdmin();

  const { data: tenantRows, error: tenantError } = await supabase
    .from('tenants')
    .select('status', { count: 'exact' });

  if (tenantError) throw new Error(tenantError.message);

  const { data: invoiceRows, error: invoiceError } = await supabase
    .from('invoices')
    .select('amount_zmw');

  if (invoiceError) throw new Error(invoiceError.message);

  const totalTenants = tenantRows?.length ?? 0;
  const activeTenants =
    tenantRows?.filter((r) => r.status === 'active').length ?? 0;
  const totalRevenue =
    invoiceRows?.reduce((sum, r) => sum + (r.amount_zmw ?? 0), 0) ?? 0;

  // Monthly growth: compare current calendar month invoices vs previous month.
  const now = new Date();
  const thisMonth = now.getFullYear() * 100 + (now.getMonth() + 1);
  const prevMonth =
    now.getMonth() === 0
      ? (now.getFullYear() - 1) * 100 + 12
      : now.getFullYear() * 100 + now.getMonth();

  // Re-fetch invoices with created_at to bucket by month
  const { data: datedInvoices, error: datedError } = await supabase
    .from('invoices')
    .select('amount_zmw, created_at');

  if (datedError) throw new Error(datedError.message);

  let thisMonthRevenue = 0;
  let prevMonthRevenue = 0;

  for (const inv of datedInvoices ?? []) {
    const d = new Date(inv.created_at);
    const ym = d.getFullYear() * 100 + (d.getMonth() + 1);
    if (ym === thisMonth) thisMonthRevenue += inv.amount_zmw ?? 0;
    else if (ym === prevMonth) prevMonthRevenue += inv.amount_zmw ?? 0;
  }

  const monthlyGrowth =
    prevMonthRevenue === 0
      ? 0
      : ((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;

  return {
    totalTenants,
    activeTenants,
    totalRevenue,
    monthlyGrowth,
  };
}

/**
 * Suspend a tenant by setting status to 'suspended', recording the
 * suspension timestamp, and storing the reason in admin_notes.
 *
 * @param tenantId - The tenant's UUID
 * @param reason  - The justification for the suspension
 * @returns An ActionConfirmationDTO indicating success
 */
export async function suspendTenant(
  tenantId: string,
  reason: string,
): Promise<ActionConfirmationDTO> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('tenants')
    .update({
      status: 'suspended',
      suspended_at: new Date().toISOString(),
      admin_notes: reason,
    })
    .eq('id', tenantId);

  if (error) throw new Error(error.message);
  return { success: true, message: 'Tenant suspended' };
}

/**
 * Reactivate a suspended tenant by restoring status to 'active'
 * and clearing the suspended_at timestamp.
 *
 * @param tenantId - The tenant's UUID
 * @returns An ActionConfirmationDTO indicating success
 */
export async function reactivateTenant(
  tenantId: string,
): Promise<ActionConfirmationDTO> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('tenants')
    .update({
      status: 'active',
      suspended_at: null,
    })
    .eq('id', tenantId);

  if (error) throw new Error(error.message);
  return { success: true, message: 'Tenant reactivated' };
}

// ─── Platform user queries ────────────────────────────────────────────

/**
 * Fetch a single platform user by their primary key.
 *
 * @param userId - The platform_users row UUID
 * @returns The full PlatformUserRow, or null when not found
 */
export async function getUserById(
  userId: string,
): Promise<PlatformUserRow | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('platform_users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch a single platform user by their Auth (Supabase Auth) user ID.
 *
 * @param authUserId - The Supabase Auth user UUID
 * @returns The full PlatformUserRow, or null when not found
 */
export async function getUserByAuthId(
  authUserId: string,
): Promise<PlatformUserRow | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('platform_users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─── Reseller queries ─────────────────────────────────────────────────

/**
 * Fetch a single reseller by their primary key.
 *
 * @param resellerId - The reseller row UUID
 * @returns The full ResellerRow, or null when not found
 */
export async function getResellerById(
  resellerId: string,
): Promise<ResellerRow | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('resellers')
    .select('*')
    .eq('id', resellerId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Partial-update a reseller's brand-related fields.
 *
 * @param resellerId - The reseller row UUID
 * @param data       - A subset of ResellerRow fields to update
 * @returns The updated ResellerRow
 */
export async function updateResellerBranding(
  resellerId: string,
  data: Partial<ResellerRow>,
): Promise<ResellerRow> {
  const supabase = getSupabaseAdmin();

  const { data: updated, error } = await supabase
    .from('resellers')
    .update(data)
    .eq('id', resellerId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return updated;
}
