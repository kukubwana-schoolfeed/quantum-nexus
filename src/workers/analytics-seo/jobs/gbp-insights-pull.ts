/**
 * Job: GBP Insights Pull
 * Worker: 4 — Analytics and SEO
 */

import { Job } from 'bullmq';
import { getInsights } from '../../../lib/integrations/google/gbp';
import { GbpInsightsPullPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processGbpInsightsPull(job: Job<GbpInsightsPullPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, location_id, date_range } = job.data;

  log.jobStart('gbp-insights-pull', job.id, tenant_id, [`Pull GBP insights for ${location_id}`], { location_id });

  try {
    const response = await getInsights({ locationId: location_id, startDate: date_range.start, endDate: date_range.end, tenantId: tenant_id });
    const result = { tenant_id, location_id, date_range, pulled_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('gbp-insights-pull', job.id, tenant_id, duration, `GBP insights pulled`);
    return { success: true, data: result, tenant_id, job_type: 'gbp-insights-pull', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('gbp-insights-pull', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'gbp-insights-pull', timestamp: new Date().toISOString() };
  }
}
