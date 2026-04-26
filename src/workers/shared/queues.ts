/**
 * BullMQ Queue definitions for all 4 worker queues.
 * These Queue instances are used by API routes and schedulers to add jobs.
 * Workers consume from these queues; this module is for producers.
 *
 * Queue names must match the Worker definitions exactly.
 */

import { Queue } from 'bullmq';
import { bullMQConnection } from './redis-connection';
import { defaultJobOptions } from './job-options';

/** Worker 1 queue — content-generation, concurrency: 5 */
export const contentGenerationQueue = new Queue('content-generation', {
  connection: bullMQConnection,
  defaultJobOptions,
});

/** Worker 2 queue — social-publishing, concurrency: 10 */
export const socialPublishingQueue = new Queue('social-publishing', {
  connection: bullMQConnection,
  defaultJobOptions,
});

/** Worker 3 queue — ai-scene-generation, concurrency: 1 */
export const aiSceneGenerationQueue = new Queue('ai-scene-generation', {
  connection: bullMQConnection,
  defaultJobOptions,
});

/** Worker 4 queue — analytics-seo, concurrency: 3 */
export const analyticsSeoQueue = new Queue('analytics-seo', {
  connection: bullMQConnection,
  defaultJobOptions,
});

/** Map of queue name → Queue instance for dynamic lookups */
export const queues: Record<string, Queue<any>> = {
  'content-generation': contentGenerationQueue,
  'social-publishing': socialPublishingQueue,
  'ai-scene-generation': aiSceneGenerationQueue,
  'analytics-seo': analyticsSeoQueue,
};
