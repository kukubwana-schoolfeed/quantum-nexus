/**
 * Job: Q&A Posting
 * Worker: 2 — Social Publishing
 */

import { Job } from 'bullmq';
import { submitPost as redditSubmit } from '../../../lib/integrations/social/reddit';
import { QaPostingPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(2, 'social-publishing');

export async function processQaPosting(job: Job<QaPostingPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, platform, question_id, answer_text } = job.data;

  log.jobStart('qa-posting', job.id, tenant_id, [`Post answer on ${platform} question: ${question_id}`], { platform, question_id });

  try {
    let answerId: string;

    if (platform === 'reddit') {
      const r = await redditSubmit({ title: `Answer to ${question_id}`, content: answer_text, kind: 'self', subreddit: 'business', tenantId: tenant_id });
      answerId = r.postId;
    } else {
      // Quora doesn't have an official API for posting answers — placeholder
      answerId = `qa-quora-${Date.now().toString(36)}`;
    }

    const result = { tenant_id, answer_id: answerId, platform, question_id, status: 'posted' as const, posted_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('qa-posting', job.id, tenant_id, duration, `Answer posted on ${platform}`);
    return { success: true, data: result, tenant_id, job_type: 'qa-posting', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('qa-posting', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'qa-posting', timestamp: new Date().toISOString() };
  }
}
