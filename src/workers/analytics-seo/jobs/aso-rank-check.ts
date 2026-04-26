/**
 * Job: ASO Rank Check
 * Worker: 4 — Analytics and SEO
 */

import { Job } from 'bullmq';
import { getAnalytics as playAnalytics } from '../../../lib/integrations/app-developer/play-console';
import { getAnalytics as appStoreAnalytics } from '../../../lib/integrations/app-developer/app-store-connect';
import { AsoRankCheckPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processAsoRankCheck(job: Job<AsoRankCheckPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, app_id, store } = job.data;

  log.jobStart('aso-rank-check', job.id, tenant_id, [`Check ASO rank on ${store}`], { app_id, store });

  try {
    const analyticsData = store === 'google_play'
      ? await playAnalytics({ packageName: app_id, metrics: ['installs', 'revenue', 'ratings'], startDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], tenantId: tenant_id })
      : await appStoreAnalytics({ appId: app_id, metrics: ['downloads', 'revenue', 'subscriptions'], startDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], tenantId: tenant_id });

    const result = { tenant_id, app_id, store, analytics_data: analyticsData, checked_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('aso-rank-check', job.id, tenant_id, duration, `ASO rank checked on ${store}`);
    return { success: true, data: result, tenant_id, job_type: 'aso-rank-check', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('aso-rank-check', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'aso-rank-check', timestamp: new Date().toISOString() };
  }
}
