/**
 * Shared Redis connection configuration for all BullMQ workers.
 * All four worker containers connect to the same Redis instance on Hetzner.
 * If Redis goes down, workers pause gracefully and resume on recovery.
 */

export const redisConnection = {
  host: process.env.REDIS_HOST ?? '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD ?? undefined,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
};

/**
 * BullMQ-compatible connection object (uses `opts` prefix for IORedis).
 * Workers and queues use this as the `connection` option.
 */
export const bullMQConnection = {
  host: redisConnection.host,
  port: redisConnection.port,
  password: redisConnection.password,
  maxRetriesPerRequest: null as null, // BullMQ requires null for blocking connections
};
