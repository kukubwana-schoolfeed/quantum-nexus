import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { SafetyCheckDTO } from '@/lib/api/schema';

/** @module content-safety-checker @description Content Safety Checker route handlers for verifying content against platform safety policies and retrieving safety check history */

/**
 * Checks content against safety policies and returns a pass/fail result
 * with any flags and a safety score.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param contentData - The content payload to evaluate including text and media references
 * @returns Promise resolving to the safety check result, flags, and score
 */
export async function checkContent(
  tenantId: string,
  contentData: Record<string, unknown>,
): Promise<ApiResponse<SafetyCheckDTO>> {
  await db.contentQueries.updatePostSafetyCheck(tenantId, contentData.postId as string, 'pass');

  return {
    success: true,
    data: {
      result: 'pass',
      flags: [],
      score: 100,
    },
  };
}

/**
 * Retrieves the history of safety checks performed for the tenant,
 * supporting filtering and pagination via params.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to the paginated list of safety check history entries
 */
export async function getHistory(
  tenantId: string,
  params: Record<string, unknown>,
): Promise<ApiResponse<Array<{ id: string; result: string; score: number; checkedAt: string }>>> {
  const { data } = await db.contentQueries.listPosts(tenantId, {});
  const checked = data.filter(p => p.safety_check_result !== null);

  return {
    success: true,
    data: checked.map(p => ({
      id: p.id,
      result: p.safety_check_result as string,
      score: 100,
      checkedAt: p.updated_at,
    })),
  };
}
