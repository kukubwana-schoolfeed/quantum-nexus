/**
 * Job: Keyword Cannibalisation Scan
 * Worker: 4 — Analytics and SEO
 */

import { Job } from 'bullmq';
import { getRankings } from '../../../lib/integrations/seo/dataforseo';
import { KeywordCannibalisationScanPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processKeywordCannibalisationScan(job: Job<KeywordCannibalisationScanPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id } = job.data;

  log.jobStart('keyword-cannibalisation-scan', job.id, tenant_id, [`Scan for keyword cannibalisation`]);

  try {
    const response = await getRankings({ keywords: [], domain: `${tenant_id}.com`, tenantId: tenant_id });
    const result = { tenant_id, rankings_data: response, scanned_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('keyword-cannibalisation-scan', job.id, tenant_id, duration, `Scan complete`);
    return { success: true, data: result, tenant_id, job_type: 'keyword-cannibalisation-scan', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('keyword-cannibalisation-scan', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'keyword-cannibalisation-scan', timestamp: new Date().toISOString() };
  }
}
