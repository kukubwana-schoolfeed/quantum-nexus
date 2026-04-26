import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { CommunityPostDTO, CommunityCommentDTO } from '@/lib/api/schema';

/** @module community-module @description Community module — posts, comments and community engagement. */

/**
 * Retrieve community posts for a tenant with optional filter parameters.
 * @param tenantId - The unique identifier of the tenant.
 * @param params - Optional filter and pagination parameters.
 * @returns A list of community posts.
 */
export async function getPosts(tenantId: string, params: Record<string, unknown>): Promise<ApiResponse<CommunityPostDTO[]>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Create a new community post for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @param data - The data for the new community post.
 * @returns The newly created community post.
 */
export async function createPost(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<CommunityPostDTO>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Retrieve comments for a specific community post.
 * @param tenantId - The unique identifier of the tenant.
 * @param postId - The unique identifier of the community post.
 * @param params - Optional filter and pagination parameters.
 * @returns A list of comments for the specified post.
 */
export async function getComments(tenantId: string, postId: string, params: Record<string, unknown>): Promise<ApiResponse<CommunityCommentDTO[]>> {
  throw internalError('INTEGRATION_PENDING');
}
