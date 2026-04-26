import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { BroadcastDTO } from '@/lib/api/schema';

/** @module broadcast-engine @description WhatsApp/SMS broadcast creation, sending, and scheduling routes for tenant businesses */

/** Content types that represent broadcasts rather than regular posts. */
const BROADCAST_CONTENT_TYPES = ['whatsapp_broadcast', 'email', 'sms'] as const;

/**
 * Map a content post row to a BroadcastDTO.
 * @param post - The raw content post row from the database.
 * @returns The mapped BroadcastDTO.
 */
function mapToBroadcastDTO(post: Record<string, unknown>): BroadcastDTO {
  const contentType = post.content_type as string;
  const typeMap: Record<string, 'whatsapp' | 'email' | 'sms'> = {
    whatsapp_broadcast: 'whatsapp',
    email: 'email',
    sms: 'sms',
  };
  return {
    id: post.id as string,
    type: typeMap[contentType] ?? 'whatsapp',
    subject: (post.email_subject as string) ?? null,
    body: (post.caption as string) ?? (post.blog_content as string) ?? '',
    status: post.status as 'draft' | 'sent' | 'scheduled' | 'failed',
    sentAt: (post.published_at as string) ?? null,
    scheduledFor: (post.scheduled_for as string) ?? null,
    recipientCount: (post.recipient_count as number) ?? 0,
  };
}

/**
 * Retrieves all broadcasts for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to an array of broadcast entries
 */
export async function getBroadcasts(tenantId: string): Promise<ApiResponse<BroadcastDTO[]>> {
  const { data } = await db.contentQueries.listPosts(tenantId, {});
  const broadcasts = (data as unknown as Array<Record<string, unknown>>)
    .filter((p) => BROADCAST_CONTENT_TYPES.includes(p.content_type as typeof BROADCAST_CONTENT_TYPES[number]))
    .map(mapToBroadcastDTO);
  return { success: true, data: broadcasts };
}

/**
 * Retrieves a single broadcast by its identifier.
 * @param tenantId - The unique identifier of the tenant
 * @param broadcastId - The unique identifier of the broadcast
 * @returns Promise resolving to the broadcast entry or null
 */
export async function getBroadcast(tenantId: string, broadcastId: string): Promise<ApiResponse<BroadcastDTO | null>> {
  const post = await db.contentQueries.getPost(tenantId, broadcastId);
  if (!post) {
    return { success: true, data: null };
  }
  return { success: true, data: mapToBroadcastDTO(post as unknown as Record<string, unknown>) };
}

/**
 * Creates a new broadcast in draft status.
 * @param tenantId - The unique identifier of the tenant
 * @param data - The broadcast fields to create
 * @returns Promise resolving to the newly created broadcast
 */
export async function createBroadcast(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<BroadcastDTO>> {
  const result = await db.contentQueries.createPost(tenantId, { ...data, status: 'draft' });
  return { success: true, data: mapToBroadcastDTO(result as unknown as Record<string, unknown>) };
}

/**
 * Sends a broadcast immediately to all recipients.
 * @param tenantId - The unique identifier of the tenant
 * @param broadcastId - The unique identifier of the broadcast to send
 * @returns Promise resolving to the send result
 */
export async function sendBroadcast(tenantId: string, broadcastId: string): Promise<ApiResponse<{ success: boolean; sentCount: number }>> {
  const result = await db.contentQueries.updatePost(tenantId, broadcastId, {
    status: 'published',
    published_at: new Date().toISOString(),
  });
  const dto = mapToBroadcastDTO(result as unknown as Record<string, unknown>);
  return { success: true, data: { success: true, sentCount: dto.recipientCount } };
}

/**
 * Schedules a broadcast for future sending.
 * @param tenantId - The unique identifier of the tenant
 * @param broadcastId - The unique identifier of the broadcast to schedule
 * @param scheduledFor - ISO 8601 timestamp for when the broadcast should be sent
 * @returns Promise resolving to the scheduling result
 */
export async function scheduleBroadcast(tenantId: string, broadcastId: string, scheduledFor: string): Promise<ApiResponse<{ success: boolean; scheduledFor: string }>> {
  await db.contentQueries.schedulePost(tenantId, broadcastId, scheduledFor);
  return { success: true, data: { success: true, scheduledFor } };
}
