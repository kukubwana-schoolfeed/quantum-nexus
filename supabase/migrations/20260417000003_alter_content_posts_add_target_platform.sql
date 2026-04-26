-- ============================================================================
-- QUANTUM NEXUS — Migration: Alter content_posts — add target_platform column
--          and expand status CHECK with 'repurposed'
-- Table: content_posts
-- Purpose: target_platform stores the intended publishing destination at
--          creation time (set by content-machine). The existing 'platform'
--          column stores where the post was actually published (set after
--          successful publish). These differ when cross-posting: one post
--          can target Instagram but be republished on Facebook later.
--          'repurposed' status tracks posts recycled by content-recycling-engine.
-- Phase: 3 (Real Integrations)
-- Terminal: 4 (Database)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Add target_platform column
-- ---------------------------------------------------------------------------

ALTER TABLE content_posts
  ADD COLUMN IF NOT EXISTS target_platform TEXT
  CHECK (target_platform IN (
    'facebook', 'instagram', 'tiktok', 'youtube', 'twitter',
    'linkedin', 'pinterest', 'reddit', 'whatsapp', 'google_business',
    'blog', 'email', 'sms'
  ));

-- Index for filtering content by target platform (used by content-machine
-- when building platform-specific queues)
CREATE INDEX IF NOT EXISTS idx_content_posts_target_platform
  ON content_posts(target_platform)
  WHERE target_platform IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. Expand status CHECK to include 'repurposed'
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  _constraint_name TEXT;
BEGIN
  -- Find the CHECK constraint on content_posts.status
  SELECT con.conname INTO _constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
  WHERE rel.relname = 'content_posts'
    AND att.attname = 'status'
    AND con.contype = 'c'
    AND nsp.nspname = 'public'
  LIMIT 1;

  IF _constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE content_posts DROP CONSTRAINT %I', _constraint_name);
  END IF;
END $$;

ALTER TABLE content_posts
  ADD CONSTRAINT content_posts_status_check
  CHECK (status IN (
    'draft',
    'pending_safety',
    'pending_approval',
    'approved',
    'scheduled',
    'publishing',
    'published',
    'failed',
    'held',
    'cancelled',
    'repurposed'
  ));

-- ---------------------------------------------------------------------------
-- 3. Add repurposed_from_id column for tracing repurpose lineage
-- ---------------------------------------------------------------------------

ALTER TABLE content_posts
  ADD COLUMN IF NOT EXISTS repurposed_from_id UUID REFERENCES content_posts(id);

-- PLACEHOLDER: CONTENT_RECYCLING_ENGINE — Set status='repurposed' and
--   repurposed_from_id when recycling a published post for a new platform
-- REAL INTEGRATION: /src/lib/db/recycling-queries.ts
-- PHASE: 3

-- PLACEHOLDER: CONTENT_MACHINE — Set target_platform at creation time
--   based on the content calendar and niche profile posting_schedule
-- REAL INTEGRATION: /src/lib/db/content-queries.ts
-- PHASE: 3

-- PLACEHOLDER: SOCIAL_MEDIA_LAYER — Compare target_platform vs platform
--   to detect cross-posting and track multi-platform publishing
-- REAL INTEGRATION: /src/lib/integrations/meta.ts
-- PHASE: 3
