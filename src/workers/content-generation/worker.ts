/**
 * Worker 1 — Content Generation Worker
 * Queue: content-generation
 * Concurrency: 5 (five jobs simultaneously)
 *
 * Responsibilities:
 * - Claude API calls for content writing (blog posts, captions, scripts, emails)
 * - ElevenLabs voice generation for call responses and faceless character voices
 * - Remotion video composition and rendering
 * - Imagen 3 image generation
 * - Whisper transcription jobs
 * - Algorithm scoring before content is queued to Worker 2
 * - Content safety check (mandatory, Claude Haiku)
 * - Sprint mode content generation
 * - Inspiration file analysis (AI bubble uploads)
 * - Content recycling jobs
 * - Blog post generation for seo-domination-engine
 * - Lead magnet PDF generation
 *
 * Priority: URGENT > HIGH > NORMAL > LOW
 */

import { Worker, Job } from 'bullmq';
import { bullMQConnection } from '../shared/redis-connection';
import { PRIORITY } from '../shared/job-options';
import { BaseJobPayload, JobResult } from '../shared/types';
import { createWorkerLogger } from '../shared/logger';

// Job processors
import { processContentWriting } from './jobs/content-writing';
import { processVoiceGeneration } from './jobs/voice-generation';
import { processVideoComposition } from './jobs/video-composition';
import { processImageGeneration } from './jobs/image-generation';
import { processWhisperTranscription } from './jobs/whisper-transcription';
import { processAlgorithmScoring } from './jobs/algorithm-scoring';
import { processContentSafetyCheck } from './jobs/content-safety-check';
import { processInspirationAnalysis } from './jobs/inspiration-analysis';
import { processContentRecycling } from './jobs/content-recycling';
import { processSeoBlogGeneration } from './jobs/seo-blog-generation';
import { processLeadMagnetGeneration } from './jobs/lead-magnet-generation';

const log = createWorkerLogger(1, 'content-generation');

/** Maps job names to their processor functions. */
const jobProcessors: Record<string, (job: Job<BaseJobPayload>) => Promise<JobResult>> = {
  'content-writing': processContentWriting as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'voice-generation': processVoiceGeneration as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'video-composition': processVideoComposition as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'image-generation': processImageGeneration as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'whisper-transcription': processWhisperTranscription as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'algorithm-scoring': processAlgorithmScoring as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'content-safety-check': processContentSafetyCheck as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'inspiration-analysis': processInspirationAnalysis as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'content-recycling': processContentRecycling as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'seo-blog-generation': processSeoBlogGeneration as (job: Job<BaseJobPayload>) => Promise<JobResult>,
  'lead-magnet-generation': processLeadMagnetGeneration as (job: Job<BaseJobPayload>) => Promise<JobResult>,
};

/**
 * Content Generation Worker instance.
 * Processes jobs from the 'content-generation' queue with concurrency of 5.
 */
export const contentGenerationWorker = new Worker<BaseJobPayload>(
  'content-generation',
  async (job: Job<BaseJobPayload>) => {
    const processor = jobProcessors[job.name];
    if (!processor) {
      throw new Error(`[Worker 1] Unknown job type: ${job.name}`);
    }
    return processor(job);
  },
  {
    connection: bullMQConnection,
    concurrency: 5,
  }
);

// Worker event handlers
contentGenerationWorker.on('completed', (job: Job<BaseJobPayload>, result: unknown) => {
  log.jobComplete(job.name, job.id, job.data.tenant_id, 0, 'ok');
});

contentGenerationWorker.on('failed', (job: Job<BaseJobPayload> | undefined, err: Error) => {
  if (job) {
    log.jobFailed(job.name, job.id, job.data.tenant_id, err.message, 0);
  }
});

contentGenerationWorker.on('error', (err: Error) => {
  log.error('Worker runtime error', { message: err.message });
});

export { PRIORITY, log };
export default contentGenerationWorker;
