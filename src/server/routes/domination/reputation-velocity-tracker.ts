import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { ReputationVelocityDTO } from '@/lib/api/schema';

/** @module reputation-velocity-tracker @description Reputation velocity metrics and historical trend routes */

/**
 * Retrieves the current reputation velocity metrics for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to the velocity data
 */
export async function getVelocity(tenantId: string): Promise<ApiResponse<ReputationVelocityDTO>> {
  const result = await db.dominationQueries.getLatestReputationVelocity(tenantId);

  if (!result) {
    return {
      success: true,
      data: {
        velocityScore: 0,
        velocityTrend: 'stable',
        newBacklinks: 0,
        newIndexedPages: 0,
        newReviews: 0,
        netNewFollowers: 0,
        gscImpressionsGrowth: 0,
      },
    };
  }

  return { success: true, data: result };
}

/**
 * Retrieves historical reputation velocity data for a tenant based on optional filter parameters.
 * @param tenantId - The unique identifier of the tenant
 * @param params - Optional filter and pagination parameters
 * @returns Promise resolving to the velocity history entries
 */
export async function getHistory(tenantId: string, params: Record<string, unknown>): Promise<ApiResponse<Array<ReputationVelocityDTO & { weekStart: string }>>> {
  const supabase = db.getSupabaseAdmin();
  const page = Number(params?.page) || 1;
  const pageSize = Number(params?.pageSize) || 20;
  const from = (page - 1) * pageSize;
  const to = page * pageSize - 1;

  const { data } = await supabase
    .from('reputation_velocity')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('week_start', { ascending: false })
    .range(from, to);

  const rows = (data ?? []) as db.ReputationVelocityRow[];
  const history: Array<ReputationVelocityDTO & { weekStart: string }> = rows.map(row => ({
    velocityScore: row.velocity_score,
    velocityTrend: row.velocity_trend ?? 'stable',
    newBacklinks: row.new_backlinks,
    newIndexedPages: row.new_indexed_pages,
    newReviews: row.new_reviews,
    netNewFollowers: row.net_new_followers,
    gscImpressionsGrowth: Number(row.gsc_impressions_growth),
    weekStart: row.week_start,
  }));

  return { success: true, data: history };
}
