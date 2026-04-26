import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { AppSubmissionDTO } from '@/lib/api/schema';

/** @module app-publishing-pipeline @description Admin review and moderation of app submissions before publishing */

/**
 * Maps a TenantRow to an AppSubmissionDTO.
 * @param tenant - The tenant row to map
 * @returns The mapped AppSubmissionDTO
 */
function mapToAppSubmissionDTO(tenant: db.TenantRow): AppSubmissionDTO {
  return {
    id: tenant.id,
    appId: tenant.id,
    appName: tenant.business_name,
    submittedAt: tenant.created_at,
    reviewerNotes: null,
    status: tenant.status as "approved" | "rejected" | "submitted",
  };
}

/**
 * Lists app submissions awaiting admin review with optional filters.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @param params - Query and filter parameters such as page, pageSize, status, and search
 * @returns Promise resolving to array of app submission summaries wrapped in an ApiResponse
 */
export async function getSubmissions(
  adminUserId: string,
  params: Record<string, unknown>,
): Promise<ApiResponse<AppSubmissionDTO[]>> {
  const supabase = db.getSupabaseAdmin();
  const { data } = await supabase
    .from('tenants')
    .select('id, business_name, created_at, status')
    .eq('user_type', 'app_developer');

  const submissions: AppSubmissionDTO[] = (data ?? []).map(row => ({
    id: row.id,
    appId: row.id,
    appName: row.business_name,
    submittedAt: row.created_at,
    status: row.status as "approved" | "rejected" | "submitted",
    reviewerNotes: null,
  }));

  return { success: true, data: submissions };
}

/**
 * Retrieves full details for a single app submission.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @param submissionId - The submission to look up
 * @returns Promise resolving to submission details wrapped in an ApiResponse
 */
export async function getSubmission(
  adminUserId: string,
  submissionId: string,
): Promise<ApiResponse<AppSubmissionDTO | null>> {
  const tenant = await db.tenantQueries.getTenantById(submissionId);

  if (!tenant) {
    return { success: true, data: null };
  }

  return { success: true, data: mapToAppSubmissionDTO(tenant) };
}

/**
 * Approves an app submission for publishing.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @param submissionId - The submission to approve
 * @param notes - Admin notes or review comments
 * @returns Promise resolving to approval result wrapped in an ApiResponse
 */
export async function approveSubmission(
  adminUserId: string,
  submissionId: string,
  notes: string,
): Promise<ApiResponse<{ success: boolean; status: string }>> {
  const tenant = await db.tenantQueries.updateTenant(submissionId, { status: 'active' });

  return {
    success: true,
    data: {
      success: true,
      status: tenant.status,
    },
  };
}

/**
 * Rejects an app submission with a reason.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @param submissionId - The submission to reject
 * @param reason - Justification for the rejection
 * @returns Promise resolving to rejection result wrapped in an ApiResponse
 */
export async function rejectSubmission(
  adminUserId: string,
  submissionId: string,
  reason: string,
): Promise<ApiResponse<{ success: boolean; status: string }>> {
  const tenant = await db.tenantQueries.updateTenant(submissionId, { status: 'rejected' });

  return {
    success: true,
    data: {
      success: true,
      status: tenant.status,
    },
  };
}
