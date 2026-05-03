/**
 * SEO Query Module
 * @module seo-queries
 * @description Typed Supabase query functions for seo_tasks, indexed_pages,
 * and cannibalisation_reports tables. Every query enforces tenant_id filtering
 * to maintain multi-tenancy isolation when using the service role client.
 */

import { getSupabaseAdmin } from '@/lib/db/client';
import type { SeoTaskRow, IndexedPageRow, CannibalisationReportRow } from '@/lib/db/types';
import type { QaTaskDTO, DirectorySubmissionDTO, CannibalisationReportDTO, ActionConfirmationDTO, IdReferenceDTO } from '@/lib/api/schema';

// ─── seo_tasks ────────────────────────────────────────────────────────

/**
 * List SEO tasks for a tenant with optional filters and pagination.
 * Supports filtering by task_date, task_type, and status.
 * Results are ordered by task_date descending.
 *
 * @param tenantId - The tenant to query tasks for
 * @param params - Optional filters (task_date, task_type, status) and pagination (page, pageSize)
 * @returns Array of SeoTaskRow matching the filters
 */
export async function listSeoTasks(
  tenantId: string,
  params: Record<string, unknown>,
): Promise<SeoTaskRow[]> {
  const supabase = getSupabaseAdmin();

  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 50);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('seo_tasks')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('task_date', { ascending: false })
    .range(from, to);

  if (params.task_date != null) {
    query = query.eq('task_date', String(params.task_date));
  }
  if (params.task_type != null) {
    query = query.eq('task_type', String(params.task_type));
  }
  if (params.status != null) {
    query = query.eq('status', String(params.status));
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as SeoTaskRow[];
}

/**
 * Get a single SEO task by ID for a given tenant.
 *
 * @param tenantId - The tenant the task belongs to
 * @param taskId - The ID of the task to retrieve
 * @returns The SeoTaskRow if found, otherwise null
 */
export async function getSeoTask(
  tenantId: string,
  taskId: string,
): Promise<SeoTaskRow | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('seo_tasks')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', taskId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as SeoTaskRow | null;
}

/**
 * Create a new SEO task for a tenant.
 *
 * @param tenantId - The tenant the task belongs to
 * @param data - Partial SeoTaskRow fields to insert (tenant_id is set automatically)
 * @returns The newly created SeoTaskRow
 */
export async function createSeoTask(
  tenantId: string,
  data: Partial<SeoTaskRow>,
): Promise<SeoTaskRow> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('seo_tasks')
    .insert({ ...data, tenant_id: tenantId })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return row as SeoTaskRow;
}

/**
 * Update an existing SEO task for a tenant.
 *
 * @param tenantId - The tenant the task belongs to
 * @param taskId - The ID of the task to update
 * @param data - Partial SeoTaskRow fields to update
 * @returns The updated SeoTaskRow
 */
export async function updateSeoTask(
  tenantId: string,
  taskId: string,
  data: Partial<SeoTaskRow>,
): Promise<SeoTaskRow> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('seo_tasks')
    .update(data)
    .eq('tenant_id', tenantId)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return row as SeoTaskRow;
}

/**
 * Count today's SEO tasks for a tenant, returning total and complete counts.
 * Tasks are counted where task_date matches today's date (UTC).
 *
 * @param tenantId - The tenant to count tasks for
 * @returns Object with total task count and complete task count
 */
export async function countTasksToday(
  tenantId: string,
): Promise<{ total: number; complete: number }> {
  const supabase = getSupabaseAdmin();

  const today = new Date().toISOString().slice(0, 10);

  const { count: total, error: totalError } = await supabase
    .from('seo_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('task_date', today);

  if (totalError) {
    throw totalError;
  }

  const { count: complete, error: completeError } = await supabase
    .from('seo_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('task_date', today)
    .eq('status', 'complete');

  if (completeError) {
    throw completeError;
  }

  return { total: total ?? 0, complete: complete ?? 0 };
}

/**
 * List QA seed tasks for a tenant, mapped to QaTaskDTO.
 * Queries seo_tasks where task_type is 'qa_seed'.
 *
 * @param tenantId - The tenant to query QA tasks for
 * @param params - Optional filters and pagination parameters
 * @returns Array of QaTaskDTO
 */
export async function listQaTasks(
  tenantId: string,
  params?: Record<string, unknown>,
): Promise<QaTaskDTO[]> {
  const supabase = getSupabaseAdmin();

  const page = Number(params?.page ?? 1);
  const pageSize = Number(params?.pageSize ?? 50);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('seo_tasks')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('task_type', 'qa_seed')
    .order('task_date', { ascending: false })
    .range(from, to);

  if (params?.status != null) {
    query = query.eq('status', String(params.status));
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: SeoTaskRow) => ({
    id: row.id,
    platform: row.platform ?? '',
    questionText: row.question_text ?? '',
    answerText: row.answer_text ?? '',
    status: row.status as QaTaskDTO['status'],
    questionPostedAt: row.question_posted_at,
  }));
}

/**
 * List directory submission tasks for a tenant, mapped to DirectorySubmissionDTO.
 * Queries seo_tasks where task_type is 'directory_submission'.
 *
 * @param tenantId - The tenant to query directory submissions for
 * @param params - Optional filters and pagination parameters
 * @returns Array of DirectorySubmissionDTO
 */
export async function listDirectorySubmissions(
  tenantId: string,
  params?: Record<string, unknown>,
): Promise<DirectorySubmissionDTO[]> {
  const supabase = getSupabaseAdmin();

  const page = Number(params?.page ?? 1);
  const pageSize = Number(params?.pageSize ?? 50);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('seo_tasks')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('task_type', 'directory_submission')
    .order('task_date', { ascending: false })
    .range(from, to);

  if (params?.status != null) {
    query = query.eq('status', String(params.status));
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: SeoTaskRow) => ({
    id: row.id,
    directoryName: row.platform ?? '',
    status: row.status as DirectorySubmissionDTO['status'],
    listingUrl: null,
  }));
}

