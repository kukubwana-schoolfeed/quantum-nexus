/**
 * Job: GA4 Data Pull
 * Worker: 4 — Analytics and SEO
 */

import { Job } from 'bullmq';
import { getTrafficData, getConversions } from '../../../lib/integrations/google/ga4';
import { Ga4DataPullPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processGa4DataPull(job: Job<Ga4DataPullPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, property_id, metrics, date_range } = job.data;

  log.jobStart('ga4-data-pull', job.id, tenant_id, [`Pull GA4 data from property ${property_id}`], { property_id, metrics });

  try {
    const traffic = await getTrafficData({ propertyId: property_id, startDate: date_range.start, endDate: date_range.end, metrics, tenantId: tenant_id });
    const result = { tenant_id, property_id, metrics, date_range, pulled_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('ga4-data-pull', job.id, tenant_id, duration, `GA4 data pulled`);
    return { success: true, data: result, tenant_id, job_type: 'ga4-data-pull', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('ga4-data-pull', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'ga4-data-pull', timestamp: new Date().toISOString() };
  }
}
