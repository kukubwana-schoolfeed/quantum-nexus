/**
 * Job: Content Safety Check
 * Worker: 1 — Content Generation
 *
 * Mandatory, non-skippable safety classification using content-safety module
 * powered by Claude Haiku. Every piece of content MUST pass before publishing.
 */

import { Job } from 'bullmq';
import { checkContentSafety, holdPostForSafetyFailure } from '../../../lib/security/content-safety';
import { updatePostSafetyCheck } from '../../../lib/db/content-queries';
import { ContentSafetyCheckPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(1, 'content-generation');

const CONTENT_TYPE_MAP: Record<string, 'social_post' | 'blog_post' | 'comment_reply' | 'dm_reply' | 'gbp_post' | 'qa_answer' | 'ad_copy' | 'video_script'> = {
  blog_post: 'blog_post',
  caption: 'social_post',
  script: 'video_script',
  email: 'social_post',
  gbp_post: 'gbp_post',
  qa_answer: 'qa_answer',
};

export async function processContentSafetyCheck(job: Job<ContentSafetyCheckPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, content_id, content_text, content_type } = job.data;

  log.jobStart('content-safety-check', job.id, tenant_id, [
    `[MANDATORY — NO BYPASS] Run safety classification via content-safety module`,
    `Content ID: ${content_id}, type: ${content_type}`,
  ], { content_id, content_type, text_length: content_text.length });

  try {
    const mappedType = CONTENT_TYPE_MAP[content_type] ?? 'social_post';
    const safetyResult = await checkContentSafety(tenant_id, content_text, mappedType, 'general');

    const result = {
      tenant_id,
      content_id,
      safe: safetyResult.passed,
      flags: safetyResult.checks.filter(c => !c.passed).map(c => `${c.category} (confidence: ${c.confidence})`),
      classifier: 'claude-haiku-4-5',
      classification: safetyResult.passed ? 'APPROVED' : 'REJECTED',
      reason: safetyResult.reason,
      checks: safetyResult.checks,
      checked_at: new Date().toISOString(),
    };

    // If safety failed, hold the post
    if (!safetyResult.passed && safetyResult.reason) {
      await holdPostForSafetyFailure(tenant_id, content_id, safetyResult.reason);
    }

    // Persist safety check result to the post record
    await updatePostSafetyCheck(
      tenant_id,
      content_id,
      safetyResult.passed ? 'pass' : 'fail',
      safetyResult.reason,
    ).catch((dbErr) => {
      log.warn('content-safety-check DB persist failed', {
        job_name: 'content-safety-check',
        tenant_id,
        payload_summary: { error: dbErr instanceof Error ? dbErr.message : String(dbErr) },
      });
    });

    const duration = Date.now() - start;
    log.jobComplete('content-safety-check', job.id, tenant_id, duration, `Classification: ${result.classification} — safe: ${result.safe}`);

    return { success: true, data: result, tenant_id, job_type: 'content-safety-check', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('content-safety-check', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'content-safety-check', timestamp: new Date().toISOString() };
  }
}
