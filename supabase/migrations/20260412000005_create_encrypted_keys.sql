-- ============================================================================
-- QUANTUM NEXUS — Migration: encrypted_keys
-- Table: encrypted_keys
-- Purpose: AES-256-GCM encrypted storage for all business API keys and OAuth tokens.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE encrypted_keys (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key_name              TEXT NOT NULL,
  encrypted_value       TEXT NOT NULL,
  iv                    TEXT NOT NULL,
  auth_tag              TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at            TIMESTAMPTZ,

  UNIQUE(tenant_id, key_name)
);

CREATE INDEX idx_encrypted_keys_tenant ON encrypted_keys(tenant_id);

ALTER TABLE encrypted_keys ENABLE ROW LEVEL SECURITY;

-- RLS: only service role can access this table. Never via regular auth.
-- No SELECT/INSERT/UPDATE/DELETE policies for authenticated users.
-- All access through service role key at application layer only.

-- PLACEHOLDER: OAUTH_TOKEN_MANAGER — OAuth token refresh triggers
-- REAL INTEGRATION: /src/lib/auth/oauth-token-manager.ts
-- PHASE: 3

-- PLACEHOLDER: API_KEY_MANAGER — Key rotation and expiry triggers
-- REAL INTEGRATION: /src/lib/auth/api-key-manager.ts
-- PHASE: 3
