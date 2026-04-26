/**
 * Job: App Review Reply
 * Worker: 2 — Social Publishing
 */

import { Job } from 'bullmq';
import { replyToReview as playReply } from '../../../lib/integrations/app-developer/play-console';
import { replyToReview as appStoreReply } from '../../../lib/integrations/app-developer/app-store-connect';
import { AppReviewReplyPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(2, 'social-publishing');

export async function processAppReviewReply(job: Job<AppReviewReplyPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, store, review_id, reply_text } = job.data;

  log.jobStart('app-review-reply', job.id, tenant_id, [`Reply to review ${review_id} on ${store}`], { store, review_id });

  try {
    let replyId: string;

    if (store === 'google_play') {
      const r = await playReply({ reviewId: review_id, replyText: reply_text, packageName: tenant_id, tenantId: tenant_id });
      replyId = r.reviewId ?? `rev-play-${Date.now().toString(36)}`;
    } else {
      const r = await appStoreReply({ reviewId: review_id, replyText: reply_text, appId: tenant_id, tenantId: tenant_id });
      replyId = r.reviewId ?? `rev-appstore-${Date.now().toString(36)}`;
    }

    const result = { tenant_id, reply_id: replyId, store, review_id, status: 'posted' as const, posted_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('app-review-reply', job.id, tenant_id, duration, `Reply posted on ${store}`);
    return { success: true, data: result, tenant_id, job_type: 'app-review-reply', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('app-review-reply', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'app-review-reply', timestamp: new Date().toISOString() };
  }
}
