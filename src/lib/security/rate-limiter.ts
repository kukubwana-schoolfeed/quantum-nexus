/**
 * Quantum Nexus — Rate Limiter
 * Terminal 3 — Security, Auth, Middleware
 *
 * Enforces rate limits for every external API in code (RULE S-5).
 * Tracks API call counts per platform per token per hour using Redis.
 * The system must not exceed 75% of any platform's stated rate limit (RULE S-5).
 * If approaching the limit, jobs queue and process in the next window automatically.
 *
 * PHASE 3: Real Redis-backed rate tracking using ioredis.
 * Key format: ratelimit:{tenantId}:{platform}:{tokenIdentifier}:{window}
 * Uses Redis INCR + EXPIRE for atomic count-and-set with TTL.
 *
 * @module security/rate-limiter
 */

import Redis from 'ioredis';
import { REDIS_URL } from '../config/env';

/** Supported platforms for rate limiting */
export type RateLimitedPlatform =
  | 'meta_facebook'
  | 'meta_instagram'
  | 'tiktok'
  | 'linkedin'
  | 'youtube'
  | 'pinterest'
  | 'reddit'
  | 'gsc'
  | 'ga4'
  | 'gbp'
  | 'anthropic'
  | 'elevenlabs'
  | 'runway'
  | 'twilio';

/** Result of a rate limit check */
export interface RateLimitResult {
  /** Whether the request is allowed under the rate limit */
  allowed: boolean;
  /** Current number of calls made in this window */
  currentCount: number;
  /** Maximum calls allowed in this window (75% of platform limit per RULE S-5) */
  maxAllowed: number;
  /** Seconds until the rate limit window resets */
  resetInSeconds: number;
}

/** Rate limit configuration for a platform */
export interface RateLimitConfig {
  /** Platform identifier */
  platform: RateLimitedPlatform;
  /** Platform's stated rate limit per hour */
  platformLimitPerHour: number;
  /** 75% of the platform limit — our enforced ceiling (RULE S-5) */
  enforcedLimitPerHour: number;
  /** Window size in seconds */
  windowSeconds: number;
}

/**
 * Platform rate limit configurations.
 * enforcedLimitPerHour is 75% of the platform's stated limit (RULE S-5).
 * @module security/rate-limiter
 */
const PLATFORM_RATE_LIMITS: RateLimitConfig[] = [
  { platform: 'meta_facebook', platformLimitPerHour: 200, enforcedLimitPerHour: 150, windowSeconds: 3600 },
  { platform: 'meta_instagram', platformLimitPerHour: 200, enforcedLimitPerHour: 150, windowSeconds: 3600 },
  { platform: 'tiktok', platformLimitPerHour: 100, enforcedLimitPerHour: 75, windowSeconds: 3600 },
  { platform: 'linkedin', platformLimitPerHour: 100, enforcedLimitPerHour: 75, windowSeconds: 3600 },
  { platform: 'youtube', platformLimitPerHour: 100, enforcedLimitPerHour: 75, windowSeconds: 3600 },
  { platform: 'pinterest', platformLimitPerHour: 100, enforcedLimitPerHour: 75, windowSeconds: 3600 },
  { platform: 'reddit', platformLimitPerHour: 60, enforcedLimitPerHour: 45, windowSeconds: 3600 },
  { platform: 'gsc', platformLimitPerHour: 200, enforcedLimitPerHour: 150, windowSeconds: 3600 },
  { platform: 'ga4', platformLimitPerHour: 200, enforcedLimitPerHour: 150, windowSeconds: 3600 },
  { platform: 'gbp', platformLimitPerHour: 150, enforcedLimitPerHour: 112, windowSeconds: 3600 },
  { platform: 'anthropic', platformLimitPerHour: 1000, enforcedLimitPerHour: 750, windowSeconds: 3600 },
  { platform: 'elevenlabs', platformLimitPerHour: 100, enforcedLimitPerHour: 75, windowSeconds: 3600 },
  { platform: 'runway', platformLimitPerHour: 10, enforcedLimitPerHour: 7, windowSeconds: 3600 },
  { platform: 'twilio', platformLimitPerHour: 100, enforcedLimitPerHour: 75, windowSeconds: 3600 },
];

/**
 * Redis client instance for rate limiting.
 * Lazy-initialised on first use to avoid connection errors at import time.
 *
 * @module security/rate-limiter
 */
let redis: Redis | null = null;

/**
 * Returns the Redis client, creating it on first call.
 * Uses REDIS_URL from centralised env config (RULE G-5).
 *
 * @returns {Redis} The ioredis client instance
 * @throws {Error} If Redis connection fails
 * @module security/rate-limiter
 */
function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 3000),
      lazyConnect: true,
    });

    redis.on('error', (err) => {
      console.error('[RateLimiter] Redis connection error:', err.message);
    });
  }
  return redis;
}

/**
 * Builds the Redis key for rate limit tracking.
 * Format: ratelimit:{tenantId}:{platform}:{tokenIdentifier}:{windowStart}
 * This ensures per-tenant, per-platform, per-token tracking in hourly windows.
 *
 * @param {string} tenantId - The tenant UUID
 * @param {RateLimitedPlatform} platform - The platform identifier
 * @param {string} tokenIdentifier - Unique token identifier
 * @returns {string} The Redis key for this rate limit window
 * @module security/rate-limiter
 */
