/**
 * Worker 3 — AI Scene Generation Bootstrap
 * Starts the ai-scene-generation worker and handles graceful shutdown.
 * This is the entry point for the quantum-nexus-worker-aiscene Docker container.
 *
 * Concurrency: 1 (strictly one RunwayML job at a time)
 * Throttle: 30 seconds minimum between job starts
 * Queue: ai-scene-generation
 */

import aiSceneGenerationWorker from './worker';
import { createWorkerLogger } from '../shared/logger';

const log = createWorkerLogger(3, 'ai-scene-generation');

log.info('Worker 3 — AI Scene Generation starting...');

async function shutdown(signal: string) {
  log.info(`Received ${signal} — shutting down Worker 3 gracefully...`);
  try {
    await aiSceneGenerationWorker.close();
    log.info('Worker 3 — AI Scene Generation stopped.');
  } catch (err) {
    log.error('Worker 3 shutdown error', { message: String(err) });
  }
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  log.error('Uncaught exception in Worker 3', { message: err.message });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection in Worker 3', { message: String(reason) });
  process.exit(1);
});

log.info('Worker 3 — AI Scene Generation ready. Waiting for jobs...');
