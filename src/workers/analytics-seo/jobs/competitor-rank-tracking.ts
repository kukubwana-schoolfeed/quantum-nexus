/**
 * Job: Competitor Rank Tracking
 * Worker: 4 — Analytics and SEO
 */

import { Job } from 'bullmq';
import { getRankings } from '../../../lib/integrations/seo/dataforseo';
import { CompetitorRankTrackingPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processCompetitorRankTracking(job: Job<CompetitorRankTrackingPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, keywords, competitor_domains } = job.data;

  log.jobStart('competitor-rank-tracking', job.id, tenant_id, [`Track ${keywords.length} keywords via DataForSEO`], { keyword_count: keywords.length });

  try {
    const response = await getRankings({ keywords, domain: competitor_domains[0], tenantId: tenant_id });
    const result = { tenant_id, keywords_tracked: keywords.length, competitor_domains, tracked_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('competitor-rank-tracking', job.id, tenant_id, duration, `${keywords.length} keywords tracked`);
    return { success: true, data: result, tenant_id, job_type: 'competitor-rank-tracking', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('competitor-rank-tracking', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'competitor-rank-tracking', timestamp: new Date().toISOString() };
  }
}
