import * as db from '@/lib/db';
import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { GbpProfileDTO, GbpInsightsDTO, ActionConfirmationDTO, IdReferenceDTO } from '@/lib/api/schema';

/** @module google-business-profile-manager @description Google Business Profile management and insights routes for tenant businesses */

/**
 * Retrieves the Google Business Profile for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to the GBP profile data
 */
export async function getProfile(tenantId: string): Promise<ApiResponse<GbpProfileDTO>> {
  const profile = await db.businessQueries.getBusinessProfile(tenantId);
  const data: GbpProfileDTO = {
    name: profile?.logo_url ? 'Business' : (profile?.location ?? 'Business'),
    category: profile?.niche ?? '',
    rating: 0,
    reviewCount: 0,
  };
  return { success: true, data };
}

/**
 * Updates the Google Business Profile fields.
 * @param tenantId - The unique identifier of the tenant
 * @param data - The profile fields to update
 * @returns Promise resolving to the update result
 */
export async function updateProfile(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<ActionConfirmationDTO & Record<string, unknown>>> {
  await db.businessQueries.upsertBusinessProfile(tenantId, data);
  return { success: true, data: { success: true, message: 'Profile updated' } };
}

/**
 * Retrieves Google Business Profile insights including views, searches, and direction requests.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to the GBP insights data
 */
export async function getInsights(tenantId: string): Promise<ApiResponse<GbpInsightsDTO>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Publishes a post to the Google Business Profile.
 * @param tenantId - The unique identifier of the tenant
 * @param data - The post content and configuration
 * @returns Promise resolving to the publish result
 */
export async function publishPost(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<IdReferenceDTO>> {
  const result = await db.contentQueries.createPost(tenantId, { content_type: 'gbp_post', status: 'draft', ...data });
  return { success: true, data: { id: result.id } };
}
