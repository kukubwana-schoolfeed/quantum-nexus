import * as db from '@/lib/db';
import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { PodcastEpisodeDTO } from '@/lib/api/schema';

/** @module ugc-podcast-support @description Handles podcast episode upload, storage, and retrieval for tenants who produce long-form audio content alongside UGC clips */

/**
 * Retrieves a list of podcast episodes for the tenant.
 * @param tenantId - The tenant's UUID from the authenticated session
 * @param params - Query and filter parameters such as page, pageSize, and status
 * @returns Promise resolving to an array of podcast episode objects
 */
export async function getEpisodes(tenantId: string, params: Record<string, unknown>): Promise<ApiResponse<PodcastEpisodeDTO[]>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Uploads a new podcast episode and begins processing.
 * @param tenantId - The tenant's UUID from the authenticated session
 * @param data - Upload payload including title, fileName, r2Url, and duration
 * @returns Promise resolving to the newly created episode with its ID and processing status
 */
export async function uploadEpisode(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<PodcastEpisodeDTO>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Retrieves a single podcast episode by its ID.
 * @param tenantId - The tenant's UUID from the authenticated session
 * @param episodeId - The episode's unique identifier
 * @returns Promise resolving to the episode object or null if not found
 */
export async function getEpisode(tenantId: string, episodeId: string): Promise<ApiResponse<PodcastEpisodeDTO | null>> {
  throw internalError('INTEGRATION_PENDING');
}
