/**
 * Domination Module Queries
 * @module domination-queries
 * @description Typed Supabase query layer for all Domination-module tables:
 * business_audits, trends, entity_listings, reputation_velocity, and
 * client_health_scores. Every query enforces tenant_id filtering at the
 * application layer because the service role client bypasses RLS.
 */

import { getSupabaseAdmin } from '@/lib/db/client';
import type { BusinessAuditRow, TrendRow, EntityListingRow, ReputationVelocityRow, ClientHealthScoreRow } from '@/lib/db/types';
import type { BusinessAuditDTO, TrendDTO, TrendScanResultDTO, EntityListingDTO, EntityConsistencyDTO, ReputationVelocityDTO, ClientHealthScoreDTO, ActionConfirmationDTO } from '@/lib/api/schema';

// ─── Business Audits ──────────────────────────────────────────────────

/**
 * List business audits for a tenant, optionally filtered by audit_type.
 * Results are ordered by created_at descending.
 *
 * @param tenantId - The tenant to query audits for
 * @param params - Optional filters (supports audit_type)
 * @returns Array of BusinessAuditDTO objects
 * @throws Error if the Supabase query fails
 */
export async function listBusinessAudits(
  tenantId: string,
  params?: Record<string, unknown>,
): Promise<BusinessAuditDTO[]> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('business_audits')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (params?.audit_type) {
    query = query.eq('audit_type', params.audit_type as string);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data as BusinessAuditRow[]).map((row) => ({
    id: row.id,
    auditType: row.audit_type,
    domainAuthority: row.domain_authority ?? 0,
    totalIndexedPages: row.total_indexed_pages ?? 0,
    backlinkCount: row.backlink_count ?? 0,
    gscImpressions90d: row.gsc_impressions_90d ?? 0,
    gscClicks90d: row.gsc_clicks_90d ?? 0,
    gbpCompleteness: row.gbp_completeness ?? 0,
    reviewCount: row.review_count ?? 0,
    averageRating: row.average_rating ?? 0,
    socialPresence: row.social_presence,
    competitorData: row.competitor_data,
    recommendedPriority: row.recommended_priority ?? [],
    summary: row.summary ?? '',
    createdAt: row.created_at,
  }));
}

/**
 * Get the most recent business audit for a tenant.
 *
 * @param tenantId - The tenant to query the latest audit for
 * @returns The most recent BusinessAuditDTO, or null if none exists
 * @throws Error if the Supabase query fails
 */
export async function getLatestAudit(
  tenantId: string,
): Promise<BusinessAuditDTO | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('business_audits')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  const row = data as BusinessAuditRow;

  return {
    id: row.id,
    auditType: row.audit_type,
    domainAuthority: row.domain_authority ?? 0,
    totalIndexedPages: row.total_indexed_pages ?? 0,
    backlinkCount: row.backlink_count ?? 0,
    gscImpressions90d: row.gsc_impressions_90d ?? 0,
    gscClicks90d: row.gsc_clicks_90d ?? 0,
    gbpCompleteness: row.gbp_completeness ?? 0,
    reviewCount: row.review_count ?? 0,
    averageRating: row.average_rating ?? 0,
    socialPresence: row.social_presence,
    competitorData: row.competitor_data,
    recommendedPriority: row.recommended_priority ?? [],
    summary: row.summary ?? '',
    createdAt: row.created_at,
  };
}

/**
 * Create a new business audit record for a tenant.
 *
 * @param tenantId - The tenant the audit belongs to
 * @param data - Partial row data to insert (tenant_id is set automatically)
 * @returns The inserted BusinessAuditRow
 * @throws Error if the Supabase insert fails
 */
export async function createBusinessAudit(
  tenantId: string,
  data: Partial<BusinessAuditRow>,
): Promise<BusinessAuditRow> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('business_audits')
    .insert({ ...data, tenant_id: tenantId })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return row as BusinessAuditRow;
}

// ─── Trends ────────────────────────────────────────────────────────────

/**
 * List trends for a tenant, optionally filtered by status and platform.
 * Results are ordered by score descending.
 *
 * @param tenantId - The tenant to query trends for
 * @param params - Optional filters (supports status, platform)
 * @returns Array of TrendDTO objects
 * @throws Error if the Supabase query fails
 */
