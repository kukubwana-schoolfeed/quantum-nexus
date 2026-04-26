import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { NicheReviewDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module niche-research-review @description Admin review queue for niche research submissions awaiting approval */

/**
 * Retrieves all niche research submissions pending admin review.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @returns Promise resolving to array of pending niche reviews wrapped in an ApiResponse
 */
export async function getPendingReviews(
  adminUserId: string,
): Promise<ApiResponse<NicheReviewDTO[]>> {
  const result = await db.adminQueries.listNicheReviews();
  return { success: true, data: result };
}

/**
 * Approves a niche research submission, allowing it to proceed.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @param nicheId - The niche submission to approve
 * @returns Promise resolving to confirmation result wrapped in an ApiResponse
 */
export async function approveNiche(
  adminUserId: string,
  nicheId: string,
): Promise<ApiResponse<ActionConfirmationDTO>> {
  await db.adminQueries.approveNiche(nicheId);
  return { success: true, data: { success: true, message: 'Niche approved' } };
}

/**
 * Rejects a niche research submission with a reason.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @param nicheId - The niche submission to reject
 * @param reason - Justification for the rejection
 * @returns Promise resolving to confirmation result wrapped in an ApiResponse
 */
export async function rejectNiche(
  adminUserId: string,
  nicheId: string,
  reason: string,
): Promise<ApiResponse<ActionConfirmationDTO>> {
  await db.adminQueries.rejectNiche(nicheId);
  return { success: true, data: { success: true, message: 'Niche rejected' } };
}
