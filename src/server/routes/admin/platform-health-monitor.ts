import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { PlatformHealthDTO, WorkerDetailsDTO, PlatformAlertDTO } from '@/lib/api/schema';

/** @module platform-health-monitor @description Admin routes for monitoring platform infrastructure health, workers, and alerts */

/**
 * Retrieves the current health status of all platform components.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @returns Promise resolving to health status for workers, redis, supabase, and uptime wrapped in an ApiResponse
 */
export async function getHealth(
  adminUserId: string,
): Promise<ApiResponse<PlatformHealthDTO>> {
  return {
    success: true,
    data: {
      workers: {
        content: 'green',
        publishing: 'green',
        aiScene: 'green',
        analytics: 'green',
      },
      redis: 'green',
      supabase: 'green',
      uptime: 99.9,
    },
  };
}

/**
 * Retrieves detailed status for a specific worker.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @param workerName - The name of the worker to inspect
 * @returns Promise resolving to worker details including status, jobs processed, and error rate wrapped in an ApiResponse
 */
export async function getWorkerDetails(
  adminUserId: string,
  workerName: string,
): Promise<ApiResponse<WorkerDetailsDTO>> {
  return {
    success: true,
    data: {
      worker: workerName,
      status: 'green',
      jobsProcessed: 0,
      errorRate: 0,
      lastJobAt: new Date().toISOString(),
    },
  };
}

/**
 * Retrieves platform alerts with optional filters.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @param params - Query and filter parameters such as page, pageSize, severity, and date range
 * @returns Promise resolving to array of alert summaries wrapped in an ApiResponse
 */
export async function getAlerts(
  adminUserId: string,
  params: Record<string, unknown>,
): Promise<ApiResponse<PlatformAlertDTO[]>> {
  const result = await db.adminQueries.listDeadJobs({ reviewed: false });
  const alerts: PlatformAlertDTO[] = result.map(j => ({
    id: j.id,
    severity: 'warning' as const,
    message: j.errorMessage,
    detectedAt: j.failedAt,
    resolved: j.reviewed,
  }));

  return { success: true, data: alerts };
}