export async function listTrends(
  tenantId: string,
  params?: Record<string, unknown>,
): Promise<TrendDTO[]> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('trends')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('score', { ascending: false });

  if (params?.status) {
    query = query.eq('status', params.status as string);
  }

  if (params?.platform) {
    query = query.eq('platform', params.platform as string);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data as TrendRow[]).map((row) => ({
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
  }));
}

/**
 * Create a new trend record for a tenant.
 *
 * @param tenantId - The tenant the trend belongs to
 * @param data - Partial row data to insert (tenant_id is set automatically)
 * @returns The inserted TrendRow
 * @throws Error if the Supabase insert fails
 */
export async function createTrend(
  tenantId: string,
  data: Partial<TrendRow>,
): Promise<TrendRow> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('trends')
    .insert({ ...data, tenant_id: tenantId })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return row as TrendRow;
}

/**
 * Update the status of a trend. When an expiryReason is provided, expired_at
 * is set to the current timestamp and expiry_reason is persisted.
 *
 * @param tenantId - The tenant that owns the trend
 * @param trendId - The ID of the trend to update
 * @param status - The new status value
 * @param expiryReason - Optional reason for the status change / expiry
 * @returns ActionConfirmationDTO indicating success or failure
 * @throws Error if the Supabase update fails
 */
export async function updateTrendStatus(
  tenantId: string,
  trendId: string,
  status: string,
  expiryReason?: string,
): Promise<ActionConfirmationDTO> {
  const supabase = getSupabaseAdmin();

  const update: Record<string, unknown> = { status };

  if (expiryReason !== undefined) {
    update.expired_at = new Date().toISOString();
    update.expiry_reason = expiryReason;
  }

  const { error } = await supabase
    .from('trends')
    .update(update)
    .eq('tenant_id', tenantId)
    .eq('id', trendId);

  if (error) {
    throw error;
  }

  return { success: true, message: 'Trend status updated' };
}

/**
 * Scan for new trends and transition stale NEW trends to ACTIVE.
 * Inserts all provided new trends, then updates any NEW trends older than
 * 24 hours to ACTIVE status.
 *
 * @param tenantId - The tenant to scan trends for
 * @param newTrends - Array of partial trend rows to insert
 * @returns TrendScanResultDTO with counts of inserted and updated trends
 * @throws Error if any Supabase operation fails
 */
export async function scanAndUpdateTrends(
  tenantId: string,
  newTrends: Partial<TrendRow>[],
): Promise<TrendScanResultDTO> {
  const supabase = getSupabaseAdmin();

  let insertedCount = 0;

  if (newTrends.length > 0) {
    const rowsToInsert = newTrends.map((t) => ({ ...t, tenant_id: tenantId }));

    const { data: inserted, error: insertError } = await supabase
      .from('trends')
      .insert(rowsToInsert)
      .select();

    if (insertError) {
      throw insertError;
    }

    insertedCount = inserted.length;
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: updated, error: updateError } = await supabase
    .from('trends')
    .update({ status: 'ACTIVE' })
    .eq('tenant_id', tenantId)
    .eq('status', 'NEW')
    .lt('detected_at', twentyFourHoursAgo)
    .select();

  if (updateError) {
    throw updateError;
  }

  const updatedCount = updated?.length ?? 0;

  return {
    newTrendsFound: insertedCount,
    trendsUpdated: updatedCount,
  };
}

// ─── Entity Listings ──────────────────────────────────────────────────

/**
 * List entity listings (directory citations) for a tenant, optionally
 * filtered by status.
 *
 * @param tenantId - The tenant to query listings for
 * @param params - Optional filters (supports status)
 * @returns Array of EntityListingDTO objects
 * @throws Error if the Supabase query fails
 */
export async function listEntityListings(
  tenantId: string,
  params?: Record<string, unknown>,
): Promise<EntityListingDTO[]> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('entity_listings')
    .select('*')
    .eq('tenant_id', tenantId);

  if (params?.status) {
    query = query.eq('status', params.status as string);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data as EntityListingRow[]).map((row) => ({
    id: row.id,
    directoryName: row.directory_name,
    directoryUrl: row.directory_url,
    listingUrl: row.listing_url,
    status: row.status,
    isConsistent: row.is_consistent,
    submittedName: row.submitted_name,
    submittedAddress: row.submitted_address,
    submittedPhone: row.submitted_phone,
  }));
}

