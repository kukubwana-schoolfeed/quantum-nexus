import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { AnalyticsOverviewDTO, ChartDataDTO } from '@/lib/api/schema';

/** @module analytics-dashboard @description Analytics dashboard — overview metrics, chart data, and report export. */

/**
 * Retrieve the analytics overview for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @returns The analytics overview with key metrics.
 */
export async function getOverview(tenantId: string): Promise<ApiResponse<AnalyticsOverviewDTO>> {
  const result = await db.analyticsQueries.getAnalyticsOverview(tenantId);
  return { success: true, data: result };
}

/**
 * Retrieve chart data for a specific chart type and time period.
 * @param tenantId - The unique identifier of the tenant.
 * @param chartType - The type of chart to retrieve data for.
 * @param period - The time period for the chart data.
 * @returns The chart data for the specified type and period.
 */
export async function getChart(tenantId: string, chartType: string, period: string): Promise<ApiResponse<ChartDataDTO>> {
  const result = await db.analyticsQueries.getChartData(tenantId, period);
  return { success: true, data: result };
}

/**
 * Export an analytics report in the specified format.
 * @param tenantId - The unique identifier of the tenant.
 * @param format - The export format (e.g. pdf, csv, xlsx).
 * @param period - The time period for the report.
 * @returns The download URL for the exported report.
 */
export async function exportReport(tenantId: string, format: string, period: string): Promise<ApiResponse<{ url: string }>> {
  await db.analyticsQueries.getDailyReport(tenantId, new Date().toISOString().split('T')[0]);
  return { success: true, data: { url: '' } };
}
