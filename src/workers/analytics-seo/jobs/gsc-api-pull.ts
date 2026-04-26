/**
 * Job: GSC API Pull
 * Worker: 4 — Analytics and SEO
 */

import { Job } from 'bullmq';
import { getRankings, getCrawlErrors } from '../../../lib/integrations/google/gsc';
import { GscApiPullPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processGscApiPull(job: Job<GscApiPullPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, site_url, data_type, date_range } = job.data;

  log.jobStart('gsc-api-pull', job.id, tenant_id, [`Pull ${data_type} from GSC for ${site_url}`], { site_url, data_type });

  try {
    let resultData;
    if (data_type === 'rankings') {
      resultData = await getRankings({ siteUrl: site_url, startDate: date_range.start, endDate: date_range.end, tenantId: tenant_id });
    } else {
      resultData = await getCrawlErrors({ siteUrl: site_url, tenantId: tenant_id });
    }

    const result = { tenant_id, site_url, data_type, date_range, records: Array.isArray(resultData) ? resultData.length : 0, pulled_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('gsc-api-pull', job.id, tenant_id, duration, `${data_type} pulled`);
    return { success: true, data: result, tenant_id, job_type: 'gsc-api-pull', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('gsc-api-pull', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'gsc-api-pull', timestamp: new Date().toISOString() };
  }
}
