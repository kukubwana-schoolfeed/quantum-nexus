-- ============================================================================
-- QUANTUM NEXUS — Migration: analytics_snapshots
-- Table: analytics_snapshots
-- Purpose: Pre-aggregated analytics data for Mission Control. Updated by
--          Worker 4 every 15 minutes. Read-only for Mission Control.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE analytics_snapshots (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  snapshot_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Revenue
  revenue_today         DECIMAL(12,2) DEFAULT 0,
  revenue_this_week     DECIMAL(12,2) DEFAULT 0,
  revenue_this_month    DECIMAL(12,2) DEFAULT 0,

  -- Content
  posts_published_today INTEGER DEFAULT 0,
  posts_scheduled_24h   INTEGER DEFAULT 0,
  total_indexed_pages   INTEGER DEFAULT 0,
  pages_indexed_today   INTEGER DEFAULT 0,

  -- Customers
  new_customers_today   INTEGER DEFAULT 0,
  upcoming_birthdays_7d INTEGER DEFAULT 0,

  -- SEO
  tasks_today_total     INTEGER DEFAULT 0,
  tasks_today_complete  INTEGER DEFAULT 0,

  -- Health
  latest_health_score   INTEGER DEFAULT 0,
  health_trend          TEXT,
  latest_velocity_score INTEGER DEFAULT 0,

  UNIQUE(tenant_id, snapshot_at)
);

CREATE INDEX idx_analytics_snapshots_tenant ON analytics_snapshots(tenant_id);
CREATE INDEX idx_analytics_snapshots_time ON analytics_snapshots(snapshot_at DESC);

ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_snapshots_select" ON analytics_snapshots
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "analytics_snapshots_insert" ON analytics_snapshots
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "analytics_snapshots_update" ON analytics_snapshots
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "analytics_snapshots_delete" ON analytics_snapshots
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- PLACEHOLDER: ANALYTICS_DASHBOARD — Worker 4 aggregation trigger (every 15 min)
-- REAL INTEGRATION: /src/workers/worker4/analytics-aggregator.ts
-- PHASE: 3
