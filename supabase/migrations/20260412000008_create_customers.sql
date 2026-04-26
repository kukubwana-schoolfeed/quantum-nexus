-- ============================================================================
-- QUANTUM NEXUS — Migration: customers
-- Table: customers
-- Purpose: Customer CRM. All customer data per business.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE customers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Identity
  first_name            TEXT NOT NULL,
  last_name             TEXT,
  phone_number          TEXT NOT NULL,
  email                 TEXT,
  source                TEXT CHECK (source IN ('qr_bridge', 'manual', 'call', 'whatsapp', 'social', 'import')),

  -- Birthday (sensitive — never exposed to frontend in full)
  birth_day             INTEGER CHECK (birth_day BETWEEN 1 AND 31),
  birth_month           INTEGER CHECK (birth_month BETWEEN 1 AND 12),
  birth_year            INTEGER,

  -- Loyalty
  loyalty_points        INTEGER NOT NULL DEFAULT 0,
  tier                  TEXT NOT NULL DEFAULT 'standard' CHECK (tier IN ('standard', 'priority', 'vip')),
  total_spend           DECIMAL(12,2) DEFAULT 0,
  visit_count           INTEGER DEFAULT 0,

  -- Status
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),

  UNIQUE(tenant_id, phone_number)
);

CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_customers_tier ON customers(tier);
CREATE INDEX idx_customers_birthday ON customers(birth_month, birth_day);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_select" ON customers
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "customers_insert" ON customers
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "customers_update" ON customers
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "customers_delete" ON customers
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- PLACEHOLDER: CUSTOMER_DATABASE — Customer import and dedup triggers
-- REAL INTEGRATION: /src/lib/db/customer-queries.ts
-- PHASE: 3

-- PLACEHOLDER: BIRTHDAY_ENGINE — Birthday token generation trigger
-- REAL INTEGRATION: /src/lib/db/birthday-queries.ts
-- PHASE: 3

-- PLACEHOLDER: LOYALTY_POINTS_ENGINE — Loyalty tier upgrade trigger
-- REAL INTEGRATION: /src/lib/db/loyalty-queries.ts
-- PHASE: 3

-- PLACEHOLDER: OFFLINE_QR_BRIDGE — QR code customer onboarding trigger
-- REAL INTEGRATION: /src/lib/integrations/qr-bridge.ts
-- PHASE: 3
