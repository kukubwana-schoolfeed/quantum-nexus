/**
 * @module admin-queries
 * @description Typed Supabase query module for admin-level operations
 * including dead job review, niche management, and tenant administration.
 * These queries operate at the platform level and may not require tenant
 * scoping on all operations.
 */

import { getSupabaseAdmin } from '@/lib/db/client';
import type { DeadJobRow, NicheProfileRow, TenantRow } from '@/lib/db/types';
import type {
  DeadJobDTO,
  NicheReviewDTO,
  TenantSummaryDTO,
  TenantDetailsDTO,
  PlatformStatsDTO,
  ActionConfirmationDTO,
} from '@/lib/api/schema';

/**
 * Lists dead (failed) jobs with optional filtering and pagination.
 *
 * @param params - Optional filters (e.g. `{ reviewed: false, queue_name: 'email', page: 1, pageSize: 50 }`).
 * @returns An array of `DeadJobDTO` objects.
 * @throws If the Supabase query returns an error.
 */
export async function listDeadJobs(
  params?: Record<string, unknown>,
): Promise<DeadJobDTO[]> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('dead_jobs')
    .select('*')
    .order('failed_at', { ascending: false });

  if (params?.reviewed !== undefined) {
    query = query.eq('reviewed', Boolean(params.reviewed));
  }

  if (params?.queue_name) {
    query = query.eq('queue_name', params.queue_name as string);
  }

  const page = typeof params?.page === 'number' ? (params.page as number) : 1;
  const pageSize = typeof params?.pageSize === 'number' ? (params.pageSize as number) : 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows: DeadJobRow[] = data ?? [];

  return rows.map((row) => ({
    id: row.id,
    tenantId: row.tenant_id,
    queueName: row.queue_name,
    jobType: row.job_type,
    errorMessage: row.error_message,
    failedAt: row.failed_at,
    reviewed: row.reviewed,
  }));
}

/**
 * Marks a dead job as reviewed with resolution notes.
 *
 * @param jobId - The dead job identifier to review.
 * @param resolutionNotes - Notes describing the resolution.
 * @returns An `ActionConfirmationDTO` confirming the update.
 * @throws If the Supabase query returns an error.
 */
export async function reviewDeadJob(
  jobId: string,
  resolutionNotes: string,
): Promise<ActionConfirmationDTO> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('dead_jobs')
    .update({
      reviewed: true,
      reviewed_at: new Date().toISOString(),
      resolution_notes: resolutionNotes,
    })
    .eq('id', jobId);

  if (error) {
    throw error;
  }

  return { success: true };
}

/**
 * Lists niche profiles pending or with a specific status, for admin review.
 *
 * @param params - Optional filters (e.g. `{ status: 'pending' }`).
 * @returns An array of `NicheReviewDTO` objects.
 * @throws If the Supabase query returns an error.
 */
export async function listNicheReviews(
  params?: Record<string, unknown>,
): Promise<NicheReviewDTO[]> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('niche_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (params?.status) {
    query = query.eq('status', params.status as string);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows: NicheProfileRow[] = data ?? [];

  return rows.map((row) => ({
    id: row.id,
    nicheName: row.niche_name,
    submittedAt: row.created_at,
    status: row.status as NicheReviewDTO['status'],
  }));
}

/**
 * Approves a niche profile, setting its status to active.
 *
 * @param nicheId - The niche profile identifier to approve.
 * @returns An `ActionConfirmationDTO` confirming the approval.
 * @throws If the Supabase query returns an error.
 */
export async function approveNiche(
  nicheId: string,
): Promise<ActionConfirmationDTO> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('niche_profiles')
    .update({
      status: 'active',
      approved_at: new Date().toISOString(),
    })
    .eq('id', nicheId);

  if (error) {
    throw error;
  }

  return { success: true };
}

/**
 * Rejects a niche profile, setting its status to deprecated.
 *
 * @param nicheId - The niche profile identifier to reject.
 * @returns An `ActionConfirmationDTO` confirming the rejection.
 * @throws If the Supabase query returns an error.
 */
export async function rejectNiche(
  nicheId: string,
): Promise<ActionConfirmationDTO> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('niche_profiles')
    .update({ status: 'deprecated' })
    .eq('id', nicheId);

  if (error) {
    throw error;
  }

  return { success: true };
}

/**
 * Lists tenants for admin dashboard with optional filtering and pagination.
 * Health score requires a separate join and is returned as null for now.
 *
 * @param params - Optional filters (e.g. `{ status: 'active', tier: 'pro', search: 'acme', page: 1, pageSize: 25 }`).
 * @returns An array of `TenantSummaryDTO` objects.
 * @throws If the Supabase query returns an error.
 */
export async function listTenantsAdmin(
  params?: Record<string, unknown>,
): Promise<TenantSummaryDTO[]> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('tenants')
    .select('*')
    .order('activated_at', { ascending: false });

  if (params?.status) {
    query = query.eq('status', params.status as string);
  }

  if (params?.tier) {
    query = query.eq('tier', params.tier as string);
  }

  if (params?.search) {
    query = query.ilike('business_name', `%${params.search as string}%`);
  }

  const page = typeof params?.page === 'number' ? (params.page as number) : 1;
  const pageSize = typeof params?.pageSize === 'number' ? (params.pageSize as number) : 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows: TenantRow[] = data ?? [];

  return rows.map((row) => ({
    id: row.id,
    businessName: row.business_name,
    tier: row.tier,
    status: row.status,
    activatedAt: row.activated_at,
    healthScore: null,
  }));
}

/**
 * Retrieves detailed information for a specific tenant (admin view).
 * Niche and health data require separate joins and are returned as
 * placeholder values for now.
 *
 * @param tenantId - The tenant identifier to look up.
 * @returns A `TenantDetailsDTO` or `null` if the tenant is not found.
 * @throws If the Supabase query returns an error.
 */
export async function getTenantDetailsAdmin(
  tenantId: string,
): Promise<TenantDetailsDTO | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const row = data as TenantRow;

  return {
    id: row.id,
    name: row.business_name,
    status: row.status,
    tier: row.tier,
    niche: '',
    completenessScore: row.completeness_score,
    sprintModeActive: row.sprint_mode_active,
    activatedAt: row.activated_at,
  };
}
