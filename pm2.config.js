/**
 * PM2 Process Configuration — Quantum Nexus
 *
 * Runs the Next.js app and all 4 BullMQ workers as separate processes.
 * Matches the Docker container architecture defined in ARCHITECTURE.md:
 *   - quantum-nexus-app          (Next.js frontend + API routes)
 *   - quantum-nexus-worker-content   (Worker 1: Content generation, concurrency 5)
 *   - quantum-nexus-worker-publish   (Worker 2: Publishing, concurrency 10)
 *   - quantum-nexus-worker-aiscene   (Worker 3: AI Scene / RunwayML, concurrency 1)
 *   - quantum-nexus-worker-analytics (Worker 4: Analytics + SEO, concurrency 3)
 *
 * Usage:
 *   pm2 start pm2.config.js --env production
 *   pm2 start pm2.config.js --env development
 *
 * All processes share the same Redis instance (REDIS_URL env var).
 * All processes read from the same Supabase instance.
 *
 * Worker entry points are owned by Terminal 2.
 * This file is maintained by Terminal 1 for local development orchestration only.
 * In production, Coolify manages Docker containers — PM2 is NOT used in production.
 */

module.exports = {
  apps: [
    {
      name: 'quantum-nexus-app',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: './',
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'quantum-nexus-worker-content',
      script: 'src/workers/content/worker.ts',
      cwd: './',
      env_development: {
        NODE_ENV: 'development',
        WORKER_ID: 'worker-1-content',
      },
      env_production: {
        NODE_ENV: 'production',
        WORKER_ID: 'worker-1-content',
      },
      instances: 1,
      autorestart: true,
      max_restarts: 15,
      watch: false,
      max_memory_restart: '2G',
      kill_timeout: 30000,
      listen_timeout: 10000,
    },
    {
      name: 'quantum-nexus-worker-publish',
      script: 'src/workers/publishing/worker.ts',
      cwd: './',
      env_development: {
        NODE_ENV: 'development',
        WORKER_ID: 'worker-2-publish',
      },
      env_production: {
        NODE_ENV: 'production',
        WORKER_ID: 'worker-2-publish',
      },
      instances: 1,
      autorestart: true,
      max_restarts: 15,
      watch: false,
      max_memory_restart: '2G',
      kill_timeout: 30000,
      listen_timeout: 10000,
    },
    {
      name: 'quantum-nexus-worker-aiscene',
      script: 'src/workers/ai-scene/worker.ts',
      cwd: './',
      env_development: {
        NODE_ENV: 'development',
        WORKER_ID: 'worker-3-aiscene',
      },
      env_production: {
        NODE_ENV: 'production',
        WORKER_ID: 'worker-3-aiscene',
      },
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      watch: false,
      max_memory_restart: '4G',
      kill_timeout: 60000,
      listen_timeout: 15000,
    },
    {
      name: 'quantum-nexus-worker-analytics',
      script: 'src/workers/analytics/worker.ts',
      cwd: './',
      env_development: {
        NODE_ENV: 'development',
        WORKER_ID: 'worker-4-analytics',
      },
      env_production: {
        NODE_ENV: 'production',
        WORKER_ID: 'worker-4-analytics',
      },
      instances: 1,
      autorestart: true,
      max_restarts: 15,
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 30000,
      listen_timeout: 10000,
    },
  ],
};
