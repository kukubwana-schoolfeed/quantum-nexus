/**
 * Job: Google Business Profile Posting
 * Worker: 2 — Social Publishing
 */

import { Job } from 'bullmq';
import { createPost as gbpCreatePost } from '../../../lib/integrations/google/gbp';
import { GbpPostingPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(2, 'social-publishing');

export async function processGbpPosting(job: Job<GbpPostingPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, location_id, content_id, post_text, media_url } = job.data;

  log.jobStart('gbp-posting', job.id, tenant_id, [`Post to GBP location: ${location_id}`], { location_id, content_id });

  try {
    const response = await gbpCreatePost({ locationId: location_id, summary: post_text, mediaUrl: media_url, tenantId: tenant_id });

    const result = { tenant_id, post_id: response.postId ?? `gbp-${Date.now().toString(36)}`, location_id, content_id, status: 'published' as const, published_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('gbp-posting', job.id, tenant_id, duration, `GBP post published`);
    return { success: true, data: result, tenant_id, job_type: 'gbp-posting', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('gbp-posting', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'gbp-posting', timestamp: new Date().toISOString() };
  }
}
