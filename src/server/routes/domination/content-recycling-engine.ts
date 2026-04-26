import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { RecyclingCandidateDTO, IdReferenceDTO } from '@/lib/api/schema';

/** @module content-recycling-engine @description Content recycling candidate discovery and repurposing routes */

/**
 * Retrieves content recycling candidates for a tenant based on optional filter parameters.
 * @param tenantId - The unique identifier of the tenant
 * @param params - Optional filter and pagination parameters
 * @returns Promise resolving to the list of recycling candidates
 */
export async function getCandidates(tenantId: string, params: Record<string, unknown>): Promise<ApiResponse<RecyclingCandidateDTO[]>> {
  const { data } = await db.contentQueries.listPosts(tenantId, { status: 'published' });

  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  const candidates: RecyclingCandidateDTO[] = data
    .filter(p => p.published_at && (Date.now() - new Date(p.published_at).getTime()) > THIRTY_DAYS_MS)
    .map(p => ({
      postId: p.id,
      contentType: p.content_type,
      platform: p.platform ?? '',
      performanceScore: p.algorithm_score ?? 0,
      daysSincePublish: Math.floor((Date.now() - new Date(p.published_at!).getTime()) / (24 * 60 * 60 * 1000)),
      suggestedFormats: [],
    }));

  return { success: true, data: candidates };
}

/**
 * Recycles a specific content post into a new target format.
 * @param tenantId - The unique identifier of the tenant
 * @param postId - The unique identifier of the post to recycle
 * @param data - The recycling payload data
 * @returns Promise resolving to the id reference of the recycled content
 */
export async function recycleContent(tenantId: string, postId: string, data: Record<string, unknown>): Promise<ApiResponse<IdReferenceDTO>> {
  const original = await db.contentQueries.getPost(tenantId, postId);

  if (!original) {
    return { success: false, data: { id: '' } };
  }

  const result = await db.contentQueries.createPost(tenantId, {
    ...original,
    caption: original.caption,
    content_type: original.content_type,
    status: 'draft',
    recycled_from_id: postId,
  } as Partial<db.ContentPostRow>);

  return { success: true, data: { id: result.id } };
}

/**
 * Retrieves the recycling history for a tenant based on optional filter parameters.
 * @param tenantId - The unique identifier of the tenant
 * @param params - Optional filter and pagination parameters
 * @returns Promise resolving to the recycling history entries
 */
export async function getRecyclingHistory(tenantId: string, params: Record<string, unknown>): Promise<ApiResponse<IdReferenceDTO[]>> {
  const { data } = await db.contentQueries.listPosts(tenantId, {});
  const recycled = data.filter(p => p.recycled_from_id);
  const history: IdReferenceDTO[] = recycled.map(p => ({ id: p.id }));
  return { success: true, data: history };
}
