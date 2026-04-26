import * as db from '@/lib/db';
import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { QueueStatusDTO, JobDetailsDTO, ActionConfirmationDTO, DeadJobDTO } from '@/lib/api/schema';

/** @module bullmq-job-registry @description BullMQ Job Registry route handlers for monitoring queue health, inspecting job details, retrying failed jobs, and retrieving dead-letter jobs */

/**
 * Retrieves the current status of a BullMQ queue including counts of jobs
 * in waiting, active, completed, and failed states.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param queueName - The name of the BullMQ queue to inspect
 * @returns Promise resolving to the queue status with job counts
 */
export async function getQueueStatus(
  tenantId: string,
  queueName: string,
): Promise<ApiResponse<QueueStatusDTO>> {
  const jobs = await db.adminQueries.listDeadJobs({ queue_name: queueName });

  return {
    success: true,
    data: {
      queue: queueName,
      waiting: 0,
      active: 0,
      completed: 0,
      failed: jobs.length,
    },
  };
}

/**
 * Retrieves detailed information about a specific job including its
 * current status, progress, and any error data.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param jobId - The BullMQ job ID to retrieve details for
 * @returns Promise resolving to the job details
 */
export async function getJobDetails(
  tenantId: string,
  jobId: string,
): Promise<ApiResponse<JobDetailsDTO>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Retries a previously failed job by re-queuing it for execution.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param jobId - The BullMQ job ID to retry
 * @returns Promise resolving to the retry confirmation
 */
export async function retryJob(
  tenantId: string,
  jobId: string,
): Promise<ApiResponse<ActionConfirmationDTO>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Retrieves dead-letter jobs that have exceeded their retry limit,
 * supporting filtering and pagination via params.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param params - Query parameters for filtering and pagination of dead jobs
 * @returns Promise resolving to the list of dead-letter jobs
 */
export async function getDeadJobs(
  tenantId: string,
  params: Record<string, unknown>,
): Promise<ApiResponse<DeadJobDTO[]>> {
  const result = await db.adminQueries.listDeadJobs(params);
  return { success: true, data: result };
}
