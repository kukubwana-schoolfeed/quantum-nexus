/**
 * Worker 2 — Social Publishing Bootstrap
 * Starts the social-publishing worker and handles graceful shutdown.
 * This is the entry point for the quantum-nexus-worker-publish Docker container.
 *
 * Concurrency: 10
 * Queue: social-publishing
 */

import socialPublishingWorker from './worker';
import { createWorkerLogger } from '../shared/logger';

const log = createWorkerLogger(2, 'social-publishing');

log.info('Worker 2 — Social Publishing starting...');

async function shutdown(signal: string) {
  log.info(`Received ${signal} — shutting down Worker 2 gracefully...`);
  try {
    await socialPublishingWorker.close();
    log.info('Worker 2 — Social Publishing stopped.');
  } catch (err) {
    log.error('Worker 2 shutdown error', { message: String(err) });
  }
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  log.error('Uncaught exception in Worker 2', { message: err.message });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection in Worker 2', { message: String(reason) });
  process.exit(1);
});

log.info('Worker 2 — Social Publishing ready. Waiting for jobs...');
