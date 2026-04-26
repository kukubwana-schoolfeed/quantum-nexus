import * as db from '@/lib/db';
import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { ConnectedPlatformDTO, ContentPostDTO } from '@/lib/api/schema';

/** @module social-media-layer @description Social platform connection management and post history routes for tenant businesses */

/**
 * Retrieves all connected social media platforms for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to an array of connected platform entries
 */
export async function getConnectedPlatforms(tenantId: string): Promise<ApiResponse<ConnectedPlatformDTO[]>> {
  const keys = await db.billingQueries.listApiKeys(tenantId);
  const data: ConnectedPlatformDTO[] = keys.map(k => ({
    platform: k.keyName.replace(/_/g, ' '),
    connected: k.isConnected,
    username: null,
    tokenExpiresAt: k.expiresAt,
  }));
  return { success: true, data };
}

/**
 * Connects a social media platform using an OAuth authorization code.
 * @param tenantId - The unique identifier of the tenant
 * @param platform - The platform identifier (e.g. 'instagram', 'facebook')
 * @param authCode - The OAuth authorization code from the platform
 * @returns Promise resolving to the connection result
 */
export async function connectPlatform(tenantId: string, platform: string, authCode: string): Promise<ApiResponse<{ success: boolean; platform: string }>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Disconnects a social media platform from the tenant.
 * @param tenantId - The unique identifier of the tenant
 * @param platform - The platform identifier to disconnect
 * @returns Promise resolving to the disconnection result
 */
export async function disconnectPlatform(tenantId: string, platform: string): Promise<ApiResponse<{ success: boolean; platform: string }>> {
  await db.billingQueries.deleteEncryptedKey(tenantId, platform);
  return { success: true, data: { success: true, platform } };
}

/**
 * Retrieves the post history across connected social platforms.
 * @param tenantId - The unique identifier of the tenant
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to an array of post history entries
 */
export async function getPostHistory(tenantId: string, params: Record<string, unknown>): Promise<ApiResponse<ContentPostDTO[]>> {
  const { data } = await db.contentQueries.listPosts(tenantId, params);
  return { success: true, data: data as unknown as ContentPostDTO[] };
}
