-- ============================================================================
-- QUANTUM NEXUS — Migration: knowledge_base
-- Table: knowledge_base
-- Purpose: Single source of truth for all business information used in AI responses.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE knowledge_base (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  category              TEXT NOT NULL CHECK (category IN ('faq', 'price_list', 'service_description', 'product', 'policy', 'custom')),
  title                 TEXT NOT NULL,
  content               TEXT NOT NULL,
  is_active             BOOLEAN NOT NULL DEFAULT true,
  source                TEXT CHECK (source IN ('manual', 'document_upload', 'ai_extracted'))
);

CREATE INDEX idx_knowledge_base_tenant ON knowledge_base(tenant_id);
CREATE INDEX idx_knowledge_base_category ON knowledge_base(category);

ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "knowledge_base_select" ON knowledge_base
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "knowledge_base_insert" ON knowledge_base
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "knowledge_base_update" ON knowledge_base
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "knowledge_base_delete" ON knowledge_base
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- PLACEHOLDER: KNOWLEDGE_BASE_BUILDER — AI extraction trigger
-- REAL INTEGRATION: /src/lib/db/knowledge-base-queries.ts
-- PHASE: 3

-- PLACEHOLDER: CLAUDE_SONNET — Document processing and AI extraction
-- REAL INTEGRATION: /src/lib/integrations/vertex-ai.ts
-- PHASE: 3
