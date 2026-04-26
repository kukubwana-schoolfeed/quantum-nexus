/**
 * Job: App Review Monitoring
 * Worker: 4 — Analytics and SEO
 */

import { Job } from 'bullmq';
import { getReviews as playReviews } from '../../../lib/integrations/app-developer/play-console';
import { getReviews as appStoreReviews } from '../../../lib/integrations/app-developer/app-store-connect';
import { AppReviewMonitoringPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processAppReviewMonitoring(job: Job<AppReviewMonitoringPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, app_id } = job.data;

  log.jobStart('app-review-monitoring', job.id, tenant_id, [`Monitor reviews for ${app_id}`], { app_id });

  try {
    const [playData, appStoreData] = await Promise.all([
      playReviews({ packageName: app_id, tenantId: tenant_id }).catch(() => null),
      appStoreReviews({ appId: app_id, tenantId: tenant_id }).catch(() => null),
    ]);

    const result = { tenant_id, app_id, play_reviews: playData, app_store_reviews: appStoreData, monitored_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('app-review-monitoring', job.id, tenant_id, duration, `Reviews monitored`);
    return { success: true, data: result, tenant_id, job_type: 'app-review-monitoring', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('app-review-monitoring', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'app-review-monitoring', timestamp: new Date().toISOString() };
  }
}