/**
 * Create a new entity listing record for a tenant.
 *
 * @param tenantId - The tenant the listing belongs to
 * @param data - Partial row data to insert (tenant_id is set automatically)
 * @returns The inserted EntityListingRow
 * @throws Error if the Supabase insert fails
 */
export async function createEntityListing(
  tenantId: string,
  data: Partial<EntityListingRow>,
): Promise<EntityListingRow> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('entity_listings')
    .insert({ ...data, tenant_id: tenantId })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return row as EntityListingRow;
}

/**
 * Update an existing entity listing for a tenant.
 *
 * @param tenantId - The tenant that owns the listing
 * @param listingId - The ID of the listing to update
 * @param data - Partial row data to apply
 * @returns The updated EntityListingRow
 * @throws Error if the Supabase update fails
 */
export async function updateEntityListing(
  tenantId: string,
  listingId: string,
  data: Partial<EntityListingRow>,
): Promise<EntityListingRow> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('entity_listings')
    .update(data)
    .eq('tenant_id', tenantId)
    .eq('id', listingId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return row as EntityListingRow;
}

/**
 * Compute entity consistency counts for a tenant.
 * Counts listings grouped by is_consistent: true (consistent),
 * false (inconsistent), and null (pending review).
 *
 * @param tenantId - The tenant to check consistency for
 * @returns EntityConsistencyDTO with consistent, inconsistent, and pending counts
 * @throws Error if any Supabase query fails
 */
export async function getEntityConsistency(
  tenantId: string,
): Promise<EntityConsistencyDTO> {
  const supabase = getSupabaseAdmin();

  const [consistentResult, inconsistentResult, pendingResult] = await Promise.all([
    supabase
      .from('entity_listings')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_consistent', true),
    supabase
      .from('entity_listings')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_consistent', false),
    supabase
      .from('entity_listings')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .is('is_consistent', null),
  ]);

  if (consistentResult.error) throw consistentResult.error;
  if (inconsistentResult.error) throw inconsistentResult.error;
  if (pendingResult.error) throw pendingResult.error;

  return {
    consistent: consistentResult.count ?? 0,
    inconsistent: inconsistentResult.count ?? 0,
    pending: pendingResult.count ?? 0,
  };
}

// ─── Reputation Velocity ──────────────────────────────────────────────

/**
 * Get the most recent reputation velocity snapshot for a tenant.
 *
 * @param tenantId - The tenant to query velocity for
 * @returns The most recent ReputationVelocityDTO, or null if none exists
 * @throws Error if the Supabase query fails
 */
export async function getLatestReputationVelocity(
  tenantId: string,
): Promise<ReputationVelocityDTO | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('reputation_velocity')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  const row = data as ReputationVelocityRow;

  return {
    velocityScore: row.velocity_score,
    velocityTrend: row.velocity_trend ?? 'stable',
    newBacklinks: row.new_backlinks,
    newIndexedPages: row.new_indexed_pages,
    newReviews: row.new_reviews,
    netNewFollowers: row.net_new_followers,
    gscImpressionsGrowth: Number(row.gsc_impressions_growth),
  };
}

// ─── Client Health Scores ──────────────────────────────────────────────

/**
 * Get the most recent client health score for a tenant.
 *
 * @param tenantId - The tenant to query health score for
 * @returns The most recent ClientHealthScoreDTO, or null if none exists
 * @throws Error if the Supabase query fails
 */
export async function getLatestClientHealthScore(
  tenantId: string,
): Promise<ClientHealthScoreDTO | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('client_health_scores')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  const row = data as ClientHealthScoreRow;

  return {
    totalScore: row.total_score,
    trend: row.trend ?? 'stable',
    seoScore: row.seo_score,
    contentScore: row.content_score,
    reviewScore: row.review_score,
    socialScore: row.social_score,
    entityScore: row.entity_score,
    retentionScore: row.retention_score,
    topRecommendations: row.top_recommendations,
  };
}

