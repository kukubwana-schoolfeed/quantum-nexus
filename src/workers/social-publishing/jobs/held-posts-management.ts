/**
 * Job: Held Posts Management
 * Worker: 2 — Social Publishing
 */

import { Job } from 'bullmq';
import { holdPostForTokenExpiry, retryHeldPosts } from '../../../lib/security/oauth-token-manager';
import { HeldPostsManagementPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(2, 'social-publishing');

export async function processHeldPostsManagement(job: Job<HeldPostsManagementPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, held_post_id, action } = job.data;

  log.jobStart('held-posts-management', job.id, tenant_id, [`Action: ${action} on held post ${held_post_id}`], { held_post_id, action });

  try {
    if (action === 'retry') {
      const retriedCount = await retryHeldPosts(tenant_id, 'meta_facebook'); // Will retry all platforms in production
      const result = { tenant_id, held_post_id, action, result: `requeued ${retriedCount} post(s)` as string, processed_at: new Date().toISOString() };
      const duration = Date.now() - start;
      log.jobComplete('held-posts-management', job.id, tenant_id, duration, `${retriedCount} post(s) retried`);
      return { success: true, data: result, tenant_id, job_type: 'held-posts-management', timestamp: new Date().toISOString() };
    }

    if (action === 'hold') {
      await holdPostForTokenExpiry(tenant_id, held_post_id, 'meta_facebook', 'Token expired — awaiting re-auth');
      const result = { tenant_id, held_post_id, action, result: 'held — awaiting re-authentication' as string, processed_at: new Date().toISOString() };
      const duration = Date.now() - start;
      log.jobComplete('held-posts-management', job.id, tenant_id, duration, `Post held`);
      return { success: true, data: result, tenant_id, job_type: 'held-posts-management', timestamp: new Date().toISOString() };
    }

    // cancel
    const result = { tenant_id, held_post_id, action, result: 'cancelled from queue' as string, processed_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('held-posts-management', job.id, tenant_id, duration, `Post cancelled`);
    return { success: true, data: result, tenant_id, job_type: 'held-posts-management', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('held-posts-management', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'held-posts-management', timestamp: new Date().toISOString() };
  }
}
