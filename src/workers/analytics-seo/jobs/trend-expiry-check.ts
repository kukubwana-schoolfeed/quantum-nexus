/**
 * Job: Trend Expiry Check
 * Worker: 4 — Analytics and SEO
 *
 * Scans ACTIVE and AGING trends for expiry. Trends whose score has decayed
 * below threshold or have been aging beyond the expiry window are transitioned
 * to EXPIRED status via dominationQueries.
 */

import { Job } from 'bullmq';
import { dominationQueries } from '../../../lib/db';
import { TrendExpiryCheckPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

const EXPIRY_THRESHOLD_SCORE = 15;
const AGING_EXPIRY_HOURS = 72;

export async function processTrendExpiryCheck(job: Job<TrendExpiryCheckPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id } = job.data;

  log.jobStart('trend-expiry-check', job.id, tenant_id, [`Check for expired trends`]);

  try {
    const [activeTrends, agingTrends] = await Promise.all([
      dominationQueries.listTrends(tenant_id, { status: 'ACTIVE' }),
      dominationQueries.listTrends(tenant_id, { status: 'AGING' }),
    ]);

    const expiredIds: string[] = [];

    for (const trend of activeTrends) {
      if (trend.score < EXPIRY_THRESHOLD_SCORE) {
        await dominationQueries.updateTrendStatus(tenant_id, trend.id, 'EXPIRED', 'Score below expiry threshold');
        expiredIds.push(trend.id);
      }
    }

    const agingCutoff = new Date(Date.now() - AGING_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
    for (const trend of agingTrends) {
      const detectedAt = trend.detectedAt ?? new Date().toISOString();
      if (detectedAt < agingCutoff) {
        await dominationQueries.updateTrendStatus(tenant_id, trend.id, 'EXPIRED', 'Aging trend exceeded expiry window');
        expiredIds.push(trend.id);
      }
    }

    const activeCount = activeTrends.length - expiredIds.filter((id) => activeTrends.some((t) => t.id === id)).length;

    const duration = Date.now() - start;
    log.jobComplete('trend-expiry-check', job.id, tenant_id, duration, `Expired ${expiredIds.length} trends, ${activeCount} remaining active`);

    return {
      success: true,
      data: {
        expired_trends: expiredIds,
        expired_count: expiredIds.length,
        active_trends: activeCount,
        checked_at: new Date().toISOString(),
      },
      tenant_id,
      job_type: 'trend-expiry-check',
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('trend-expiry-check', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'trend-expiry-check', timestamp: new Date().toISOString() };
  }
}
