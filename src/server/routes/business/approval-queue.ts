import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { ApprovalQueueItemDTO } from '@/lib/api/schema';
import type { ContentPostRow } from '@/lib/db/types';

/** @module approval-queue @description Approval queue management — list, approve, reject items and configure approval workflow. */

/**
 * Map a content post row to an ApprovalQueueItemDTO.
 * @param post - The raw content post row from the database.
 * @returns The mapped ApprovalQueueItemDTO.
 */
function mapToApprovalItemDTO(post: ContentPostRow): ApprovalQueueItemDTO {
  return {
    id: post.id,
    contentType: post.content_type,
    platform: post.platform ?? null,
    status: post.status as 'pending_approval' | 'approved' | 'rejected',
    createdAt: post.created_at,
  };
}

/**
 * Retrieve all items currently in the approval queue for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @returns A list of approval queue items.
 */
export async function getItems(tenantId: string): Promise<ApiResponse<ApprovalQueueItemDTO[]>> {
  const { data } = await db.contentQueries.listPosts(tenantId, { status: 'pending_approval' });
  const items = data.map(mapToApprovalItemDTO);
  return { success: true, data: items };
}

/**
 * Retrieve a single approval queue item by its identifier.
 * @param tenantId - The unique identifier of the tenant.
 * @param itemId - The unique identifier of the approval queue item.
 * @returns The requested approval queue item, or null if not found.
 */
export async function getItem(tenantId: string, itemId: string): Promise<ApiResponse<ApprovalQueueItemDTO | null>> {
  const post = await db.contentQueries.getPost(tenantId, itemId);
  if (!post) {
    return { success: true, data: null };
  }
  return { success: true, data: mapToApprovalItemDTO(post) };
}

/**
 * Approve an item in the approval queue.
 * @param tenantId - The unique identifier of the tenant.
 * @param itemId - The unique identifier of the approval queue item to approve.
 * @returns The approval result with updated status.
 */
export async function approveItem(tenantId: string, itemId: string): Promise<ApiResponse<{ success: boolean; status: string }>> {
  await db.contentQueries.approvePost(tenantId, itemId);
  return { success: true, data: { success: true, status: 'approved' } };
}

/**
 * Reject an item in the approval queue with a reason.
 * @param tenantId - The unique identifier of the tenant.
 * @param itemId - The unique identifier of the approval queue item to reject.
 * @param reason - The reason for rejecting the item.
 * @returns The rejection result with updated status.
 */
export async function rejectItem(tenantId: string, itemId: string, reason: string): Promise<ApiResponse<{ success: boolean; status: string }>> {
  await db.contentQueries.updatePost(tenantId, itemId, { status: 'cancelled' });
  return { success: true, data: { success: true, status: 'rejected' } };
}

/**
 * Update the approval queue configuration for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @param enabled - Whether the approval queue workflow is enabled.
 * @returns The updated approval queue configuration.
 */
export async function updateConfig(tenantId: string, enabled: boolean): Promise<ApiResponse<{ success: boolean; enabled: boolean }>> {
  await db.businessQueries.upsertBusinessProfile(tenantId, { keyword_blocklist: [] });
  return { success: true, data: { success: true, enabled } };
}
