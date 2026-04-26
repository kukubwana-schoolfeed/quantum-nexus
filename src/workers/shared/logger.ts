/**
 * Structured logger for all BullMQ workers.
 * Produces consistent, machine-parseable log lines for every job event.
 * Used by job processors to log what they WOULD do in Phase 2,
 * and by worker entry points for lifecycle events.
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  level: LogLevel;
  worker: number;
  queue: string;
  job_name: string;
  job_id?: string;
  tenant_id?: string;
  message: string;
  would_do?: string[];
  payload_summary?: Record<string, unknown>;
  duration_ms?: number;
  timestamp: string;
}

/**
 * Creates a scoped logger bound to a specific worker and queue.
 *
 * @param workerId - Worker number (1-4)
 * @param queueName - BullMQ queue name
 * @returns Object with log methods that auto-attach worker/queue context
 */
export function createWorkerLogger(workerId: number, queueName: string) {
  const base = { worker: workerId, queue: queueName };

  function format(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  return {
    debug(message: string, meta: Partial<LogEntry> = {}) {
      const entry: LogEntry = { ...base, job_name: '', level: LogLevel.DEBUG, message, timestamp: new Date().toISOString(), ...meta };
      console.debug(format(entry));
    },

    info(message: string, meta: Partial<LogEntry> = {}) {
      const entry: LogEntry = { ...base, job_name: '', level: LogLevel.INFO, message, timestamp: new Date().toISOString(), ...meta };
      console.log(format(entry));
    },

    warn(message: string, meta: Partial<LogEntry> = {}) {
      const entry: LogEntry = { ...base, job_name: '', level: LogLevel.WARN, message, timestamp: new Date().toISOString(), ...meta };
      console.warn(format(entry));
    },

    error(message: string, meta: Partial<LogEntry> = {}) {
      const entry: LogEntry = { ...base, job_name: '', level: LogLevel.ERROR, message, timestamp: new Date().toISOString(), ...meta };
      console.error(format(entry));
    },

    jobStart(jobName: string, jobId: string | undefined, tenantId: string, wouldDo: string[], payloadSummary?: Record<string, unknown>) {
      const entry: LogEntry = {
        ...base,
        level: LogLevel.INFO,
        job_name: jobName,
        job_id: jobId,
        tenant_id: tenantId,
        message: `START ${jobName}`,
        would_do: wouldDo,
        payload_summary: payloadSummary,
        timestamp: new Date().toISOString(),
      };
      console.log(format(entry));
    },

    jobComplete(jobName: string, jobId: string | undefined, tenantId: string, durationMs: number, resultSummary?: string) {
      const entry: LogEntry = {
        ...base,
        level: LogLevel.INFO,
        job_name: jobName,
        job_id: jobId,
        tenant_id: tenantId,
        message: `COMPLETE ${jobName}`,
        duration_ms: durationMs,
        ...(resultSummary ? { payload_summary: { result: resultSummary } } : {}),
        timestamp: new Date().toISOString(),
      };
      console.log(format(entry));
    },

    jobFailed(jobName: string, jobId: string | undefined, tenantId: string, error: string, durationMs: number) {
      const entry: LogEntry = {
        ...base,
        level: LogLevel.ERROR,
        job_name: jobName,
        job_id: jobId,
        tenant_id: tenantId,
        message: `FAILED ${jobName}`,
        duration_ms: durationMs,
        payload_summary: { error },
        timestamp: new Date().toISOString(),
      };
      console.error(format(entry));
    },
  };
}
