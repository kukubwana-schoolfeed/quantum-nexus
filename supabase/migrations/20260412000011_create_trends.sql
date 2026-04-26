-- ============================================================================
-- QUANTUM NEXUS — Migration: trends
-- Table: trends
-- Purpose: Active and historical trend data from trend-intelligence-engine.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE trends (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  trend_type            TEXT NOT NULL CHECK (trend_type IN ('keyword', 'phrase', 'hashtag', 'sound', 'format', 'topic')),
  trend_text            TEXT NOT NULL,
  platform              TEXT,
  score                 INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  status                TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'ACTIVE', 'AGING', 'EXPIRED')),

  detected_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  expired_at            TIMESTAMPTZ,
  expiry_reason         TEXT,

  -- Usage tracking
  times_used_in_content INTEGER DEFAULT 0,
  last_used_at          TIMESTAMPTZ
);

CREATE INDEX idx_trends_tenant ON trends(tenant_id);
CREATE INDEX idx_trends_status ON trends(status);
CREATE INDEX idx_trends_score ON trends(score DESC);

ALTER TABLE trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trends_select" ON trends
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "trends_insert" ON trends
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "trends_update" ON trends
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "trends_delete" ON trends
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- PLACEHOLDER: TREND_INTELLIGENCE_ENGINE — Trend detection and scoring triggers
-- REAL INTEGRATION: /src/lib/db/trend-queries.ts
-- PHASE: 3

-- PLACEHOLDER: GEMINI_FLASH — Bulk trend scanning from social platforms
-- REAL INTEGRATION: /src/lib/integrations/vertex-ai.ts
-- PHASE: 3
