-- ============================================================================
-- QUANTUM NEXUS — Migration: indexed_pages
-- Table: indexed_pages
-- Purpose: Tracks all pages confirmed indexed by Google. Powers Mission Control
--          live indexing feed and reputation velocity score.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE indexed_pages (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  indexed_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  page_url              TEXT NOT NULL,
  page_type             TEXT CHECK (page_type IN ('blog_post', 'landing_page', 'product_page', 'qa_answer', 'other')),
  target_keyword        TEXT,
  gsc_confirmed         BOOLEAN DEFAULT false,

  UNIQUE(tenant_id, page_url)
);

CREATE INDEX idx_indexed_pages_tenant ON indexed_pages(tenant_id);
CREATE INDEX idx_indexed_pages_date ON indexed_pages(indexed_at);

ALTER TABLE indexed_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "indexed_pages_select" ON indexed_pages
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "indexed_pages_insert" ON indexed_pages
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "indexed_pages_update" ON indexed_pages
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "indexed_pages_delete" ON indexed_pages
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- PLACEHOLDER: GOOGLE_SEARCH_CONSOLE — Indexing confirmation from GSC API
-- REAL INTEGRATION: /src/lib/integrations/google-search-console.ts
-- PHASE: 3

-- PLACEHOLDER: SEO_ENGINE — Indexing request submission trigger
-- REAL INTEGRATION: /src/lib/db/seo-queries.ts
-- PHASE: 3
