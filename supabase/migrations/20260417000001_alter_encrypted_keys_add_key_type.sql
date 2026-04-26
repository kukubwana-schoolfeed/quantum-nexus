-- ============================================================================
-- QUANTUM NEXUS — Migration: Alter encrypted_keys — add key_type column
-- Table: encrypted_keys
-- Purpose: Categorise encrypted keys by type for the API key manager and
--          OAuth token manager to handle rotation and refresh differently.
-- Phase: 3 (Real Integrations)
-- Terminal: 4 (Database)
-- ============================================================================

-- Add key_type column — distinguishes OAuth tokens (need refresh) from
-- static API keys (need rotation) and webhook secrets (need rotation)
ALTER TABLE encrypted_keys
  ADD COLUMN IF NOT EXISTS key_type TEXT NOT NULL DEFAULT 'api_key'
  CHECK (key_type IN ('api_key', 'oauth_token', 'webhook_secret'));

-- Index for querying keys by type during rotation/refresh sweeps
CREATE INDEX IF NOT EXISTS idx_encrypted_keys_type ON encrypted_keys(key_type);

-- Composite index for: "get all OAuth tokens expiring soon for a tenant"
-- (used by OAuth token refresh worker)
CREATE INDEX IF NOT EXISTS idx_encrypted_keys_tenant_type_expires
  ON encrypted_keys(tenant_id, key_type, expires_at)
  WHERE expires_at IS NOT NULL AND key_type = 'oauth_token';

-- PLACEHOLDER: OAUTH_TOKEN_MANAGER — Use key_type='oauth_token' to find tokens needing refresh
-- REAL INTEGRATION: /src/lib/auth/oauth-token-manager.ts
-- PHASE: 3

-- PLACEHOLDER: API_KEY_MANAGER — Use key_type='api_key' to find keys needing rotation
-- REAL INTEGRATION: /src/lib/auth/api-key-manager.ts
-- PHASE: 3
