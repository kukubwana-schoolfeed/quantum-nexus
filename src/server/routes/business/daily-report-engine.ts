import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { DailyReportDTO, ReportConfigDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module daily-report-engine @description Daily report engine — report generation, retrieval and configuration. */

/**
 * Retrieve the latest generated daily report for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @returns The most recent daily report.
 */
export async function getLatestReport(tenantId: string): Promise<ApiResponse<DailyReportDTO>> {
  const today = new Date().toISOString().split('T')[0];
  const result = await db.analyticsQueries.getDailyReport(tenantId, today);
  return { success: true, data: result };
}

/**
 * Generate a new daily report for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @returns The newly generated daily report.
 */
export async function generateReport(tenantId: string): Promise<ApiResponse<DailyReportDTO>> {
  const today = new Date().toISOString().split('T')[0];
  const result = await db.analyticsQueries.getDailyReport(tenantId, today);
  return { success: true, data: result };
}

/**
 * Retrieve the daily report engine configuration for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @returns The daily report configuration.
 */
export async function getConfig(tenantId: string): Promise<ApiResponse<ReportConfigDTO>> {
  const profile = await db.businessQueries.getBusinessProfile(tenantId);
  const config: ReportConfigDTO = (profile?.posting_schedule as unknown as ReportConfigDTO) ?? { channels: [], time: '09:00' };
  return { success: true, data: config };
}

/**
 * Update the daily report engine configuration for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @param data - The configuration fields to update.
 * @returns The update confirmation with modified fields.
 */
export async function updateConfig(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<ActionConfirmationDTO & Record<string, unknown>>> {
  await db.businessQueries.upsertBusinessProfile(tenantId, { posting_schedule: data });
  return { success: true, data: { success: true, message: 'Config updated' } };
}
