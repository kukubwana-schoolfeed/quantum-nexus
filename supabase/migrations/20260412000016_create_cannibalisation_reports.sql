-- ============================================================================
-- QUANTUM NEXUS — Migration: cannibalisation_reports
-- Table: cannibalisation_reports
-- Purpose: Keyword cannibalisation detection results from
--          keyword-cannibalisation-detector.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE cannibalisation_reports (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  detected_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  conflicting_keyword   TEXT NOT NULL,
  strong_post_id        UUID REFERENCES content_posts(id),
  weak_post_id          UUID REFERENCES content_posts(id),
  strong_post_url       TEXT,
  weak_post_url         TEXT,
  recommended_action    TEXT NOT NULL CHECK (recommended_action IN ('consolidate', 'redirect')),

  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'dismissed')),
  resolved_at           TIMESTAMPTZ,
  resolved_by           UUID
);

CREATE INDEX idx_cannibalisation_tenant ON cannibalisation_reports(tenant_id);
CREATE INDEX idx_cannibalisation_status ON cannibalisation_reports(status);

ALTER TABLE cannibalisation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cannibalisation_reports_select" ON cannibalisation_reports
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "cannibalisation_reports_insert" ON cannibalisation_reports
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "cannibalisation_reports_update" ON cannibalisation_reports
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "cannibalisation_reports_delete" ON cannibalisation_reports
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- PLACEHOLDER: KEYWORD_CANNIBALISATION_DETECTOR — Detection scan trigger
-- REAL INTEGRATION: /src/lib/db/cannibalisation-queries.ts
-- PHASE: 3

-- PLACEHOLDER: GOOGLE_SEARCH_CONSOLE — Keyword ranking data for detection
-- REAL INTEGRATION: /src/lib/integrations/google-search-console.ts
-- PHASE: 3
