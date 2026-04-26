import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { ClientHealthScoreDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module client-health-score @description Client health score aggregation, live computation from component data, historical trend tracking, and manual recalculation. Component weights: SEO 30%, Content 25%, Reviews 20%, Social 15%, Entity 10%. */

/**
 * Retrieves the current health score for a tenant.
 * If no score has been computed yet, returns a zeroed default.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to the health score data
 */
export async function getScore(tenantId: string): Promise<ApiResponse<ClientHealthScoreDTO>> {
  const result = await db.dominationQueries.getLatestClientHealthScore(tenantId);

  if (!result) {
    return {
      success: true,
      data: {
        totalScore: 0,
        trend: 'stable',
        seoScore: 0,
        contentScore: 0,
        reviewScore: 0,
        socialScore: 0,
        entityScore: 0,
        retentionScore: 0,
        topRecommendations: [],
      },
    };
  }

  return { success: true, data: result };
}

/**
 * Retrieves historical health score data for a tenant based on optional
 * filter parameters. Results are ordered by score_date descending.
 * @param tenantId - The unique identifier of the tenant
 * @param params - Optional filter and pagination parameters
 * @returns Promise resolving to the health score history entries
 */
export async function getHistory(tenantId: string, params: Record<string, unknown>): Promise<ApiResponse<Array<ClientHealthScoreDTO & { date: string }>>> {
  const supabase = db.getSupabaseAdmin();
  const page = Number(params?.page) || 1;
  const pageSize = Number(params?.pageSize) || 20;
  const from = (page - 1) * pageSize;
  const to = page * pageSize - 1;

  const { data } = await supabase
    .from('client_health_scores')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('score_date', { ascending: false })
    .range(from, to);

  const rows = (data ?? []) as db.ClientHealthScoreRow[];
  const history: Array<ClientHealthScoreDTO & { date: string }> = rows.map(row => ({
    totalScore: row.total_score,
    trend: row.trend ?? 'stable',
    seoScore: row.seo_score,
    contentScore: row.content_score,
    reviewScore: row.review_score,
    socialScore: row.social_score,
    entityScore: row.entity_score,
    retentionScore: row.retention_score,
    topRecommendations: row.top_recommendations,
    date: row.score_date,
  }));

  return { success: true, data: history };
}

/**
 * Recalculates the client health score from live data across all
 * component tables (indexed_pages, seo_tasks, content_posts,
 * business_audits, trends, entity_listings) and persists the result.
 *
 * Component scoring logic:
 *   - SEO (30% weight): indexed page count progress + SEO task completion rate
 *   - Content (25% weight): published post count + average algorithm score
 *   - Reviews (20% weight): average rating from latest audit + review count
 *   - Social (15% weight): active trend count + trend usage rate
 *   - Entity (10% weight): listing consistency ratio
 *
 * Trend detection: compares new score against previous score.
 *   - delta > +3 → 'improving'
 *   - delta < -3 → 'declining'
 *   - otherwise → 'stable'
 *
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to the freshly computed health score
 */
export async function recalculate(tenantId: string): Promise<ApiResponse<ClientHealthScoreDTO>> {
  const result = await db.dominationQueries.computeAndPersistHealthScore(tenantId);
  return { success: true, data: result };
}

/**
 * Batch-recalculates health scores for all active tenants.
 * Intended to be called by a scheduled job (Worker 4) on a daily cadence.
 * Returns a summary of how many scores were computed vs skipped.
 *
 * @param params - Optional filters (e.g. only tenants with active status)
 * @returns Promise resolving to a summary of the batch computation
 */
export async function batchRecalculate(
  params?: Record<string, unknown>,
): Promise<ApiResponse<{ computed: number; skipped: number; errors: number }>> {
  const supabase = db.getSupabaseAdmin();

  // Get all active tenants
  let query = supabase
    .from('tenants')
    .select('id')
    .eq('status', 'active');

  if (params?.tier) {
    query = query.eq('tier', params.tier as string);
  }

  const { data: tenants, error: tenantError } = await query;

  if (tenantError) throw tenantError;

  let computed = 0;
  let skipped = 0;
  let errors = 0;

  for (const tenant of tenants ?? []) {
    try {
      await db.dominationQueries.computeAndPersistHealthScore(tenant.id);
      computed++;
    } catch {
      errors++;
    }
  }

  return { success: true, data: { computed, skipped, errors } };
}

/**
 * Returns the component breakdown for a tenant's current health score
 * with the weighted contribution of each component clearly shown.
 * Useful for the Mission Control panel and admin dashboards.
 *
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to the score breakdown with weights
 */
export async function getBreakdown(
  tenantId: string,
): Promise<ApiResponse<{
  totalScore: number;
  trend: string;
  components: Array<{
    name: string;
    score: number;
    weight: number;
    weightedContribution: number;
  }>;
  topRecommendations: string[];
}>> {
  const result = await db.dominationQueries.getLatestClientHealthScore(tenantId);

  const defaultComponents = [
    { name: 'SEO', score: 0, weight: 0.25, weightedContribution: 0 },
    { name: 'Content', score: 0, weight: 0.20, weightedContribution: 0 },
    { name: 'Reviews', score: 0, weight: 0.15, weightedContribution: 0 },
    { name: 'Social', score: 0, weight: 0.10, weightedContribution: 0 },
    { name: 'Entity', score: 0, weight: 0.10, weightedContribution: 0 },
    { name: 'Retention', score: 0, weight: 0.20, weightedContribution: 0 },
  ];

  if (!result) {
    return {
      success: true,
      data: {
        totalScore: 0,
        trend: 'stable',
        components: defaultComponents,
        topRecommendations: [],
      },
    };
  }

  const components = [
    { name: 'SEO', score: result.seoScore, weight: 0.25, weightedContribution: Math.round(result.seoScore * 0.25) },
    { name: 'Content', score: result.contentScore, weight: 0.20, weightedContribution: Math.round(result.contentScore * 0.20) },
    { name: 'Reviews', score: result.reviewScore, weight: 0.15, weightedContribution: Math.round(result.reviewScore * 0.15) },
    { name: 'Social', score: result.socialScore, weight: 0.10, weightedContribution: Math.round(result.socialScore * 0.10) },
    { name: 'Entity', score: result.entityScore, weight: 0.10, weightedContribution: Math.round(result.entityScore * 0.10) },
    { name: 'Retention', score: result.retentionScore, weight: 0.20, weightedContribution: Math.round(result.retentionScore * 0.20) },
  ];

  return {
    success: true,
    data: {
      totalScore: result.totalScore,
      trend: result.trend,
      components,
      topRecommendations: result.topRecommendations,
    },
  };
}
