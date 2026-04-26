-- ============================================================================
-- QUANTUM NEXUS — Migration: notifications
-- Table: notifications
-- Purpose: All in-app notifications per tenant.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE notifications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  type                  TEXT NOT NULL,
  title                 TEXT NOT NULL,
  body                  TEXT NOT NULL,
  read                  BOOLEAN NOT NULL DEFAULT false,
  read_at               TIMESTAMPTZ,
  action_url            TEXT,
  priority              TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low'))
);

CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX idx_notifications_read ON notifications(read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "notifications_delete" ON notifications
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- PLACEHOLDER: NOTIFICATION_ENGINE — Notification dispatch trigger
-- REAL INTEGRATION: /src/lib/db/notification-queries.ts
-- PHASE: 3
