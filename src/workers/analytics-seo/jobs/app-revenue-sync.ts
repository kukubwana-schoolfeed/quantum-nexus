/**
 * Job: App Revenue Sync
 * Worker: 4 — Analytics and SEO
 */

import { Job } from 'bullmq';
import { getAnalytics as playAnalytics } from '../../../lib/integrations/app-developer/play-console';
import { getAnalytics as appStoreAnalytics } from '../../../lib/integrations/app-developer/app-store-connect';
import { getMetrics as revenuecatMetrics } from '../../../lib/integrations/app-developer/revenuecat';
import { AppRevenueSyncPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processAppRevenueSync(job: Job<AppRevenueSyncPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, app_id } = job.data;

  log.jobStart('app-revenue-sync', job.id, tenant_id, [`Sync revenue for ${app_id}`], { app_id });

  try {
    const [playData, rcData] = await Promise.all([
      playAnalytics({ packageName: app_id, metrics: ['revenue', 'subscriptions', 'installs'], startDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], tenantId: tenant_id }).catch(() => null),
      revenuecatMetrics({ projectId: app_id, startDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], tenantId: tenant_id }).catch(() => null),
    ]);

    const result = { tenant_id, app_id, play_console_data: playData, revenuecat_data: rcData, synced_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('app-revenue-sync', job.id, tenant_id, duration, `Revenue synced`);
    return { success: true, data: result, tenant_id, job_type: 'app-revenue-sync', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('app-revenue-sync', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'app-revenue-sync', timestamp: new Date().toISOString() };
  }
}
