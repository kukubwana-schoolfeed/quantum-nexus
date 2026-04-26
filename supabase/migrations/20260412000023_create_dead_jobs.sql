-- ============================================================================
-- QUANTUM NEXUS — Migration: dead_jobs
-- Table: dead_jobs
-- Purpose: Permanently failed BullMQ jobs for super admin review.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE dead_jobs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID REFERENCES tenants(id),
  failed_at             TIMESTAMPTZ NOT NULL DEFAULT now(),

  queue_name            TEXT NOT NULL,
  job_type              TEXT NOT NULL,
  job_data              JSONB,
  error_message         TEXT NOT NULL,
  attempts              INTEGER NOT NULL,
  bullmq_job_id         TEXT NOT NULL,

  reviewed              BOOLEAN DEFAULT false,
  reviewed_by           UUID,
  reviewed_at           TIMESTAMPTZ,
  resolution_notes      TEXT
);

CREATE INDEX idx_dead_jobs_tenant ON dead_jobs(tenant_id);
CREATE INDEX idx_dead_jobs_reviewed ON dead_jobs(reviewed);
CREATE INDEX idx_dead_jobs_failed ON dead_jobs(failed_at DESC);

-- No RLS — super admin only, accessed via service role key
-- Dead job monitoring is platform-level, not tenant-scoped

-- PLACEHOLDER: DEAD_JOB_MONITOR — Dead job detection and alerting trigger
-- REAL INTEGRATION: /src/workers/dead-job-monitor.ts
-- PHASE: 3

-- PLACEHOLDER: BULLMQ_JOB_REGISTRY — Job failure capture trigger
-- REAL INTEGRATION: /src/lib/db/bullmq-queries.ts
-- PHASE: 3
