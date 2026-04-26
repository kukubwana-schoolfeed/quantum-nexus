-- ============================================================================
-- QUANTUM NEXUS — Migration: business_profiles
-- Table: business_profiles
-- Purpose: Extended business information beyond the tenant record. Niche-specific
--          data, brand voice, content preferences.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE business_profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Business Details
  niche                 TEXT NOT NULL,
  niche_profile_id      UUID REFERENCES niche_profiles(id),
  location              TEXT NOT NULL,
  website_url           TEXT,
  phone_number          TEXT,

  -- Brand
  logo_url              TEXT,
  brand_primary_color   TEXT,
  brand_secondary_color TEXT,
  brand_voice_tone      TEXT NOT NULL DEFAULT 'professional',
  content_language      TEXT NOT NULL DEFAULT 'english',
  fallback_message      TEXT NOT NULL DEFAULT 'Let me get back to you on that.',

  -- Content Preferences
  keyword_blocklist     TEXT[] DEFAULT '{}',
  preferred_formats     TEXT[] DEFAULT '{}',
  posting_schedule      JSONB DEFAULT '{}',

  -- Twilio
  twilio_phone_number   TEXT UNIQUE,

  UNIQUE(tenant_id)
);

CREATE INDEX idx_business_profiles_tenant ON business_profiles(tenant_id);

ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_profiles_select" ON business_profiles
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "business_profiles_insert" ON business_profiles
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "business_profiles_update" ON business_profiles
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "business_profiles_delete" ON business_profiles
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- PLACEHOLDER: ONBOARDING_ENGINE — Profile completeness scoring trigger
-- REAL INTEGRATION: /src/lib/db/onboarding-queries.ts
-- PHASE: 3

-- PLACEHOLDER: COMPLETENESS_SCORING — Auto-update tenant.completeness_score on profile change
-- REAL INTEGRATION: /src/lib/db/completeness-queries.ts
-- PHASE: 3

-- PLACEHOLDER: TWILIO — Twilio phone number assignment trigger
-- REAL INTEGRATION: /src/lib/integrations/twilio.ts
-- PHASE: 3