function buildRedisKey(
  tenantId: string,
  platform: RateLimitedPlatform,
  tokenIdentifier: string
): string {
  const windowStart = Math.floor(Date.now() / 3600000); // Hourly window
  return `ratelimit:${tenantId}:${platform}:${tokenIdentifier}:${windowStart}`;
}

/**
 * Checks whether a rate-limited request is allowed (RULE S-5).
 * Tracks API call counts per platform per token per hour in Redis.
 * Must not exceed 75% of the platform's stated rate limit.
 * If approaching the limit, the request is denied and the caller should
 * queue the job for the next window (RULE S-5).
 *
 * @param {string} tenantId - The tenant UUID from JWT claims (RULE MT-2)
 * @param {RateLimitedPlatform} platform - The platform to check rate limits for
 * @param {string} tokenIdentifier - Unique token identifier for per-token tracking
 * @returns {Promise<RateLimitResult>} Whether the request is allowed and current limit status
 * @module security/rate-limiter
 */
export async function checkRateLimit(
  tenantId: string,
  platform: RateLimitedPlatform,
  tokenIdentifier: string
): Promise<RateLimitResult> {
  const config = getRateLimitConfig(platform);
  if (!config) {
    // Unknown platform — allow by default (no rate limit configured)
    return {
      allowed: true,
      currentCount: 0,
      maxAllowed: 0,
      resetInSeconds: 3600,
    };
  }

  const key = buildRedisKey(tenantId, platform, tokenIdentifier);

  try {
    const client = getRedis();
    const currentCount = await client.incr(key);

    // Set TTL on first increment in this window
    if (currentCount === 1) {
      await client.expire(key, config.windowSeconds);
    }

    // Get remaining TTL for the reset calculation
    const ttl = await client.ttl(key);
    const resetInSeconds = ttl > 0 ? ttl : config.windowSeconds;

    const allowed = currentCount <= config.enforcedLimitPerHour;

    if (!allowed) {
      console.warn(
        `[RateLimiter] Rate limit reached for tenant ${tenantId}, ` +
        `platform ${platform}. Count: ${currentCount}, Limit: ${config.enforcedLimitPerHour}. ` +
        `Job should queue for next window (RULE S-5).`
      );
    }

    return {
      allowed,
      currentCount,
      maxAllowed: config.enforcedLimitPerHour,
      resetInSeconds,
    };
  } catch (err) {
    // Redis error — fail open (allow the request) but log the error
    console.error('[RateLimiter] Redis error during rate limit check:', err);
    return {
      allowed: true,
      currentCount: 0,
      maxAllowed: config.enforcedLimitPerHour,
      resetInSeconds: config.windowSeconds,
    };
  }
}

/**
 * Increments the rate limit counter after a successful API call.
 * Must be called after every external API request to maintain accurate counts.
 * Uses Redis INCR for atomic increment.
 *
 * @param {string} tenantId - The tenant UUID from JWT claims
 * @param {RateLimitedPlatform} platform - The platform the call was made to
 * @param {string} tokenIdentifier - Unique token identifier
 * @returns {Promise<number>} Updated call count for the current window
 * @module security/rate-limiter
 */
export async function incrementRateLimit(
  tenantId: string,
  platform: RateLimitedPlatform,
  tokenIdentifier: string
): Promise<number> {
  const config = getRateLimitConfig(platform);
  const key = buildRedisKey(tenantId, platform, tokenIdentifier);

  try {
    const client = getRedis();
    const count = await client.incr(key);

    // Set TTL on first increment
    if (count === 1 && config) {
      await client.expire(key, config.windowSeconds);
    }

    return count;
  } catch (err) {
    console.error('[RateLimiter] Redis error during increment:', err);
    return 0;
  }
}

/**
 * Gets the rate limit configuration for a platform.
 *
 * @param {RateLimitedPlatform} platform - The platform to get config for
 * @returns {RateLimitConfig | undefined} The rate limit configuration, or undefined if not configured
 * @module security/rate-limiter
 */
export function getRateLimitConfig(platform: RateLimitedPlatform): RateLimitConfig | undefined {
  return PLATFORM_RATE_LIMITS.find((config) => config.platform === platform);
}

/**
 * Calculates when the next available window opens for a rate-limited platform.
 * Used to schedule deferred jobs when approaching the rate limit (RULE S-5).
 * Returns the remaining TTL of the current Redis key.
 *
 * @param {string} tenantId - The tenant UUID from JWT claims
 * @param {RateLimitedPlatform} platform - The platform to check
 * @param {string} tokenIdentifier - Unique token identifier
 * @returns {Promise<number>} Seconds until the next available window
 * @module security/rate-limiter
 */
export async function getNextAvailableWindow(
  tenantId: string,
  platform: RateLimitedPlatform,
  tokenIdentifier: string
): Promise<number> {
  const key = buildRedisKey(tenantId, platform, tokenIdentifier);

  try {
    const client = getRedis();
    const ttl = await client.ttl(key);
    return ttl > 0 ? ttl : 0;
  } catch (err) {
    console.error('[RateLimiter] Redis error during window check:', err);
    return 0;
  }
}