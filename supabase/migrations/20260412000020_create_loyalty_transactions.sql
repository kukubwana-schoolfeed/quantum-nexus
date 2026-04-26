-- ============================================================================
-- QUANTUM NEXUS — Migration: loyalty_transactions
-- Table: loyalty_transactions
-- Purpose: All loyalty point earning and redemption events.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE loyalty_transactions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id           UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  type                  TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'expire', 'adjustment')),
  points                INTEGER NOT NULL,
  balance_after         INTEGER NOT NULL,
  description           TEXT,
  reference_id          TEXT
);

CREATE INDEX idx_loyalty_tenant ON loyalty_transactions(tenant_id);
CREATE INDEX idx_loyalty_customer ON loyalty_transactions(customer_id);

ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loyalty_transactions_select" ON loyalty_transactions
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "loyalty_transactions_insert" ON loyalty_transactions
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "loyalty_transactions_update" ON loyalty_transactions
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "loyalty_transactions_delete" ON loyalty_transactions
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- PLACEHOLDER: LOYALTY_POINTS_ENGINE — Balance tracking and tier upgrade triggers
-- REAL INTEGRATION: /src/lib/db/loyalty-queries.ts
-- PHASE: 3
