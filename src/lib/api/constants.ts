/**
 * API Constants
 * @module api/constants
 * @description Shared constants used across all API routes and server modules.
 */

/** Default pagination values */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Algorithm scoring thresholds per platform */
export const ALGORITHM_THRESHOLDS: Record<string, number> = {
  tiktok: 70,
  youtube: 65,
  instagram: 70,
  facebook: 60,
  linkedin: 65,
};

/** BullMQ worker concurrency settings */
export const WORKER_CONCURRENCY = {
  content: 5,
  publishing: 10,
  aiScene: 1,
  analytics: 3,
} as const;

/** BullMQ retry configuration */
export const BULLMQ_RETRY_CONFIG = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 60000,
  },
  removeOnComplete: { count: 1000 },
  removeOnFail: false,
} as const;

/** Rate limit configuration — 75% of platform stated limits */
export const PLATFORM_RATE_LIMITS = {
  meta: { maxCallsPerHour: 112 },   // 75% of 150
  tiktok: { maxCallsPerHour: 300 },  // 75% of ~400
  youtube: { maxCallsPerHour: 150 }, // 75% of ~200
  linkedin: { maxCallsPerHour: 75 }, // 75% of ~100
  pinterest: { maxCallsPerHour: 75 },
  reddit: { maxCallsPerHour: 45 },   // 75% of ~60
} as const;

/** Billing grace and suspension periods in days */
export const BILLING = {
  gracePeriodDays: 7,
  suspensionDays: 14,
  dataRetentionDays: 30,
} as const;

/** Sprint mode duration in days */
export const SPRINT_MODE_DURATION_DAYS = 30;

/** SEO blog posts per day per tenant (RULE DOM-2) */
export const SEO_BLOG_POSTS_PER_DAY = 2;

/** Account warm-up period in days */
export const WARMUP_PERIOD_DAYS = 30;

/** Mission Control snapshot interval in minutes (Worker 4) */
export const MISSION_CONTROL_SNAPSHOT_INTERVAL_MINUTES = 15;

/** Content safety check result */
export const SAFETY_CHECK = {
  PASS: 'pass',
  FAIL: 'fail',
} as const;

/** Minimum RunwayML job interval in seconds */
export const RUNWAY_MIN_JOB_INTERVAL_SECONDS = 30;

/** Module categories for route organisation */
export const MODULE_CATEGORIES = {
  PLATFORM_CORE: 'platform-core',
  BUSINESS: 'business',
  DOMINATION: 'domination',
  UGC: 'ugc',
  FACELESS: 'faceless',
  SHARED: 'shared-modules',
  APP_DEVELOPER: 'app-developer',
  ADMIN: 'admin',
} as const;
