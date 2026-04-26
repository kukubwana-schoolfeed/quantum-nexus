/**
 * Worker 3 — AI Scene Worker
 * Queue: ai-scene-generation
 * Concurrency: 1 (strictly one RunwayML job at a time)
 * Throttle: Minimum 30 seconds between job starts regardless of queue depth
 *
 * Responsibilities:
 * - RunwayML Gen-3 API calls ONLY
 * - One job at a time — concurrency: 1
 * - Premium tier clients only — job rejected if client is not premium tier
 * - Monthly quota enforcement — job rejected if client has exhausted their monthly Runway quota
 * - AI Scene flagged content only — job rejected if content is not flagged AI_SCENE
 */

import { Worker, Job } from 'bullmq';
import { bullMQConnection } from '../shared/redis-connection';
import { BaseJobPayload, JobResult } from '../shared/types';
import { createWorkerLogger } from '../shared/logger';

// Job processors
import { processRunwayVideoGeneration } from './jobs/runway-video-generation';

const log = createWorkerLogger(3, 'ai-scene-generation');

/** Maps job names to their processor functions. */
const jobProcessors: Record<string, (job: Job<BaseJobPayload>) => Promise<JobResult>> = {
  'runway-video-generation': processRunwayVideoGeneration as (job: Job<BaseJobPayload>) => Promise<JobResult>,
};

/** Tracks the last job start time to enforce 30-second throttle. */
let lastJobStartTime = 0;
const THIRTY_SECONDS_MS = 30_000;

/**
 * AI Scene Generation Worker instance.
 * Processes jobs from the 'ai-scene-generation' queue with concurrency of 1.
 * Enforces a 30-second minimum gap between job starts.
 */
export const aiSceneGenerationWorker = new Worker<BaseJobPayload>(
  'ai-scene-generation',
  async (job: Job<BaseJobPayload>) => {
    const processor = jobProcessors[job.name];
    if (!processor) {
      throw new Error(`[Worker 3] Unknown job type: ${job.name}`);
    }

    // Enforce 30-second throttle between job starts
    const now = Date.now();
    const elapsed = now - lastJobStartTime;
    if (elapsed < THIRTY_SECONDS_MS) {
      const waitMs = THIRTY_SECONDS_MS - elapsed;
      log.info('Throttle: waiting before next job', { job_name: job.name });
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
    lastJobStartTime = Date.now();

    return processor(job);
  },
  {
    connection: bullMQConnection,
    concurrency: 1,
  }
);

aiSceneGenerationWorker.on('completed', (job: Job<BaseJobPayload>) => {
  log.jobComplete(job.name, job.id, job.data.tenant_id, 0, 'ok');
});

aiSceneGenerationWorker.on('failed', (job: Job<BaseJobPayload> | undefined, err: Error) => {
  if (job) {
    log.jobFailed(job.name, job.id, job.data.tenant_id, err.message, 0);
  }
});

aiSceneGenerationWorker.on('error', (err: Error) => {
  log.error('Worker runtime error', { message: err.message });
});

export { log };
export default aiSceneGenerationWorker;