// ─── indexed_pages ────────────────────────────────────────────────────

/**
 * List indexed pages for a tenant with optional pagination and page_type filter.
 * Results are ordered by indexed_at descending.
 *
 * @param tenantId - The tenant to query indexed pages for
 * @param params - Optional page_type filter and pagination (page, pageSize)
 * @returns Array of IndexedPageRow
 */
export async function listIndexedPages(
  tenantId: string,
  params: Record<string, unknown>,
): Promise<IndexedPageRow[]> {
  const supabase = getSupabaseAdmin();

  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 50);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('indexed_pages')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('indexed_at', { ascending: false })
    .range(from, to);

  if (params.page_type != null) {
    query = query.eq('page_type', String(params.page_type));
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as IndexedPageRow[];
}

/**
 * Count the total number of indexed pages for a tenant.
 *
 * @param tenantId - The tenant to count indexed pages for
 * @returns Total count of indexed pages
 */
export async function countIndexedPages(
  tenantId: string,
): Promise<number> {
  const supabase = getSupabaseAdmin();

  const { count, error } = await supabase
    .from('indexed_pages')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

/**
 * Count indexed pages that were indexed today for a tenant.
 * Pages are counted where indexed_at is greater than or equal to the start of today (UTC).
 *
 * @param tenantId - The tenant to count today's indexed pages for
 * @returns Count of indexed pages from today
 */
export async function countIndexedPagesToday(
  tenantId: string,
): Promise<number> {
  const supabase = getSupabaseAdmin();

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('indexed_pages')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('indexed_at', startOfToday.toISOString());

  if (error) {
    throw error;
  }

  return count ?? 0;
}

/**
 * Create or update an indexed page for a tenant using upsert.
 * On conflict of (tenant_id, page_url), the existing row is updated.
 *
 * @param tenantId - The tenant the indexed page belongs to
 * @param data - Partial IndexedPageRow fields to insert (tenant_id is set automatically)
 * @returns The upserted IndexedPageRow
 */
export async function createIndexedPage(
  tenantId: string,
  data: Partial<IndexedPageRow>,
): Promise<IndexedPageRow> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('indexed_pages')
    .upsert(
      { ...data, tenant_id: tenantId },
      { onConflict: 'tenant_id,page_url' },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return row as IndexedPageRow;
}

// ─── cannibalisation_reports ──────────────────────────────────────────

/**
 * List cannibalisation reports for a tenant, mapped to CannibalisationReportDTO.
 * Supports optional status filtering.
 *
 * @param tenantId - The tenant to query cannibalisation reports for
 * @param params - Optional status filter and pagination parameters
 * @returns Array of CannibalisationReportDTO
 */
export async function listCannibalisationReports(
  tenantId: string,
  params?: Record<string, unknown>,
): Promise<CannibalisationReportDTO[]> {
  const supabase = getSupabaseAdmin();

  const page = Number(params?.page ?? 1);
  const pageSize = Number(params?.pageSize ?? 50);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('cannibalisation_reports')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('detected_at', { ascending: false })
    .range(from, to);

  if (params?.status != null) {
    query = query.eq('status', String(params.status));
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: CannibalisationReportRow) => ({
    id: row.id,
    conflictingKeyword: row.conflicting_keyword,
    strongPostUrl: row.strong_post_url ?? '',
    weakPostUrl: row.weak_post_url ?? '',
    recommendedAction: row.recommended_action,
    status: row.status,
  }));
}

/**
 * Create a new cannibalisation report for a tenant.
 *
 * @param tenantId - The tenant the report belongs to
 * @param data - Partial CannibalisationReportRow fields to insert (tenant_id is set automatically)
 * @returns The newly created CannibalisationReportRow
 */
export async function createCannibalisationReport(
  tenantId: string,
  data: Partial<CannibalisationReportRow>,
): Promise<CannibalisationReportRow> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('cannibalisation_reports')
    .insert({ ...data, tenant_id: tenantId })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return row as CannibalisationReportRow;
}

/**
 * Update the status of a cannibalisation report.
 * If the status is 'approved' or 'dismissed', resolved_at is set to the current timestamp.
 *
 * @param tenantId - The tenant the report belongs to
 * @param reportId - The ID of the report to update
 * @param status - The new status value ('pending', 'approved', or 'dismissed')
 * @returns ActionConfirmationDTO indicating success or failure
 */
export async function updateCannibalisationReportStatus(
  tenantId: string,
  reportId: string,
  status: string,
): Promise<ActionConfirmationDTO> {
  const supabase = getSupabaseAdmin();

  const updatePayload: Partial<CannibalisationReportRow> = { status: status as CannibalisationReportRow['status'] };

  if (status === 'approved' || status === 'dismissed') {
    updatePayload.resolved_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('cannibalisation_reports')
    .update(updatePayload)
    .eq('tenant_id', tenantId)
    .eq('id', reportId);

  if (error) {
    throw error;
  }

  return { success: true, message: `Report ${reportId} status updated to ${status}` };
}
