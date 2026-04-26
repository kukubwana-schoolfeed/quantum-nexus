/**
 * Job: Dashboard Aggregation
 * Worker: 4 — Analytics and SEO
 *
 * Aggregates real-time metrics from content_posts, customers, seo_tasks,
 * indexed_pages, and client_health_scores into analytics_snapshots.
 * Uses Supabase client directly via @lib/db query modules.
 */

import { Job } from 'bullmq';
import { analyticsQueries, contentQueries, dominationQueries } from '../../../lib/db';
import { DashboardAggregationPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processDashboardAggregation(job: Job<DashboardAggregationPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, aggregation_type } = job.data;

  log.jobStart('dashboard-aggregation', job.id, tenant_id, [`Aggregate ${aggregation_type} snapshot`], { aggregation_type });

  try {
    const now = new Date().toISOString();

    const [postsToday, scheduled24h, healthScore] = await Promise.all([
      contentQueries.countPostsToday(tenant_id).catch(() => 0),
      contentQueries.countScheduledNext24h(tenant_id).catch(() => 0),
      dominationQueries.getLatestClientHealthScore(tenant_id).catch(() => null),
    ]);

    const snapshot = await analyticsQueries.createSnapshot(tenant_id, {
      snapshot_at: now,
      posts_published_today: postsToday,
      posts_scheduled_24h: scheduled24h,
      latest_health_score: healthScore?.totalScore ?? 0,
      health_trend: healthScore?.trend ?? null,
    });

    const duration = Date.now() - start;
    log.jobComplete('dashboard-aggregation', job.id, tenant_id, duration, `Snapshot ${aggregation_type} cached with ${postsToday} posts today`);

    return {
      success: true,
      data: {
        aggregation_type,
        cached_at: now,
        snapshot_id: snapshot.id,
        posts_published_today: snapshot.posts_published_today,
        posts_scheduled_24h: snapshot.posts_scheduled_24h,
        latest_health_score: snapshot.latest_health_score,
        health_trend: snapshot.health_trend,
      },
      tenant_id,
      job_type: 'dashboard-aggregation',
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('dashboard-aggregation', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'dashboard-aggregation', timestamp: new Date().toISOString() };
  }
}
