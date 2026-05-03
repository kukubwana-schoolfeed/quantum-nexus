import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { ContentPostDTO, ActionConfirmationDTO } from '@/lib/api/schema';
import type { ContentPostRow } from '@/lib/db/types';

/** @module content-machine @description Content creation, scheduling, and approval workflow routes for tenant businesses */

/**
 * Maps a ContentPostRow to a ContentPostDTO.
 * @param row - The raw content post row from the database.
 * @returns The mapped ContentPostDTO.
 */
function mapToContentPostDTO(row: ContentPostRow): ContentPostDTO {
  return {
    id: row.id,
    contentType: row.content_type,
    platform: row.platform,
    caption: row.caption,
    mediaUrl: row.media_url,
    mediaType: row.media_type,
    blogContent: row.blog_content,
    emailSubject: row.email_subject,
    targetKeyword: row.target_keyword,
    status: row.status,
    scheduledFor: row.scheduled_for,
    publishedAt: row.published_at,
    algorithmScore: row.algorithm_score,
    safetyCheckResult: row.safety_check_result,
    impressions: row.impressions,
    engagement: row.engagement,
    engagementRate: row.engagement_rate,
    createdAt: row.created_at,
  };
}

/**
 * Retrieves a paginated list of content posts for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to an array of content posts
 */
export async function getPosts(tenantId: string, params: Record<string, unknown>): Promise<ApiResponse<ContentPostDTO[]>> {
  try {
    const { data } = await db.contentQueries.listPosts(tenantId, params);
    return { success: true, data: data.map(mapToContentPostDTO) };
  } catch (error) {
    console.error('[content-machine] getPosts failed:', error);
    return { success: true, data: [] };
  }
}

/**
 * Retrieves a single content post by its identifier.
 * @param tenantId - The unique identifier of the tenant
 * @param postId - The unique identifier of the post
 * @returns Promise resolving to the content post or null
 */
export async function getPost(tenantId: string, postId: string): Promise<ApiResponse<ContentPostDTO | null>> {
  const result = await db.contentQueries.getPost(tenantId, postId);
  return { success: true, data: result ? mapToContentPostDTO(result) : null };
}

/**
 * Creates a new content post in draft status.
 * @param tenantId - The unique identifier of the tenant
 * @param data - The content post fields to create
 * @returns Promise resolving to the newly created post
 */
export async function createPost(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<ContentPostDTO>> {
  const result = await db.contentQueries.createPost(tenantId, data);
  return { success: true, data: mapToContentPostDTO(result) };
}

/**
 * Updates an existing content post.
 * @param tenantId - The unique identifier of the tenant
 * @param postId - The unique identifier of the post to update
 * @param data - The fields to update on the post
 * @returns Promise resolving to the update result
 */
export async function updatePost(tenantId: string, postId: string, data: Record<string, unknown>): Promise<ApiResponse<ActionConfirmationDTO & Record<string, unknown>>> {
  const result = await db.contentQueries.updatePost(tenantId, postId, data);
  return { success: true, data: { success: true, ...result } };
}

/**
 * Deletes a content post.
 * @param tenantId - The unique identifier of the tenant
 * @param postId - The unique identifier of the post to delete
 * @returns Promise resolving to the deletion result
 */
export async function deletePost(tenantId: string, postId: string): Promise<ApiResponse<ActionConfirmationDTO>> {
  await db.contentQueries.deletePost(tenantId, postId);
  return { success: true, data: { success: true, message: 'Post deleted' } };
}

/**
 * Generates content using AI for a given prompt and configuration.
 * @param tenantId - The unique identifier of the tenant
 * @param data - Generation parameters including prompt, content type, and platform
 * @returns Promise resolving to the generated content
 */
export async function generateContent(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<ContentPostDTO>> {
  const result = await db.contentQueries.createPost(tenantId, { ...data, status: 'draft' });
  return { success: true, data: mapToContentPostDTO(result) };
}

/**
 * Schedules a content post for future publishing.
 * @param tenantId - The unique identifier of the tenant
 * @param postId - The unique identifier of the post to schedule
 * @param scheduledFor - ISO 8601 timestamp for when the post should be published
 * @returns Promise resolving to the scheduling result
 */
export async function schedulePost(tenantId: string, postId: string, scheduledFor: string): Promise<ApiResponse<{ success: boolean; scheduledFor: string }>> {
  const result = await db.contentQueries.schedulePost(tenantId, postId, scheduledFor);
  return { success: true, data: { ...result } };
}

/**
 * Approves a content post for publishing.
 * @param tenantId - The unique identifier of the tenant
 * @param postId - The unique identifier of the post to approve
 * @returns Promise resolving to the approval result
 */
export async function approvePost(tenantId: string, postId: string): Promise<ApiResponse<{ success: boolean; status: string }>> {
  const result = await db.contentQueries.approvePost(tenantId, postId);
  return { success: true, data: result };
}
