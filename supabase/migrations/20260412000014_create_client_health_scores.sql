-- ============================================================================
-- QUANTUM NEXUS — Migration: client_health_scores
-- Table: client_health_scores
-- Purpose: Daily composite health scores per tenant. Visible on Mission Control
--          and super admin dashboard.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE client_health_scores (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  score_date            DATE NOT NULL,

  -- Component Scores
  seo_score             INTEGER DEFAULT 0,
  content_score         INTEGER DEFAULT 0,
  review_score          INTEGER DEFAULT 0,
  social_score          INTEGER DEFAULT 0,
  entity_score          INTEGER DEFAULT 0,

  -- Composite
  total_score           INTEGER NOT NULL DEFAULT 0 CHECK (total_score BETWEEN 0 AND 100),
  trend                 TEXT CHECK (trend IN ('improving', 'stable', 'declining')),

  -- Recommendations
  top_recommendations   TEXT[] DEFAULT '{}',

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(tenant_id, score_date)
);

CREATE INDEX idx_client_health_tenant ON client_health_scores(tenant_id);
CREATE INDEX idx_client_health_date ON client_health_scores(score_date DESC);

ALTER TABLE client_health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_health_scores_select" ON client_health_scores
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "client_health_scores_insert" ON client_health_scores
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "client_health_scores_update" ON client_health_scores
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "client_health_scores_delete" ON client_health_scores
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- PLACEHOLDER: CLIENT_HEALTH_SCORE — Daily composite score calculation trigger
-- REAL INTEGRATION: /src/lib/db/client-health-queries.ts
-- PHASE: 3
