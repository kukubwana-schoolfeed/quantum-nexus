-- ============================================================================
-- QUANTUM NEXUS — Migration: niche_profiles
-- Table: niche_profiles
-- Purpose: Niche library and auto-researched niche profiles. Shared across all
--          tenants in the same niche.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE niche_profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  niche_name            TEXT NOT NULL UNIQUE,
  status                TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'active', 'deprecated')),
  approved_by           UUID,
  approved_at           TIMESTAMPTZ,

  -- Content Strategy
  primary_keywords      TEXT[] NOT NULL DEFAULT '{}',
  content_formats       TEXT[] NOT NULL DEFAULT '{}',
  tone                  TEXT NOT NULL,
  platforms             TEXT[] NOT NULL DEFAULT '{}',
  target_audience       TEXT NOT NULL,
  posting_frequency     JSONB NOT NULL DEFAULT '{}',

  -- Regulatory
  regulatory_flags      TEXT[] DEFAULT '{}',
  content_restrictions  TEXT[] DEFAULT '{}',

  -- SEO
  seo_keyword_clusters  JSONB DEFAULT '[]',
  competitor_domains    TEXT[] DEFAULT '{}'
);

-- No RLS — platform-level shared data
-- Read access for all authenticated users, write access via service role only

-- PLACEHOLDER: NICHE_RESEARCH — Auto-populate from DataForSEO
-- REAL INTEGRATION: /src/lib/integrations/dataforseo.ts
-- PHASE: 3

-- PLACEHOLDER: NICHE_INTELLIGENCE — Niche approval workflow trigger
-- REAL INTEGRATION: /src/lib/db/niche-queries.ts
-- PHASE: 3
