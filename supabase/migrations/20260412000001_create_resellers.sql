-- ============================================================================
-- QUANTUM NEXUS — Migration: resellers
-- Table: resellers
-- Purpose: Agency/reseller accounts that manage multiple client businesses.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE resellers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  brand_name            TEXT NOT NULL,
  brand_logo_url        TEXT,
  brand_primary_color   TEXT,
  brand_secondary_color TEXT,
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  admin_user_id         UUID NOT NULL
);

-- PLACEHOLDER: RESELLER_DASHBOARD — Reseller management triggers and functions
-- REAL INTEGRATION: /src/lib/db/reseller-queries.ts
-- PHASE: 3

-- No RLS — platform-level table, accessed via service role key
-- Super admin and agency_admin access controlled at application layer