/**
 * Create a new client health score record for a tenant.
 *
 * @param tenantId - The tenant the health score belongs to
 * @param data - Partial row data to insert (tenant_id is set automatically)
 * @returns The inserted ClientHealthScoreRow
 * @throws Error if the Supabase insert fails
 */
export async function createClientHealthScore(
  tenantId: string,
  data: Partial<ClientHealthScoreRow>,
): Promise<ClientHealthScoreRow> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('client_health_scores')
    .insert({ ...data, tenant_id: tenantId })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return row as ClientHealthScoreRow;
}

/**
 * Compute and persist a new client health score by aggregating component
 * data from across the platform. Uses weighted scoring:
 *   - SEO (30%): indexed pages count + SEO task completion rate
 *   - Content (25%): published posts count + algorithm scores
 *   - Reviews (20%): average rating + review count
 *   - Social (15%): trend usage + active trends
 *   - Entity (10%): listing consistency
 *
 * @param tenantId - The tenant to compute the health score for
 * @returns The computed and persisted ClientHealthScoreDTO
 */
export async function computeAndPersistHealthScore(
  tenantId: string,
): Promise<ClientHealthScoreDTO> {
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().split('T')[0];

  // Fetch all component data in parallel
  const [
    indexedPagesResult,
    seoTasksResult,
    contentPostsResult,
    auditResult,
    trendsResult,
    entityListingsResult,
    customersResult,
    previousScoreResult,
  ] = await Promise.all([
    supabase.from('indexed_pages').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('seo_tasks').select('status').eq('tenant_id', tenantId).eq('task_date', today),
    supabase.from('content_posts').select('algorithm_score, status').eq('tenant_id', tenantId),
    supabase.from('business_audits').select('average_rating, review_count').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(1),
    supabase.from('trends').select('status, times_used_in_content').eq('tenant_id', tenantId),
    supabase.from('entity_listings').select('is_consistent').eq('tenant_id', tenantId),
    supabase.from('customers').select('id, status, updated_at, loyalty_points').eq('tenant_id', tenantId),
    supabase.from('client_health_scores').select('total_score').eq('tenant_id', tenantId).order('score_date', { ascending: false }).limit(1),
  ]);

  if (indexedPagesResult.error) throw indexedPagesResult.error;
  if (seoTasksResult.error) throw seoTasksResult.error;
  if (contentPostsResult.error) throw contentPostsResult.error;
  if (auditResult.error) throw auditResult.error;
  if (trendsResult.error) throw trendsResult.error;
  if (entityListingsResult.error) throw entityListingsResult.error;
  if (customersResult.error) throw customersResult.error;
  if (previousScoreResult.error) throw previousScoreResult.error;

  // ── SEO Score (0-100) ──
  const indexedPagesCount = indexedPagesResult.count ?? 0;
  const seoTasks = seoTasksResult.data ?? [];
  const seoTasksComplete = seoTasks.filter((t: { status: string }) => t.status === 'complete').length;
  const seoTaskRate = seoTasks.length > 0 ? seoTasksComplete / seoTasks.length : 0;
  const seoScore = Math.min(100, Math.round(
    Math.min(indexedPagesCount / 20, 1) * 60 + seoTaskRate * 40
  ));

  // ── Content Score (0-100) ──
  const contentPosts = contentPostsResult.data ?? [];
  const publishedPosts = contentPosts.filter((p: { status: string }) => p.status === 'published');
  const scoredPosts = contentPosts.filter((p: { algorithm_score: number | null }) => p.algorithm_score !== null);
  const avgAlgorithmScore = scoredPosts.length > 0
    ? scoredPosts.reduce((sum: number, p: { algorithm_score: number | null }) => sum + (p.algorithm_score ?? 0), 0) / scoredPosts.length
    : 0;
  const contentScore = Math.min(100, Math.round(
    Math.min(publishedPosts.length / 30, 1) * 50 + (avgAlgorithmScore / 100) * 50
  ));

  // ── Review Score (0-100) ──
  const latestAudit = (auditResult.data ?? [])[0] as { average_rating: number | null; review_count: number | null } | undefined;
  const avgRating = latestAudit?.average_rating ?? 0;
  const reviewCount = latestAudit?.review_count ?? 0;
  const reviewScore = Math.min(100, Math.round(
    (avgRating / 5) * 60 + Math.min(reviewCount / 50, 1) * 40
  ));

  // ── Social Score (0-100) ──
  const trends = trendsResult.data ?? [];
  const activeTrends = trends.filter((t: { status: string }) => t.status === 'ACTIVE' || t.status === 'NEW');
  const usedTrends = trends.filter((t: { times_used_in_content: number }) => t.times_used_in_content > 0);
  const trendUsageRate = trends.length > 0 ? usedTrends.length / trends.length : 0;
  const socialScore = Math.min(100, Math.round(
    Math.min(activeTrends.length / 10, 1) * 40 + trendUsageRate * 60
  ));

  // ── Entity Score (0-100) ──
  const entityListings = entityListingsResult.data ?? [];
  const consistentListings = entityListings.filter((e: { is_consistent: boolean | null }) => e.is_consistent === true).length;
  const entityScore = entityListings.length > 0
    ? Math.round((consistentListings / entityListings.length) * 100)
    : 0;

  // ── Retention Score (0-100) ──
  const customers = customersResult.data ?? [];
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c: { status: string }) => c.status === 'active').length;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentlyActive = customers.filter((c: { status: string; updated_at: string }) =>
    c.status === 'active' && new Date(c.updated_at) >= thirtyDaysAgo,
  ).length;
  const activeRate = totalCustomers > 0 ? activeCustomers / totalCustomers : 0;
  const recencyRate = activeCustomers > 0 ? recentlyActive / activeCustomers : 0;
  const withLoyalty = customers.filter((c: { loyalty_points: number }) => c.loyalty_points > 0).length;
  const loyaltyRate = totalCustomers > 0 ? withLoyalty / totalCustomers : 0;
  const retentionScore = Math.min(100, Math.round(
    activeRate * 40 + recencyRate * 35 + loyaltyRate * 25
  ));

  // ── Composite (weighted) ──
  const totalScore = Math.round(
    seoScore * 0.25 +
    contentScore * 0.20 +
    reviewScore * 0.15 +
    socialScore * 0.10 +
    entityScore * 0.10 +
    retentionScore * 0.20
  );

  // ── Trend detection ──
  const previousScore = (previousScoreResult.data ?? [])[0] as { total_score: number } | undefined;
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (previousScore) {
    const delta = totalScore - previousScore.total_score;
    if (delta > 3) trend = 'improving';
    else if (delta < -3) trend = 'declining';
  }

  // ── Recommendations ──
  const recommendations: string[] = [];
  if (seoScore < 40) recommendations.push('Increase indexed pages and complete daily SEO tasks');
  if (contentScore < 40) recommendations.push('Publish more content and improve algorithm scores');
  if (reviewScore < 40) recommendations.push('Encourage customer reviews to boost ratings');
  if (socialScore < 40) recommendations.push('Use more detected trends in content creation');
  if (entityScore < 40) recommendations.push('Fix inconsistent business listings across directories');
  if (retentionScore < 40) recommendations.push('Re-engage inactive customers and grow loyalty participation');

  // ── Persist ──
  const { data: inserted, error: insertError } = await supabase
    .from('client_health_scores')
    .insert({
      tenant_id: tenantId,
      score_date: today,
      seo_score: seoScore,
      content_score: contentScore,
      review_score: reviewScore,
      social_score: socialScore,
      entity_score: entityScore,
      retention_score: retentionScore,
      total_score: totalScore,
      trend,
      top_recommendations: recommendations,
    })
    .select()
    .single();

  if (insertError) {
    // If duplicate date, update instead
    if (insertError.code === '23505') {
      await supabase
        .from('client_health_scores')
        .update({
          seo_score: seoScore,
          content_score: contentScore,
          review_score: reviewScore,
          social_score: socialScore,
          entity_score: entityScore,
          retention_score: retentionScore,
          total_score: totalScore,
          trend,
          top_recommendations: recommendations,
        })
        .eq('tenant_id', tenantId)
        .eq('score_date', today);
    } else {
      throw insertError;
    }
  }

  return {
    totalScore,
    trend,
    seoScore,
    contentScore,
    reviewScore,
    socialScore,
    entityScore,
    retentionScore,
    topRecommendations: recommendations,
  };
}
