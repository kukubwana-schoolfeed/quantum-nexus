import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { TrendDTO, TrendScanResultDTO } from '@/lib/api/schema';

/** @module trend-intelligence-engine @description Trend scanning, retrieval, and lifecycle management routes */

/**
 * Retrieves trends for a tenant based on optional filter parameters.
 * @param tenantId - The unique identifier of the tenant
 * @param params - Optional filter and pagination parameters
 * @returns Promise resolving to the list of trends
 */
export async function getTrends(tenantId: string, params: Record<string, unknown>): Promise<ApiResponse<TrendDTO[]>> {
  try {
    const result = await db.dominationQueries.listTrends(tenantId, params);
    return { success: true, data: result };
  } catch (error) {
    console.error('[trend-intelligence] getTrends failed:', error);
    return { success: true, data: [] };
  }
}

/**
 * Retrieves a single trend by its identifier.
 * @param tenantId - The unique identifier of the tenant
 * @param trendId - The unique identifier of the trend
 * @returns Promise resolving to the trend data or null if not found
 */
export async function getTrend(tenantId: string, trendId: string): Promise<ApiResponse<TrendDTO | null>> {
  const supabase = db.getSupabaseAdmin();
  const { data } = await supabase
    .from('trends')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', trendId)
    .single();

  if (!data) {
    return { success: true, data: null };
  }

  const row = data as db.TrendRow;
  const trend: TrendDTO = {
    id: row.id,
    trendType: row.trend_type,
    trendText: row.trend_text,
    platform: row.platform,
    score: row.score,
    status: row.status,
    detectedAt: row.detected_at,
    expiredAt: row.expired_at,
    expiryReason: row.expiry_reason,
    timesUsedInContent: row.times_used_in_content,
  };

  return { success: true, data: trend };
}

/**
 * Flags a trend as expired with a given reason.
 * @param tenantId - The unique identifier of the tenant
 * @param trendId - The unique identifier of the trend to flag
 * @param reason - The reason the trend is being flagged as expired
 * @returns Promise resolving to the flag result with success and status
 */
export async function flagExpired(tenantId: string, trendId: string, reason: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
  await db.dominationQueries.updateTrendStatus(tenantId, trendId, 'EXPIRED', reason);
  return { success: true, data: { success: true, message: 'Trend flagged as expired' } };
}

/**
 * Triggers an immediate trend scan for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to the scan results
 */
export async function scanNow(tenantId: string): Promise<ApiResponse<TrendScanResultDTO>> {
  const result = await db.dominationQueries.scanAndUpdateTrends(tenantId, []);
  return { success: true, data: result };
}
