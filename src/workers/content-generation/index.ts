/**
 * Worker 1 — Content Generation Bootstrap
 * Starts the content-generation worker and handles graceful shutdown.
 * This is the entry point for the quantum-nexus-worker-content Docker container.
 *
 * Concurrency: 5
 * Queue: content-generation
 */

import contentGenerationWorker from './worker';
import { createWorkerLogger } from '../shared/logger';

const log = createWorkerLogger(1, 'content-generation');

log.info('Worker 1 — Content Generation starting...');

// Graceful shutdown handlers
async function shutdown(signal: string) {
  log.info(`Received ${signal} — shutting down Worker 1 gracefully...`);
  try {
    await contentGenerationWorker.close();
    log.info('Worker 1 — Content Generation stopped.');
  } catch (err) {
    log.error('Worker 1 shutdown error', { message: String(err) });
  }
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  log.error('Uncaught exception in Worker 1', { message: err.message });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection in Worker 1', { message: String(reason) });
  process.exit(1);
});

log.info('Worker 1 — Content Generation ready. Waiting for jobs...');
