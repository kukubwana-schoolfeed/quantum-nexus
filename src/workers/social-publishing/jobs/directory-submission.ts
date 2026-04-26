/**
 * Job: Directory Submission
 * Worker: 2 — Social Publishing
 *
 * PLACEHOLDER: Directory submission APIs vary per directory.
 * Real implementation needs entity-builder module integration.
 * PHASE: 4
 */

import { Job } from 'bullmq';
import { MOCK_DATA } from '../../shared/mock-data';
import { DirectorySubmissionPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(2, 'social-publishing');

export async function processDirectorySubmission(job: Job<DirectorySubmissionPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, directory, business_name } = job.data;

  log.jobStart('directory-submission', job.id, tenant_id, [`Submit "${business_name}" to ${directory}`], { directory, business_name });

  try {
    // Directory integrations pending Phase 4 — each directory has different API
    const result = MOCK_DATA.publishing.directorySubmission({ tenant_id, directory, business_name });

    const duration = Date.now() - start;
    log.jobComplete('directory-submission', job.id, tenant_id, duration, `Submitted to ${directory} — DIRECTORY INTEGRATION PHASE 4`);

    return { success: true, data: result, tenant_id, job_type: 'directory-submission', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('directory-submission', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'directory-submission', timestamp: new Date().toISOString() };
  }
}
