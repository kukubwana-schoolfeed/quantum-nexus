import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { ReviewCampaignDTO } from '@/lib/api/schema';

/** @module review-campaign-manager @description Review request campaign management — list, create, and launch campaigns. */

/**
 * Retrieve all review campaigns for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @returns A list of review campaigns.
 */
export async function getCampaigns(tenantId: string): Promise<ApiResponse<ReviewCampaignDTO[]>> {
  const { data } = await db.contentQueries.listPosts(tenantId, { content_type: 'email' });
  const campaigns: ReviewCampaignDTO[] = data.map(post => ({
    id: post.id,
    name: post.email_subject ?? post.caption ?? 'Untitled Campaign',
    status: (post.status === 'published' ? 'completed' : post.status === 'draft' ? 'draft' : 'active') as ReviewCampaignDTO['status'],
    sentCount: 0,
    responseCount: 0,
  }));
  return { success: true, data: campaigns };
}

/**
 * Retrieve a single review campaign by its identifier.
 * @param tenantId - The unique identifier of the tenant.
 * @param campaignId - The unique identifier of the campaign.
 * @returns The campaign details, or null if not found.
 */
export async function getCampaign(tenantId: string, campaignId: string): Promise<ApiResponse<ReviewCampaignDTO | null>> {
  const post = await db.contentQueries.getPost(tenantId, campaignId);
  if (!post) return { success: true, data: null };
  const campaign: ReviewCampaignDTO = {
    id: post.id,
    name: post.email_subject ?? post.caption ?? 'Untitled Campaign',
    status: (post.status === 'published' ? 'completed' : post.status === 'draft' ? 'draft' : 'active') as ReviewCampaignDTO['status'],
    sentCount: 0,
    responseCount: 0,
  };
  return { success: true, data: campaign };
}

/**
 * Create a new review campaign for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @param data - The campaign definition fields.
 * @returns The newly created campaign in draft status.
 */
export async function createCampaign(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<ReviewCampaignDTO>> {
  const result = await db.contentQueries.createPost(tenantId, { ...data, content_type: 'email', status: 'draft' });
  const campaign: ReviewCampaignDTO = {
    id: result.id,
    name: result.email_subject ?? result.caption ?? 'Untitled Campaign',
    status: 'draft',
    sentCount: 0,
    responseCount: 0,
  };
  return { success: true, data: campaign };
}

/**
 * Launch an existing draft review campaign, making it active.
 * @param tenantId - The unique identifier of the tenant.
 * @param campaignId - The unique identifier of the campaign to launch.
 * @returns The launch result with updated status.
 */
export async function launchCampaign(tenantId: string, campaignId: string): Promise<ApiResponse<{ success: boolean; status: string }>> {
  await db.contentQueries.updatePost(tenantId, campaignId, { status: 'published', published_at: new Date().toISOString() });
  const post = await db.contentQueries.getPost(tenantId, campaignId);
  const campaign: ReviewCampaignDTO = post
    ? {
        id: post.id,
        name: post.email_subject ?? post.caption ?? 'Untitled Campaign',
        status: (post.status === 'published' ? 'completed' : post.status === 'draft' ? 'draft' : 'active') as ReviewCampaignDTO['status'],
        sentCount: 0,
        responseCount: 0,
      }
    : { id: campaignId, name: 'Campaign', status: 'active' as const, sentCount: 0, responseCount: 0 };
  return { success: true, data: { success: true, status: campaign.status } };
}
