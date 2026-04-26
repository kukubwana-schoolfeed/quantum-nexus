-- ============================================================================
-- QUANTUM NEXUS — Migration: birthday_tokens
-- Table: birthday_tokens
-- Purpose: Single-use QR tokens for birthday redemptions.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE birthday_tokens (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id           UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  token                 TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  birth_year_this_run   INTEGER NOT NULL,
  offer_description     TEXT NOT NULL,
  expires_at            TIMESTAMPTZ NOT NULL,
  redeemed              BOOLEAN NOT NULL DEFAULT false,
  redeemed_at           TIMESTAMPTZ,
  redeemed_by_staff     UUID
);

CREATE INDEX idx_birthday_tokens_tenant ON birthday_tokens(tenant_id);
CREATE INDEX idx_birthday_tokens_token ON birthday_tokens(token);

ALTER TABLE birthday_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "birthday_tokens_select" ON birthday_tokens
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "birthday_tokens_insert" ON birthday_tokens
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "birthday_tokens_update" ON birthday_tokens
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "birthday_tokens_delete" ON birthday_tokens
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- PLACEHOLDER: BIRTHDAY_ENGINE — Token generation and expiry triggers
-- REAL INTEGRATION: /src/lib/db/birthday-queries.ts
-- PHASE: 3

-- PLACEHOLDER: OFFLINE_QR_BRIDGE — QR code generation for token
-- REAL INTEGRATION: /src/lib/integrations/qr-bridge.ts
-- PHASE: 3
