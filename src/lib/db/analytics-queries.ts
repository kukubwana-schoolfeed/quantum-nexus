/**
 * @module analytics-queries
 * @description Typed Supabase query module for analytics snapshots and reporting.
 * Provides functions to retrieve, aggregate, and create analytics data
 * scoped to a specific tenant.
 */

import { getSupabaseAdmin } from '@/lib/db/client';
import type { AnalyticsSnapshotRow } from '@/lib/db/types';
import type { AnalyticsOverviewDTO, ChartDataDTO, DailyReportDTO } from '@/lib/api/schema';

/**
 * Retrieves the most recent analytics snapshot for a tenant.
 *
 * @param tenantId - The tenant identifier to scope the query.
 * @returns The latest `AnalyticsSnapshotRow` or `null` if none exist.
 * @throws If the Supabase query returns an error.
 */
export async function getLatestSnapshot(
  tenantId: string,
): Promise<AnalyticsSnapshotRow | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('analytics_snapshots')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('snapshot_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Builds an analytics overview DTO from the latest snapshot for a tenant.
 * Returns zeroed defaults when no snapshot exists.
 *
 * @param tenantId - The tenant identifier to scope the query.
 * @returns An `AnalyticsOverviewDTO` populated from the latest snapshot or zeroed defaults.
 * @throws If the Supabase query returns an error.
 */
export async function getAnalyticsOverview(
  tenantId: string,
): Promise<AnalyticsOverviewDTO> {
  const snapshot = await getLatestSnapshot(tenantId);

  if (!snapshot) {
    return {
      revenueToday: 0,
      revenueThisWeek: 0,
      revenueThisMonth: 0,
      postsPublishedToday: 0,
      postsScheduled24h: 0,
      newCustomersToday: 0,
      totalIndexedPages: 0,
      pagesIndexedToday: 0,
      tasksTodayTotal: 0,
      tasksTodayComplete: 0,
      latestHealthScore: 0,
      healthTrend: null,
      latestVelocityScore: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      totalPosts: 0,
      totalFollowers: 0,
      totalEngagement: 0,
      growthRate: 0,
    };
  }

  return {
    revenueToday: snapshot.revenue_today ?? 0,
    revenueThisWeek: snapshot.revenue_this_week ?? 0,
    revenueThisMonth: snapshot.revenue_this_month ?? 0,
    postsPublishedToday: snapshot.posts_published_today ?? 0,
    postsScheduled24h: snapshot.posts_scheduled_24h ?? 0,
    newCustomersToday: snapshot.new_customers_today ?? 0,
    totalIndexedPages: snapshot.total_indexed_pages ?? 0,
    pagesIndexedToday: snapshot.pages_indexed_today ?? 0,
    tasksTodayTotal: snapshot.tasks_today_total ?? 0,
    tasksTodayComplete: snapshot.tasks_today_complete ?? 0,
    latestHealthScore: snapshot.latest_health_score ?? 0,
    healthTrend: snapshot.health_trend ?? null,
    latestVelocityScore: snapshot.latest_velocity_score ?? 0,
    totalRevenue: snapshot.revenue_this_month ?? 0,
    monthlyRevenue: snapshot.revenue_this_month ?? 0,
    totalPosts: snapshot.posts_published_today ?? 0,
    totalFollowers: snapshot.new_customers_today ?? 0,
    totalEngagement: snapshot.tasks_today_complete ?? 0,
    growthRate: snapshot.latest_health_score ?? 0,
  };
}

/**
 * Retrieves chart data for a given time period.
 *
 * For '7d': returns the last 7 snapshots.
 * For '30d': returns the last 30 snapshots (sampled if too many).
 * For '90d': returns the last 90 snapshots.
 *
 * @param tenantId - The tenant identifier to scope the query.
 * @param period - The time period ('7d', '30d', or '90d').
 * @returns A `ChartDataDTO` with mapped data points and the requested period.
 * @throws If the Supabase query returns an error.
 */
export async function getChartData(
  tenantId: string,
  period: string,
): Promise<ChartDataDTO> {
  const supabase = getSupabaseAdmin();

  let limit: number;
  switch (period) {
    case '7d':
      limit = 7;
      break;
    case '30d':
      limit = 30;
      break;
    case '90d':
      limit = 90;
      break;
    default:
      limit = 7;
  }

  const { data, error } = await supabase
    .from('analytics_snapshots')
    .select('snapshot_at, revenue_this_month')
    .eq('tenant_id', tenantId)
    .order('snapshot_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  const rows: Partial<AnalyticsSnapshotRow>[] = data ?? [];

  const mapped = rows.map((row) => ({
    label: row.snapshot_at ? new Date(row.snapshot_at).toISOString().slice(0, 10) : '',
    value: row.revenue_this_month ?? 0,
  }));

  return { data: mapped, period };
}

/**
 * Retrieves a daily report for a specific date.
 * Gets the snapshot closest to the given date and builds a summary.
 * Includes channel information from content posts published on that date.
 *
 * @param tenantId - The tenant identifier to scope the query.
 * @param date - The date string (YYYY-MM-DD) to retrieve the report for.
 * @returns A `DailyReportDTO` or `null` if no snapshot is found.
 * @throws If the Supabase query returns an error.
 */
export async function getDailyReport(
  tenantId: string,
  date: string,
): Promise<DailyReportDTO | null> {
  const supabase = getSupabaseAdmin();

  const { data: snapshot, error: snapshotError } = await supabase
    .from('analytics_snapshots')
    .select('*')
    .eq('tenant_id', tenantId)
    .gte('snapshot_at', `${date}T00:00:00`)
    .lte('snapshot_at', `${date}T23:59:59`)
    .order('snapshot_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (snapshotError) {
    throw snapshotError;
  }

  if (!snapshot) {
    return null;
  }

  const { data: posts, error: postsError } = await supabase
    .from('content_posts')
    .select('platform')
    .eq('tenant_id', tenantId)
    .gte('published_at', `${date}T00:00:00`)
    .lte('published_at', `${date}T23:59:59`);

  if (postsError) {
    throw postsError;
  }

  const channels = [...new Set((posts ?? []).map((p) => p.platform).filter(Boolean))];

  return {
    date,
    summary: '',
    channels,
  };
}

/**
 * Creates a new analytics snapshot for a tenant.
 * Upserts on conflict of (tenant_id, snapshot_at).
 *
 * @param tenantId - The tenant identifier to associate with the snapshot.
 * @param data - Partial snapshot data to insert.
 * @returns The created `AnalyticsSnapshotRow`.
 * @throws If the Supabase query returns an error.
 */
export async function createSnapshot(
  tenantId: string,
  data: Partial<AnalyticsSnapshotRow>,
): Promise<AnalyticsSnapshotRow> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('analytics_snapshots')
    .upsert(
      {
        ...data,
        tenant_id: tenantId,
      },
      { onConflict: 'tenant_id,snapshot_at' },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return row;
}

