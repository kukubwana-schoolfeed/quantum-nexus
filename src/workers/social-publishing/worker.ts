/**
 * Worker 2 — Publishing Worker
 * Queue: social-publishing
 * Concurrency: 10 (ten publishing jobs simultaneously)
 *
 * Responsibilities:
 * - All social media posting via official APIs
 * - OAuth token validation before every single job
 * - OAuth token refresh where platform supports background refresh
 * - 72-hour expiry alert triggering for platforms requiring manual re-auth
 * - Held posts management — posts held on token expiry are never deleted
 * - Google Business Profile post scheduling
 * - WhatsApp broadcast delivery
 * - SMS delivery via Twilio
 * - Email delivery
 * - Account warm-up logic enforcement
 * - Q&A answer posting (Quora, Reddit)
 * - Directory submissions (entity-builder)
 * - App review replies (Google Play, App Store)
 * - Birthday token generation and delivery via SMS/WhatsApp
 * - Loyalty transaction sync and point expiration
 * - Multi-channel notification delivery (in-app, SMS, WhatsApp, email)
 */

import { Worker, Job } from 'bullmq';
import { bullMQConnection } from '../shared/redis-connection';
import { PLATFORM_RATE_LIMITS } from '../shared/job-options';
import { BaseJobPayload, JobResult } from '../shared/types';
import { createWorkerLogger } from '../shared/logger';

// Job processors
import { processSocialPosting } from './jobs/social-posting';
import { processOAuthTokenValidation } from './jobs/oauth-token-validation';
import { processOAuthTokenRefresh } from './jobs/oauth-token-refresh';
import { processTokenExpiryAlert } from './jobs/token-expiry-alert';
import { processHeldPostsManagement } from './jobs/held-posts-management';
import { processGbpPosting } from './jobs/gbp-posting';
import { processWhatsAppBroadcast } from './jobs/whatsapp-broadcast';
import { processSmsDelivery } from './jobs/sms-delivery';
import { processEmailDelivery } from './jobs/email-delivery';
import { processAccountWarmup } from './jobs/account-warmup';
import { processQaPosting } from './jobs/qa-posting';
import { processDirectorySubmission } from './jobs/directory-submission';
import { processAppReviewReply } from './jobs/app-review-reply';
import { processBirthdayTokenGeneration } from './jobs/birthday-token-generation';
import { processLoyaltyTransactionSync } from './jobs/loyalty-transaction-sync';
import { processNotificationDelivery } from './jobs/notification-delivery';

const log = createWorkerLogger(2, 'social-publishing');

/** Maps job names to their processor functions. */
const jobProcessors: Record<string, (job: Job<BaseJobPayload>) => Promise<JobResult>> = {
  'social-posting': processSocialPosting as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'oauth-token-validation': processOAuthTokenValidation as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'oauth-token-refresh': processOAuthTokenRefresh as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'token-expiry-alert': processTokenExpiryAlert as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'held-posts-management': processHeldPostsManagement as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'gbp-posting': processGbpPosting as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'whatsapp-broadcast': processWhatsAppBroadcast as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'sms-delivery': processSmsDelivery as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'email-delivery': processEmailDelivery as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'account-warmup': processAccountWarmup as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'qa-posting': processQaPosting as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'directory-submission': processDirectorySubmission as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'app-review-reply': processAppReviewReply as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'birthday-token-generation': processBirthdayTokenGeneration as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'loyalty-transaction-sync': processLoyaltyTransactionSync as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'notification-delivery': processNotificationDelivery as (job: Job<BaseJobPayload>) => Promise<JobResult>,
};

/**
 * Social Publishing Worker instance.
 * Processes jobs from the 'social-publishing' queue with concurrency of 10.
 */
export const socialPublishingWorker = new Worker<BaseJobPayload>(
  'social-publishing',
  async (job: Job<BaseJobPayload>) => {
    const processor = jobProcessors[job.name];
    if (!processor) {
      throw new Error(`[Worker 2] Unknown job type: ${job.name}`);
    }
    return processor(job);
  },
  {
    connection: bullMQConnection,
    concurrency: 10,
  }
);

socialPublishingWorker.on('completed', (job: Job<BaseJobPayload>) => {
  log.jobComplete(job.name, job.id, job.data.tenant_id, 0, 'ok');
});

socialPublishingWorker.on('failed', (job: Job<BaseJobPayload> | undefined, err: Error) => {
  if (job) {
    log.jobFailed(job.name, job.id, job.data.tenant_id, err.message, 0);
  }
});

socialPublishingWorker.on('error', (err: Error) => {
  log.error('Worker runtime error', { message: err.message });
});

export { PLATFORM_RATE_LIMITS, log };
export default socialPublishingWorker;
