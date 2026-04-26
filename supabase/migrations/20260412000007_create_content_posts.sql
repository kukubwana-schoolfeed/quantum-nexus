-- ============================================================================
-- QUANTUM NEXUS — Migration: content_posts
-- Table: content_posts
-- Purpose: All content created by the platform for scheduling and publishing.
-- Phase: 1 (Scaffold)
-- Terminal: 4 (Database)
-- ============================================================================

CREATE TABLE content_posts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Content
  content_type          TEXT NOT NULL CHECK (content_type IN ('social_post', 'blog_post', 'email', 'whatsapp_broadcast', 'sms', 'gbp_post', 'youtube_video', 'reel', 'tiktok', 'pinterest_pin', 'reddit_post', 'linkedin_post')),
  platform              TEXT,
  caption               TEXT,
  media_url             TEXT,
  media_type            TEXT CHECK (media_type IN ('image', 'video', 'carousel', 'document', null)),
  blog_content          TEXT,
  email_subject         TEXT,

  -- SEO (for blog posts)
  target_keyword        TEXT,
  meta_description      TEXT,
  internal_links        TEXT[] DEFAULT '{}',
  is_refreshed          BOOLEAN DEFAULT false,
  original_post_id      UUID REFERENCES content_posts(id),
  recycled_from_id      UUID REFERENCES content_posts(id),

  -- Scheduling
  status                TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_safety', 'pending_approval', 'approved', 'scheduled', 'publishing', 'published', 'failed', 'held', 'cancelled')),
  scheduled_for         TIMESTAMPTZ,
  published_at          TIMESTAMPTZ,

  -- Scoring
  algorithm_score       INTEGER,
  algorithm_score_breakdown JSONB,
  safety_check_result   TEXT CHECK (safety_check_result IN ('pass', 'fail', null)),
  safety_check_reason   TEXT,

  -- Performance (populated after publishing)
  impressions           INTEGER DEFAULT 0,
  reach                 INTEGER DEFAULT 0,
  engagement            INTEGER DEFAULT 0,
  engagement_rate       DECIMAL(5,2),
  clicks                INTEGER DEFAULT 0,
  saves                 INTEGER DEFAULT 0,
  shares                INTEGER DEFAULT 0,
  comments              INTEGER DEFAULT 0,

  -- Trend data
  trend_id              UUID,
  trend_phrase          TEXT
);

CREATE INDEX idx_content_posts_tenant ON content_posts(tenant_id);
CREATE INDEX idx_content_posts_status ON content_posts(status);
CREATE INDEX idx_content_posts_scheduled ON content_posts(scheduled_for);
CREATE INDEX idx_content_posts_platform ON content_posts(platform);

ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_posts_select" ON content_posts
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "content_posts_insert" ON content_posts
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "content_posts_update" ON content_posts
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "content_posts_delete" ON content_posts
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- PLACEHOLDER: CONTENT_MACHINE — Content generation and scheduling triggers
-- REAL INTEGRATION: /src/lib/db/content-queries.ts
-- PHASE: 3

-- PLACEHOLDER: CONTENT_SAFETY_CHECKER — Pre-publish safety check trigger
-- REAL INTEGRATION: /src/lib/integrations/content-safety.ts
-- PHASE: 3

-- PLACEHOLDER: ALGORITHM_SCORING_ENGINE — Score calculation trigger
-- REAL INTEGRATION: /src/lib/db/algorithm-scoring-queries.ts
-- PHASE: 3

-- PLACEHOLDER: SOCIAL_MEDIA_LAYER — Publishing status update triggers
-- REAL INTEGRATION: /src/lib/integrations/meta.ts
-- PHASE: 3

-- PLACEHOLDER: CONTENT_RECYCLING_ENGINE — Content recycling link trigger
-- REAL INTEGRATION: /src/lib/db/recycling-queries.ts
-- PHASE: 3
