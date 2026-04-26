/**
 * Job: Key Rotation
 * Worker: 4 — Analytics and SEO
 *
 * Executes a key rotation pass across all tenants and active encryption keys.
 * Keys older than 90 days are re-encrypted with a fresh IV and the old
 * record is deactivated (RULE S-2, RULE D-2).
 *
 * Schedule: Monthly (1st at 3am)
 */

import { Job } from 'bullmq';
import { executeKeyRotationPass } from '../../../lib/security/key-rotation-scheduler';
import { KeyRotationPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processKeyRotation(job: Job<KeyRotationPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id } = job.data;

  log.jobStart('key-rotation', job.id, tenant_id, ['Execute key rotation pass']);

  try {
    const result = await executeKeyRotationPass();

    const duration = Date.now() - start;
    log.jobComplete('key-rotation', job.id, tenant_id, duration, `Rotated: ${result.rotated}, Skipped: ${result.skipped}, Errors: ${result.errors.length}`);

    return {
      success: result.errors.length === 0,
      data: {
        evaluated: result.evaluated,
        rotated: result.rotated,
        skipped: result.skipped,
        error_count: result.errors.length,
        errors: result.errors,
      },
      tenant_id,
      job_type: 'key-rotation',
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('key-rotation', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'key-rotation', timestamp: new Date().toISOString() };
  }
}
