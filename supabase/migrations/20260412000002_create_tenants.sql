-- ============================================================================
-- QUANTUM NEXUS — Migration: tenants
-- Table: tenants
-- Purpose: Master record for every business/creator account on the platform.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE tenants (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Identity
  business_name         TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  user_type             TEXT NOT NULL CHECK (user_type IN ('business', 'ugc_creator', 'faceless_creator', 'app_developer')),

  -- Billing and Tier
  tier                  TEXT NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'growth', 'pro', 'enterprise', 'internal')),
  billing_type          TEXT NOT NULL DEFAULT 'paid' CHECK (billing_type IN ('paid', 'internal', 'credits')),
  monthly_credit_allowance INTEGER DEFAULT 0,
  credits_used_this_month  INTEGER DEFAULT 0,
  credit_granted_by     UUID REFERENCES tenants(id),

  -- Status
  status                TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'active', 'grace_period', 'suspended', 'archived', 'rejected')),
  activated_at          TIMESTAMPTZ,
  suspended_at          TIMESTAMPTZ,
  archived_at           TIMESTAMPTZ,
  rejection_reason      TEXT,

  -- Sprint Mode
  sprint_mode_active    BOOLEAN NOT NULL DEFAULT true,
  sprint_mode_ends_at   TIMESTAMPTZ,

  -- Reseller
  reseller_id           UUID REFERENCES resellers(id),

  -- Completeness
  completeness_score    INTEGER NOT NULL DEFAULT 0 CHECK (completeness_score BETWEEN 0 AND 100),
  content_generation_unlocked   BOOLEAN NOT NULL DEFAULT false,
  publishing_unlocked           BOOLEAN NOT NULL DEFAULT false,
  analytics_unlocked            BOOLEAN NOT NULL DEFAULT false,

  -- Audit
  initial_audit_complete        BOOLEAN NOT NULL DEFAULT false,

  -- Admin
  admin_approved_by     UUID,
  admin_approved_at     TIMESTAMPTZ,
  admin_notes           TEXT
);

CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_tier ON tenants(tier);
CREATE INDEX idx_tenants_reseller ON tenants(reseller_id);
CREATE INDEX idx_tenants_slug ON tenants(slug);

-- No RLS — platform-level table, accessed via service role key
-- Tenant isolation enforced at application layer via auth.jwt() claims

-- PLACEHOLDER: BILLING_ENGINE — Credit tracking triggers
-- REAL INTEGRATION: /src/lib/db/billing-queries.ts
-- PHASE: 3

-- PLACEHOLDER: ADMIN_APPROVAL_GATE — Status transition triggers
-- REAL INTEGRATION: /src/lib/db/approval-queries.ts
-- PHASE: 3

-- PLACEHOLDER: SPRINT_MODE_ENGINE — Sprint mode expiration triggers
-- REAL INTEGRATION: /src/lib/db/sprint-queries.ts
-- PHASE: 3
