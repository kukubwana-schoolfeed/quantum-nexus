/**
 * Job: Page Indexing Request
 * Worker: 4 — Analytics and SEO
 */

import { Job } from 'bullmq';
import { requestIndexing } from '../../../lib/integrations/google/gsc';
import { PageIndexingRequestPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processPageIndexingRequest(job: Job<PageIndexingRequestPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, page_url } = job.data;

  log.jobStart('page-indexing-request', job.id, tenant_id, [`Request indexing: ${page_url}`], { page_url });

  try {
    const response = await requestIndexing({ siteUrl: new URL(page_url).origin, pageUrl: page_url, tenantId: tenant_id });
    const result = { tenant_id, page_url, indexing_requested: true, gsc_response: 'Indexing request submitted', requested_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('page-indexing-request', job.id, tenant_id, duration, `Indexing requested`);
    return { success: true, data: result, tenant_id, job_type: 'page-indexing-request', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('page-indexing-request', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'page-indexing-request', timestamp: new Date().toISOString() };
  }
}
