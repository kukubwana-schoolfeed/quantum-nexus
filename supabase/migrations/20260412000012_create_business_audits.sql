-- ============================================================================
-- QUANTUM NEXUS — Migration: business_audits
-- Table: business_audits
-- Purpose: Business audit snapshots from business-audit-engine. Baseline and
--          monthly refreshes.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE business_audits (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  audit_type            TEXT NOT NULL CHECK (audit_type IN ('initial', 'monthly_refresh', 'on_demand')),

  -- SEO Baseline
  domain_authority      INTEGER,
  total_indexed_pages   INTEGER,
  backlink_count        INTEGER,
  gsc_impressions_90d   INTEGER,
  gsc_clicks_90d        INTEGER,

  -- GBP Baseline
  gbp_completeness      INTEGER,
  review_count          INTEGER,
  average_rating        DECIMAL(3,2),

  -- Social Baseline
  social_presence       JSONB DEFAULT '{}',

  -- Competitor Gaps
  competitor_data       JSONB DEFAULT '[]',

  -- Recommended Starting Point
  recommended_priority  TEXT[],
  summary               TEXT
);

CREATE INDEX idx_business_audits_tenant ON business_audits(tenant_id);
CREATE INDEX idx_business_audits_type ON business_audits(audit_type);

ALTER TABLE business_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_audits_select" ON business_audits
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "business_audits_insert" ON business_audits
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "business_audits_update" ON business_audits
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "business_audits_delete" ON business_audits
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- PLACEHOLDER: BUSINESS_AUDIT_ENGINE — Audit generation trigger on tenant activation
-- REAL INTEGRATION: /src/lib/db/audit-queries.ts
-- PHASE: 3

-- PLACEHOLDER: DATAFORSEO — Domain authority and backlink data population
-- REAL INTEGRATION: /src/lib/integrations/dataforseo.ts
-- PHASE: 3

-- PLACEHOLDER: GOOGLE_SEARCH_CONSOLE — GSC impression/click data population
-- REAL INTEGRATION: /src/lib/integrations/google-search-console.ts
-- PHASE: 3
