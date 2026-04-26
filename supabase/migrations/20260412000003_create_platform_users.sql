-- ============================================================================
-- QUANTUM NEXUS — Migration: platform_users
-- Table: platform_users
-- Purpose: User accounts with roles and tenant associations.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE platform_users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id          UUID NOT NULL UNIQUE,
  tenant_id             UUID REFERENCES tenants(id),
  reseller_id           UUID REFERENCES resellers(id),
  role                  TEXT NOT NULL CHECK (role IN ('business_owner', 'ugc_creator', 'faceless_creator', 'app_developer', 'agency_admin', 'sub_admin', 'super_admin')),
  permissions           JSONB DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at          TIMESTAMPTZ
);

CREATE INDEX idx_platform_users_tenant ON platform_users(tenant_id);
CREATE INDEX idx_platform_users_role ON platform_users(role);

-- No RLS — platform-level table, accessed via service role key
-- Role-based access controlled at application and middleware layer

-- PLACEHOLDER: AUTH_SYSTEM — JWT claims trigger to sync auth_user_id with Supabase Auth
-- REAL INTEGRATION: /src/lib/auth/user-sync.ts
-- PHASE: 3
