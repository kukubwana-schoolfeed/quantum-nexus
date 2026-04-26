/**
 * Content Post Queries
 * @module content-queries
 * @description Typed Supabase query module for the content_posts table.
 * Every query enforces tenant_id filtering at the application layer since the
 * service role client bypasses RLS. All functions use the admin Supabase client.
 */

import { getSupabaseAdmin } from '@/lib/db/client';
import type { ContentPostRow } from '@/lib/db/types';
import type { ContentPostDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/**
 * Lists content posts for a tenant with optional filtering and pagination.
 *
 * Supports the following filter keys in `params`:
 * - `status` — exact match on post status
 * - `content_type` — exact match on content type
 * - `platform` — exact match on platform
 * - `search` — case-insensitive search on the `caption` column (ilike)
 *
 * Pagination defaults to page 1 with 20 items per page.
 *
 * @param tenantId - The tenant to scope queries to
 * @param params - Filter and pagination parameters
 * @returns An object with the paginated data rows and the total count
 */
export async function listPosts(
  tenantId: string,
  params: Record<string, unknown>,
): Promise<{ data: ContentPostRow[]; total: number }> {
  const supabase = getSupabaseAdmin();

  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 20);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('content_posts')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenantId);

  if (params.status) {
    query = query.eq('status', params.status as string);
  }
  if (params.content_type) {
    query = query.eq('content_type', params.content_type as string);
  }
  if (params.platform) {
    query = query.eq('platform', params.platform as string);
  }
  if (params.search) {
    query = query.ilike('caption', `%${params.search as string}%`);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(from, to);

  const { data, count, error } = await query;

  if (error) {
    throw error;
  }

  return {
    data: (data ?? []) as ContentPostRow[],
    total: count ?? 0,
  };
}

/**
 * Retrieves a single content post by ID within the given tenant.
 *
 * @param tenantId - The tenant to scope queries to
 * @param postId - The unique ID of the post
 * @returns The matching post row, or null if not found
 */
export async function getPost(
  tenantId: string,
  postId: string,
): Promise<ContentPostRow | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('content_posts')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', postId)
    .single();

  if (error) {
    throw error;
  }

  return data as ContentPostRow | null;
}

/**
 * Creates a new content post for the given tenant.
 *
 * The post is inserted with the provided `data` merged alongside the
 * `tenant_id` and a default status of `'draft'`.
 *
 * @param tenantId - The tenant to scope the new post to
 * @param data - Partial row fields to insert
 * @returns The newly created content post row
 */
export async function createPost(
  tenantId: string,
  data: Partial<ContentPostRow>,
): Promise<ContentPostRow> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('content_posts')
    .insert({
      ...data,
      tenant_id: tenantId,
      status: data.status ?? 'draft',
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return row as ContentPostRow;
}

/**
 * Updates an existing content post filtered by both tenant and post ID.
 *
 * @param tenantId - The tenant to scope queries to
 * @param postId - The unique ID of the post to update
 * @param data - Partial row fields to update
 * @returns The updated content post row
 */
export async function updatePost(
  tenantId: string,
  postId: string,
  data: Partial<ContentPostRow>,
): Promise<ContentPostRow> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('content_posts')
    .update(data)
    .eq('tenant_id', tenantId)
    .eq('id', postId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return row as ContentPostRow;
}

/**
 * Deletes a content post filtered by both tenant and post ID.
 *
 * @param tenantId - The tenant to scope queries to
 * @param postId - The unique ID of the post to delete
 * @returns An action confirmation indicating success or failure
 */
export async function deletePost(
  tenantId: string,
  postId: string,
): Promise<ActionConfirmationDTO> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('content_posts')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('id', postId);

  if (error) {
    throw error;
  }

  return { success: true };
}

/**
 * Schedules a content post for future publishing.
 *
 * Sets the post status to `'scheduled'` and assigns the `scheduled_for` timestamp.
 *
 * @param tenantId - The tenant to scope queries to
 * @param postId - The unique ID of the post to schedule
 * @param scheduledFor - ISO timestamp for when the post should be published
 * @returns An object indicating success and the scheduled timestamp
 */
export async function schedulePost(
  tenantId: string,
  postId: string,
  scheduledFor: string,
): Promise<{ success: boolean; scheduledFor: string }> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('content_posts')
    .update({
      status: 'scheduled',
      scheduled_for: scheduledFor,
    })
    .eq('tenant_id', tenantId)
    .eq('id', postId);

  if (error) {
    throw error;
  }

  return { success: true, scheduledFor };
}

/**
 * Approves a content post, transitioning its status to `'approved'`.
 *
 * @param tenantId - The tenant to scope queries to
 * @param postId - The unique ID of the post to approve
 * @returns An object indicating success and the new status
 */
export async function approvePost(
  tenantId: string,
  postId: string,
): Promise<{ success: boolean; status: string }> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('content_posts')
    .update({ status: 'approved' })
    .eq('tenant_id', tenantId)
    .eq('id', postId);

  if (error) {
    throw error;
  }

  return { success: true, status: 'approved' };
}

/**
 * Lists all content posts for a tenant that match a specific status.
 *
 * @param tenantId - The tenant to scope queries to
 * @param status - The status value to filter by
 * @returns An array of matching content post rows
 */
export async function listPostsByStatus(
  tenantId: string,
  status: string,
): Promise<ContentPostRow[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('content_posts')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', status);

  if (error) {
    throw error;
  }

  return (data ?? []) as ContentPostRow[];
}

/**
 * Counts the number of content posts created today for a given tenant.
 *
 * "Today" is determined using the server's local date at midnight UTC.
 *
 * @param tenantId - The tenant to scope queries to
 * @returns The count of posts created today
 */
export async function countPostsToday(
  tenantId: string,
): Promise<number> {
  const supabase = getSupabaseAdmin();

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('content_posts')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('created_at', todayStart.toISOString());

  if (error) {
    throw error;
  }

  return count ?? 0;
}

/**
 * Counts the number of scheduled content posts due within the next 24 hours.
 *
 * Filters for posts with status `'scheduled'` and a `scheduled_for` value
 * between now and 24 hours from now.
 *
 * @param tenantId - The tenant to scope queries to
 * @returns The count of scheduled posts in the next 24 hours
 */
export async function countScheduledNext24h(
  tenantId: string,
): Promise<number> {
  const supabase = getSupabaseAdmin();

  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { count, error } = await supabase
    .from('content_posts')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('status', 'scheduled')
    .gte('scheduled_for', now.toISOString())
    .lte('scheduled_for', next24h.toISOString());

  if (error) {
    throw error;
  }

  return count ?? 0;
}

/**
 * Updates the safety check result and optional reason for a content post.
 *
 * @param tenantId - The tenant to scope queries to
 * @param postId - The unique ID of the post to update
 * @param result - Whether the safety check passed or failed
 * @param reason - Optional human-readable reason for a fail result
 * @returns An action confirmation indicating success or failure
 */
export async function updatePostSafetyCheck(
  tenantId: string,
  postId: string,
  result: 'pass' | 'fail',
  reason?: string,
): Promise<ActionConfirmationDTO> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('content_posts')
    .update({
      safety_check_result: result,
      safety_check_reason: reason ?? null,
    })
    .eq('tenant_id', tenantId)
    .eq('id', postId);

  if (error) {
    throw error;
  }

  return { success: true };
}
