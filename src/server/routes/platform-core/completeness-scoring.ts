import * as db from '@/lib/db';
import { AppError, internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { CompletenessScoreDTO } from '@/lib/api/schema';

/** @module platform-core/completeness-scoring @description Calculates and returns the tenant's profile completeness score, broken down by section, along with feature-unlock gates that depend on reaching certain score thresholds. */

/**
 * Retrieves the current completeness score for the tenant,
 * including per-section breakdowns and feature unlock status.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @returns ApiResponse wrapping the score object with overall percentage, section breakdowns, and feature unlocks
 */
export async function getScore(tenantId: string): Promise<ApiResponse<CompletenessScoreDTO>> {
  try {
    const result = await db.businessQueries.getCompletenessScore(tenantId);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('COMPLETENESS_SCORE_FETCH_FAILED');
  }
}

/**
 * Triggers a full recalculation of the tenant's completeness score
 * by re-evaluating every section against the latest stored data.
 * Currently returns the same result as getScore (trigger-based
 * recalculation logic will be added later).
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @returns ApiResponse wrapping the updated score object after recalculation
 */
export async function recalculate(tenantId: string): Promise<ApiResponse<CompletenessScoreDTO>> {
  try {
    const result = await db.businessQueries.getCompletenessScore(tenantId);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('COMPLETENESS_RECALCULATE_FAILED');
  }
}
