import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { SeasonalCampaignDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module seasonal-campaign-engine @description Seasonal campaign management — list, retrieve, create, and update time-bound campaigns. */

/**
 * Retrieve all seasonal campaigns for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @returns A list of seasonal campaigns with their statuses and schedules.
 */
export async function getCampaigns(tenantId: string): Promise<ApiResponse<SeasonalCampaignDTO[]>> {
  const { data } = await db.contentQueries.listPosts(tenantId, {});
  const campaigns: SeasonalCampaignDTO[] = data.map(post => ({
    id: post.id,
    name: post.caption ?? 'Untitled Campaign',
    status: (post.status === 'published' ? 'active' : post.status === 'cancelled' ? 'completed' : post.status === 'scheduled' ? 'scheduled' : 'draft') as SeasonalCampaignDTO['status'],
    startsAt: post.scheduled_for ?? post.created_at,
    endsAt: post.published_at ?? '',
  }));
  return { success: true, data: campaigns };
}

/**
 * Retrieve a single seasonal campaign by its identifier.
 * @param tenantId - The unique identifier of the tenant.
 * @param campaignId - The unique identifier of the campaign.
 * @returns The campaign details, or null if not found.
 */
export async function getCampaign(tenantId: string, campaignId: string): Promise<ApiResponse<SeasonalCampaignDTO | null>> {
  const post = await db.contentQueries.getPost(tenantId, campaignId);
  if (!post) return { success: true, data: null };
  const campaign: SeasonalCampaignDTO = {
    id: post.id,
    name: post.caption ?? 'Untitled Campaign',
    status: (post.status === 'published' ? 'active' : post.status === 'cancelled' ? 'completed' : post.status === 'scheduled' ? 'scheduled' : 'draft') as SeasonalCampaignDTO['status'],
    startsAt: post.scheduled_for ?? post.created_at,
    endsAt: post.published_at ?? '',
  };
  return { success: true, data: campaign };
}

/**
 * Create a new seasonal campaign for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @param data - The campaign definition fields such as name, schedule, and offer details.
 * @returns The newly created campaign in draft status.
 */
export async function createCampaign(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<SeasonalCampaignDTO>> {
  const result = await db.contentQueries.createPost(tenantId, { ...data, status: 'draft' });
  const campaign: SeasonalCampaignDTO = {
    id: result.id,
    name: result.caption ?? 'Untitled Campaign',
    status: 'draft',
    startsAt: result.scheduled_for ?? result.created_at,
    endsAt: '',
  };
  return { success: true, data: campaign };
}

/**
 * Update an existing seasonal campaign's fields.
 * @param tenantId - The unique identifier of the tenant.
 * @param campaignId - The unique identifier of the campaign to update.
 * @param data - The fields to update on the campaign.
 * @returns The update confirmation with modified fields.
 */
export async function updateCampaign(tenantId: string, campaignId: string, data: Record<string, unknown>): Promise<ApiResponse<ActionConfirmationDTO & Record<string, unknown>>> {
  await db.contentQueries.updatePost(tenantId, campaignId, data);
  return { success: true, data: { success: true, message: 'Campaign updated' } };
}
