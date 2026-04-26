/**
 * Default BullMQ job options applied to all workers.
 * Retry policy: 3 attempts with exponential backoff.
 * On final failure: job moved to dead queue, business notified, admin monitor updated.
 * Failed jobs are kept permanently (removeOnFail: false) for dead queue inspection.
 */

import { JobsOptions } from 'bullmq';

export const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 60000, // 1 minute first retry
  },
  // Retry 1 at 1min, Retry 2 at 5min, Retry 3 at 15min
  removeOnComplete: { count: 1000 },
  removeOnFail: false, // Failed jobs kept in dead queue permanently
};

/**
 * Priority levels for content-generation queue.
 * URGENT > HIGH > NORMAL > LOW
 */
export const PRIORITY = {
  URGENT: 1,  // Crisis, inbound call response
  HIGH: 5,    // Scheduled posts due within 1 hour
  NORMAL: 10, // Standard generation
  LOW: 20,    // Batch jobs, analytics reports, blog posts
} as const;

/**
 * Per-platform rate limit caps.
 * System never exceeds 75% of any platform's stated rate limit.
 */
export const PLATFORM_RATE_LIMITS = {
  meta: { maxCallsPerHour: 150, safetyFactor: 0.75 },
  tiktok: { maxCallsPerHour: 100, safetyFactor: 0.75 }, // Placeholder — verify against TikTok developer docs
  linkedin: { maxCallsPerHour: 100, safetyFactor: 0.75 },
  youtube: { maxCallsPerHour: 100, safetyFactor: 0.75 },
  pinterest: { maxCallsPerHour: 100, safetyFactor: 0.75 },
  reddit: { maxCallsPerHour: 60, safetyFactor: 0.75 },
} as const;
