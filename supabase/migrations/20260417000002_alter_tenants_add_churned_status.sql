-- ============================================================================
-- QUANTUM NEXUS — Migration: Alter tenants — add 'churned' to status CHECK
-- Table: tenants
-- Purpose: Track churned tenants separately from archived ones.
--          'archived' = admin deliberately deactivated (e.g. on request).
--          'churned'  = tenant stopped paying and did not return after grace.
--          Required by billing-engine grace period automation and
--          client-health-score monitoring in Phase 3.
-- Phase: 3 (Real Integrations)
-- Terminal: 4 (Database)
-- ============================================================================

-- Drop existing CHECK constraint on tenants.status and replace with expanded set.
-- PostgreSQL requires dropping the old constraint before adding the new one.
-- The constraint name is auto-generated; we find it from the catalog.

DO $$
DECLARE
  _constraint_name TEXT;
BEGIN
  -- Find the CHECK constraint on tenants.status
  SELECT con.conname INTO _constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
  WHERE rel.relname = 'tenants'
    AND att.attname = 'status'
    AND con.contype = 'c'
    AND nsp.nspname = 'public'
  LIMIT 1;

  IF _constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE tenants DROP CONSTRAINT %I', _constraint_name);
  END IF;
END $$;

-- Add the expanded CHECK constraint with 'churned' status
ALTER TABLE tenants
  ADD CONSTRAINT tenants_status_check
  CHECK (status IN (
    'pending_approval',
    'active',
    'grace_period',
    'suspended',
    'churned',
    'archived',
    'rejected'
  ));

-- Add churned_at timestamp — mirrors activated_at, suspended_at, archived_at
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS churned_at TIMESTAMPTZ;

-- Update the status index to include churned for filtering
-- (idx_tenants_status already exists from Phase 1 — no action needed,
--  the existing B-tree index covers all status values automatically)

-- PLACEHOLDER: BILLING_ENGINE — Set status='churned' after grace period expires
--   and no payment received. Set churned_at = now().
-- REAL INTEGRATION: /src/lib/db/billing-queries.ts
-- PHASE: 3

-- PLACEHOLDER: CLIENT_HEALTH_SCORE — Track churned tenants in super admin dashboard
-- REAL INTEGRATION: /src/lib/db/client-health-queries.ts
-- PHASE: 3
