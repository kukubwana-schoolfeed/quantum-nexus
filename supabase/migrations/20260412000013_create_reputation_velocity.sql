-- ============================================================================
-- QUANTUM NEXUS — Migration: reputation_velocity
-- Table: reputation_velocity
-- Purpose: Weekly reputation velocity scores for each tenant. Powers Mission
--          Control panel and client-health-score.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE reputation_velocity (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  week_start            DATE NOT NULL,

  -- Components
  new_backlinks         INTEGER DEFAULT 0,
  new_indexed_pages     INTEGER DEFAULT 0,
  new_reviews           INTEGER DEFAULT 0,
  net_new_followers     INTEGER DEFAULT 0,
  gsc_impressions_growth DECIMAL(6,2) DEFAULT 0,

  -- Composite
  velocity_score        INTEGER NOT NULL DEFAULT 0,
  velocity_trend        TEXT CHECK (velocity_trend IN ('improving', 'stable', 'declining')),

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(tenant_id, week_start)
);

CREATE INDEX idx_reputation_velocity_tenant ON reputation_velocity(tenant_id);
CREATE INDEX idx_reputation_velocity_week ON reputation_velocity(week_start DESC);

ALTER TABLE reputation_velocity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reputation_velocity_select" ON reputation_velocity
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "reputation_velocity_insert" ON reputation_velocity
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "reputation_velocity_update" ON reputation_velocity
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "reputation_velocity_delete" ON reputation_velocity
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- PLACEHOLDER: REPUTATION_VELOCITY_TRACKER — Weekly score calculation trigger
-- REAL INTEGRATION: /src/lib/db/reputation-velocity-queries.ts
-- PHASE: 3

-- PLACEHOLDER: DATAFORSEO — Backlink data for velocity calculation
-- REAL INTEGRATION: /src/lib/integrations/dataforseo.ts
-- PHASE: 3
