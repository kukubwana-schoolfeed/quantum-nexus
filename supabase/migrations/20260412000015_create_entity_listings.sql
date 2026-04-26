-- ============================================================================
-- QUANTUM NEXUS — Migration: entity_listings
-- Table: entity_listings
-- Purpose: Tracks all directory listings submitted by entity-builder and their
--          consistency status.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE entity_listings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  directory_name        TEXT NOT NULL,
  directory_url         TEXT,
  listing_url           TEXT,
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'live', 'inconsistent', 'rejected')),

  -- NAP at time of submission
  submitted_name        TEXT NOT NULL,
  submitted_address     TEXT,
  submitted_phone       TEXT,
  submitted_website     TEXT,

  -- Consistency check
  last_checked_at       TIMESTAMPTZ,
  is_consistent         BOOLEAN,
  inconsistency_notes   TEXT,

  UNIQUE(tenant_id, directory_name)
);

CREATE INDEX idx_entity_listings_tenant ON entity_listings(tenant_id);
CREATE INDEX idx_entity_listings_status ON entity_listings(status);

ALTER TABLE entity_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entity_listings_select" ON entity_listings
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "entity_listings_insert" ON entity_listings
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "entity_listings_update" ON entity_listings
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "entity_listings_delete" ON entity_listings
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- PLACEHOLDER: ENTITY_BUILDER — Directory submission trigger
-- REAL INTEGRATION: /src/lib/db/entity-builder-queries.ts
-- PHASE: 3

-- PLACEHOLDER: NAP_CONSISTENCY_CHECK — Periodic consistency verification trigger
-- REAL INTEGRATION: /src/lib/db/entity-consistency-queries.ts
-- PHASE: 3
