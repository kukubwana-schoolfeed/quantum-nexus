import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { SalesCampaignDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module outbound-sales-engine @description Outbound sales campaign management routes for tenant businesses */

/**
 * Retrieves all sales campaigns for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to an array of sales campaign entries
 */
export async function getCampaigns(tenantId: string): Promise<ApiResponse<SalesCampaignDTO[]>> {
  const { data } = await db.contentQueries.listPosts(tenantId, { content_type: 'email' });
  const campaigns: SalesCampaignDTO[] = data.map(post => ({
    id: post.id,
    name: post.email_subject ?? post.caption ?? 'Untitled Campaign',
    status: (post.status === 'cancelled' ? 'paused' : post.status === 'published' ? 'completed' : post.status === 'draft' ? 'draft' : 'active') as SalesCampaignDTO['status'],
    targetsCount: 0,
    responsesCount: 0,
  }));
  return { success: true, data: campaigns };
}

/**
 * Retrieves a single sales campaign by its identifier.
 * @param tenantId - The unique identifier of the tenant
 * @param campaignId - The unique identifier of the campaign
 * @returns Promise resolving to the campaign entry or null
 */
export async function getCampaign(tenantId: string, campaignId: string): Promise<ApiResponse<SalesCampaignDTO | null>> {
  const post = await db.contentQueries.getPost(tenantId, campaignId);
  if (!post) return { success: true, data: null };
  const campaign: SalesCampaignDTO = {
    id: post.id,
    name: post.email_subject ?? post.caption ?? 'Untitled Campaign',
    status: (post.status === 'cancelled' ? 'paused' : post.status === 'published' ? 'completed' : post.status === 'draft' ? 'draft' : 'active') as SalesCampaignDTO['status'],
    targetsCount: 0,
    responsesCount: 0,
  };
  return { success: true, data: campaign };
}

/**
 * Creates a new sales campaign in draft status.
 * @param tenantId - The unique identifier of the tenant
 * @param data - The campaign fields to create
 * @returns Promise resolving to the newly created campaign
 */
export async function createCampaign(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<SalesCampaignDTO>> {
  const result = await db.contentQueries.createPost(tenantId, { ...data, content_type: 'email', status: 'draft' });
  const campaign: SalesCampaignDTO = {
    id: result.id,
    name: result.email_subject ?? result.caption ?? 'Untitled Campaign',
    status: 'draft',
    targetsCount: 0,
    responsesCount: 0,
  };
  return { success: true, data: campaign };
}

/**
 * Updates an existing sales campaign.
 * @param tenantId - The unique identifier of the tenant
 * @param campaignId - The unique identifier of the campaign to update
 * @param data - The fields to update on the campaign
 * @returns Promise resolving to the update result
 */
export async function updateCampaign(tenantId: string, campaignId: string, data: Record<string, unknown>): Promise<ApiResponse<ActionConfirmationDTO & Record<string, unknown>>> {
  await db.contentQueries.updatePost(tenantId, campaignId, data);
  return { success: true, data: { success: true, message: 'Campaign updated' } };
}

/**
 * Pauses an active sales campaign.
 * @param tenantId - The unique identifier of the tenant
 * @param campaignId - The unique identifier of the campaign to pause
 * @returns Promise resolving to the pause result
 */
export async function pauseCampaign(tenantId: string, campaignId: string): Promise<ApiResponse<{ success: boolean; status: string }>> {
  await db.contentQueries.updatePost(tenantId, campaignId, { status: 'cancelled' });
  return { success: true, data: { success: true, status: 'paused' } };
}
