import * as db from '@/lib/db';
import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { ThumbnailDTO } from '@/lib/api/schema';

/** @module faceless-thumbnail-generator @description Faceless channel thumbnail generation — listing, AI generation, and style options */

/**
 * Retrieve all generated thumbnails for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to a list of thumbnails with URLs and metadata
 */
export async function getThumbnails(tenantId: string): Promise<ApiResponse<ThumbnailDTO[]>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * AI-generate a new thumbnail for an episode or scene.
 * @param tenantId - The unique identifier of the tenant
 * @param data - The generation parameters including episodeId, style, and prompt
 * @returns Promise resolving to the newly generated thumbnail with its id and URL
 */
export async function generateThumbnail(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<ThumbnailDTO>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Retrieve available thumbnail style options for a specific episode.
 * @param tenantId - The unique identifier of the tenant
 * @param episodeId - The unique identifier of the episode
 * @returns Promise resolving to available thumbnail options and their count
 */
export async function getThumbnailOptions(tenantId: string, episodeId: string): Promise<ApiResponse<{ options: ThumbnailDTO[]; count: number }>> {
  throw internalError('INTEGRATION_PENDING');
}
