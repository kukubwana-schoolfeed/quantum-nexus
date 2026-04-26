import * as db from '@/lib/db';
import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { UgcTrendDTO } from '@/lib/api/schema';

/** @module ugc-trend-monitor @description Monitors platform-specific trends relevant to the tenant's niche and surfaces them for content ideation */

/**
 * Retrieves the current list of detected trends for the tenant's niche.
 * @param tenantId - The tenant's UUID from the authenticated session
 * @param params - Optional filter parameters such as status and platform
 * @returns Promise resolving to an array of trend objects with type, status, and relevance
 */
export async function getTrends(tenantId: string, params?: Record<string, unknown>): Promise<ApiResponse<UgcTrendDTO[]>> {
  const result = await db.dominationQueries.listTrends(tenantId, params);
  const trends: UgcTrendDTO[] = result.map((trend) => ({
    id: trend.id,
    trendType: trend.trendType,
    trendText: trend.trendText,
    platform: trend.platform ?? 'unknown',
    score: trend.score,
  }));
  return { success: true, data: trends };
}

/**
 * Triggers a scan for new trends across configured platforms.
 * @param tenantId - The tenant's UUID from the authenticated session
 * @returns Promise resolving to summary of the scan including count of newly detected trends
 */
export async function scanTrends(tenantId: string): Promise<ApiResponse<{ newTrends: number; trends: UgcTrendDTO[] }>> {
  throw internalError('INTEGRATION_PENDING');
}
