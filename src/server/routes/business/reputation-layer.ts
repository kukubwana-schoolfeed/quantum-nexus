import * as db from '@/lib/db';
import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { ReputationOverviewDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module reputation-layer @description Online reputation management — overview metrics, review listing, and response submission. */

/**
 * Retrieve the reputation overview metrics for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @returns Aggregate metrics including average rating, total reviews, and response rate.
 */
export async function getOverview(tenantId: string): Promise<ApiResponse<ReputationOverviewDTO>> {
  const audit = await db.dominationQueries.getLatestAudit(tenantId);
  const data: ReputationOverviewDTO = {
    averageRating: audit?.averageRating ?? 0,
    totalReviews: audit?.reviewCount ?? 0,
    responseRate: 0,
  };
  return { success: true, data };
}

/**
 * Retrieve reviews for a tenant with optional filtering and pagination.
 * @param tenantId - The unique identifier of the tenant.
 * @param params - Query parameters such as pagination, source filter, and rating filter.
 * @returns A list of reviews matching the query parameters.
 */
export async function getReviews(tenantId: string, params: Record<string, unknown>): Promise<ApiResponse<Array<{ id: string; author: string; rating: number; text: string; repliedAt: string | null }>>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Submit a response to a specific review.
 * @param tenantId - The unique identifier of the tenant.
 * @param reviewId - The unique identifier of the review to respond to.
 * @param response - The text of the response to the review.
 * @returns The confirmation of the response submission.
 */
export async function respondToReview(tenantId: string, reviewId: string, response: string): Promise<ApiResponse<ActionConfirmationDTO>> {
  throw internalError('INTEGRATION_PENDING');
}
