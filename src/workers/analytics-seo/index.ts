/**
 * Worker 4 — Analytics and SEO Bootstrap
 * Starts the analytics-seo worker and handles graceful shutdown.
 * This is the entry point for the quantum-nexus-worker-analytics Docker container.
 *
 * Concurrency: 3
 * Queue: analytics-seo
 * Schedule: Most jobs are cron-based. Real-time jobs are event-triggered.
 */

import analyticsSeoWorker from './worker';
import { createWorkerLogger } from '../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

log.info('Worker 4 — Analytics and SEO starting...');

async function shutdown(signal: string) {
  log.info(`Received ${signal} — shutting down Worker 4 gracefully...`);
  try {
    await analyticsSeoWorker.close();
    log.info('Worker 4 — Analytics and SEO stopped.');
  } catch (err) {
    log.error('Worker 4 shutdown error', { message: String(err) });
  }
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  log.error('Uncaught exception in Worker 4', { message: err.message });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection in Worker 4', { message: String(reason) });
  process.exit(1);
});

log.info('Worker 4 — Analytics and SEO ready. Waiting for jobs...');
