import * as db from '@/lib/db';
import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { DeadJobDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module dead-job-monitor @description Admin routes for inspecting and managing dead/failed jobs */

/**
 * Lists dead (permanently failed) jobs with optional filters.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @param params - Query and filter parameters such as page, pageSize, queue name, and date range
 * @returns Promise resolving to array of dead job summaries wrapped in an ApiResponse
 */
export async function getDeadJobs(
  adminUserId: string,
  params: Record<string, unknown>,
): Promise<ApiResponse<DeadJobDTO[]>> {
  const result = await db.adminQueries.listDeadJobs(params);
  return { success: true, data: result };
}

/**
 * Retrieves full details for a single dead job.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @param jobId - The dead job to look up
 * @returns Promise resolving to dead job details wrapped in an ApiResponse
 */
export async function getDeadJob(
  adminUserId: string,
  jobId: string,
): Promise<ApiResponse<DeadJobDTO | null>> {
  const supabase = db.getSupabaseAdmin();
  const { data } = await supabase
    .from('dead_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (!data) {
    return { success: true, data: null };
  }

  const row = data as db.DeadJobRow;

  return {
    success: true,
    data: {
      id: row.id,
      tenantId: row.tenant_id,
      queueName: row.queue_name,
      jobType: row.job_type,
      errorMessage: row.error_message,
      failedAt: row.failed_at,
      reviewed: row.reviewed,
    },
  };
}

/**
 * Retries a dead job by re-enqueuing it for processing.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @param jobId - The dead job to retry
 * @returns Promise resolving to confirmation result wrapped in an ApiResponse
 */
export async function retryDeadJob(
  adminUserId: string,
  jobId: string,
): Promise<ApiResponse<ActionConfirmationDTO>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Dismisses a dead job, marking it as reviewed and removing it from the active dead-job list.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @param jobId - The dead job to dismiss
 * @param notes - Admin notes explaining the dismissal
 * @returns Promise resolving to confirmation result wrapped in an ApiResponse
 */
export async function dismissDeadJob(
  adminUserId: string,
  jobId: string,
  notes: string,
): Promise<ApiResponse<ActionConfirmationDTO>> {
  await db.adminQueries.reviewDeadJob(jobId, 'Dismissed by admin');
  return { success: true, data: { success: true, message: 'Dead job dismissed' } };
}
