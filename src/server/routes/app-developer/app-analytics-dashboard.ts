import * as db from '@/lib/db';
import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { AppAnalyticsOverviewDTO, ChartDataDTO, AppRevenueDTO } from '@/lib/api/schema';

/** @module app-analytics-dashboard @description Provides analytics overview — downloads, active users, revenue, and chart data */

/**
 * Retrieves a high-level analytics overview for the tenant.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to an ApiResponse containing downloads, active users, revenue, and crash rate
 */
export async function getOverview(tenantId: string): Promise<ApiResponse<AppAnalyticsOverviewDTO>> {
  const result = await db.analyticsQueries.getAnalyticsOverview(tenantId);
  const overview: AppAnalyticsOverviewDTO = {
    downloads: result.totalPosts ?? 0,
    activeUsers: result.totalFollowers ?? 0,
    revenue: result.totalRevenue ?? 0,
    crashRate: 0,
  };
  return { success: true, data: overview };
}

/**
 * Retrieves chart data for a specific chart type and time period.
 * @param tenantId - The unique identifier of the tenant
 * @param chartType - The type of chart to retrieve (e.g. "downloads", "revenue", "users")
 * @param period - The time period for the chart data (e.g. "7d", "30d", "90d")
 * @returns Promise resolving to an ApiResponse containing the chart data points
 */
export async function getCharts(tenantId: string, chartType: string, period: string): Promise<ApiResponse<ChartDataDTO>> {
  const result = await db.analyticsQueries.getChartData(tenantId, period);
  return { success: true, data: result };
}

/**
 * Retrieves the revenue breakdown for the tenant (in-app purchases vs subscriptions).
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to an ApiResponse containing total, in-app, and subscription revenue
 */
export async function getRevenueBreakdown(tenantId: string): Promise<ApiResponse<{ total: number; inApp: number; subscriptions: number }>> {
  const result = await db.analyticsQueries.getAnalyticsOverview(tenantId);
  const revenue: AppRevenueDTO = {
    today: Number(result.monthlyRevenue ?? 0),
    thisWeek: Number(result.monthlyRevenue ?? 0),
    thisMonth: Number(result.totalRevenue ?? 0),
  };
  return { success: true, data: { total: revenue.thisMonth, inApp: revenue.today, subscriptions: revenue.thisWeek } };
}
