/**
 * Job: Sitemap Submission
 * Worker: 4 — Analytics and SEO
 */

import { Job } from 'bullmq';
import { submitSitemap } from '../../../lib/integrations/google/gsc';
import { SitemapSubmissionPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processSitemapSubmission(job: Job<SitemapSubmissionPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, sitemap_url } = job.data;

  log.jobStart('sitemap-submission', job.id, tenant_id, [`Submit sitemap: ${sitemap_url}`], { sitemap_url });

  try {
    const response = await submitSitemap({ siteUrl: sitemap_url.replace('/sitemap.xml', ''), sitemapUrl: sitemap_url, tenantId: tenant_id });
    const result = { tenant_id, sitemap_url, submitted: true, gsc_response: 'Submitted', submitted_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('sitemap-submission', job.id, tenant_id, duration, `Sitemap submitted`);
    return { success: true, data: result, tenant_id, job_type: 'sitemap-submission', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('sitemap-submission', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'sitemap-submission', timestamp: new Date().toISOString() };
  }
}
