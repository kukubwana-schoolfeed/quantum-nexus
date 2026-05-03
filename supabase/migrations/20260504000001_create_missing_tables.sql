-- ============================================================================
-- QUANTUM NEXUS — Migration: Missing Tables
-- Purpose: Create all data entity tables found in MOCK_DATA / MODULES.md
--          that do not yet have a corresponding table.
-- Rules:   id UUID PK, tenant_id FK CASCADE, created_at/updated_at,
--          idx_{table}_tenant_id index, no RLS.
-- ============================================================================

-- ─── Platform Core ────────────────────────────────────────────────────────

CREATE TABLE onboarding_steps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  step        TEXT NOT NULL,
  label       TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('complete', 'in_progress', 'pending')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_onboarding_steps_tenant_id ON onboarding_steps(tenant_id);

CREATE TABLE seo_keywords (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  keyword       TEXT NOT NULL,
  volume        INTEGER NOT NULL DEFAULT 0,
  difficulty    INTEGER NOT NULL DEFAULT 0,
  current_rank  INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, keyword)
);
CREATE INDEX idx_seo_keywords_tenant_id ON seo_keywords(tenant_id);

CREATE TABLE connected_platforms (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  platform         TEXT NOT NULL,
  connected        BOOLEAN NOT NULL DEFAULT false,
  username         TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, platform)
);
CREATE INDEX idx_connected_platforms_tenant_id ON connected_platforms(tenant_id);

-- ─── Business Modules ─────────────────────────────────────────────────────

CREATE TABLE call_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  caller_phone     TEXT NOT NULL,
  duration         INTEGER NOT NULL DEFAULT 0,
  classification   TEXT NOT NULL CHECK (classification IN ('resolved', 'complex', 'pricing_query')),
  transcript       TEXT,
  timestamp        TIMESTAMPTZ NOT NULL,
  handoff_initiated BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_call_logs_tenant_id ON call_logs(tenant_id);

CREATE TABLE sales_campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  targets_count   INTEGER NOT NULL DEFAULT 0,
  responses_count INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sales_campaigns_tenant_id ON sales_campaigns(tenant_id);

CREATE TABLE broadcasts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('whatsapp', 'email', 'sms')),
  subject         TEXT,
  body            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'scheduled', 'failed')),
  sent_at         TIMESTAMPTZ,
  scheduled_for   TIMESTAMPTZ,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_broadcasts_tenant_id ON broadcasts(tenant_id);

CREATE TABLE review_campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  sent_count      INTEGER NOT NULL DEFAULT 0,
  response_count  INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_review_campaigns_tenant_id ON review_campaigns(tenant_id);

CREATE TABLE testimonial_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'received', 'expired')),
  sent_at       TIMESTAMPTZ NOT NULL,
  video_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_testimonial_requests_tenant_id ON testimonial_requests(tenant_id);

CREATE TABLE lead_magnets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('pdf', 'checklist', 'template')),
  status     TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  downloads  INTEGER NOT NULL DEFAULT 0,
  url        TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_lead_magnets_tenant_id ON lead_magnets(tenant_id);

CREATE TABLE seasonal_campaigns (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'completed')),
  starts_at  TIMESTAMPTZ NOT NULL,
  ends_at    TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_seasonal_campaigns_tenant_id ON seasonal_campaigns(tenant_id);

CREATE TABLE competitors (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  domain           TEXT NOT NULL,
  domain_authority INTEGER NOT NULL DEFAULT 0,
  indexed_pages    INTEGER NOT NULL DEFAULT 0,
  backlinks        INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, domain)
);
CREATE INDEX idx_competitors_tenant_id ON competitors(tenant_id);

CREATE TABLE approval_queue_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  platform     TEXT,
  status       TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_approval_queue_items_tenant_id ON approval_queue_items(tenant_id);

CREATE TABLE community_posts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  author_id      TEXT NOT NULL,
  content        TEXT NOT NULL,
  likes_count    INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_community_posts_tenant_id ON community_posts(tenant_id);

CREATE TABLE community_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id  TEXT NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_community_comments_tenant_id ON community_comments(tenant_id);

CREATE TABLE crisis_alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  platform     TEXT NOT NULL,
  alert_type   TEXT NOT NULL,
  severity     TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message      TEXT NOT NULL,
  detected_at  TIMESTAMPTZ NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_crisis_alerts_tenant_id ON crisis_alerts(tenant_id);

CREATE TABLE white_label_apps (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  platform   TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'both')),
  status     TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'published', 'rejected')),
  bundle_id  TEXT,
  icon_url   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_white_label_apps_tenant_id ON white_label_apps(tenant_id);

CREATE TABLE content_safety_checks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  result     TEXT NOT NULL CHECK (result IN ('pass', 'fail')),
  flags      TEXT[] NOT NULL DEFAULT '{}',
  score      INTEGER NOT NULL DEFAULT 0,
  checked_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_content_safety_checks_tenant_id ON content_safety_checks(tenant_id);

CREATE TABLE reputation_reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  author     TEXT NOT NULL,
  rating     INTEGER NOT NULL,
  text       TEXT NOT NULL,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reputation_reviews_tenant_id ON reputation_reviews(tenant_id);

CREATE TABLE content_recycling (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  original_post_id UUID NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
  new_post_id      UUID NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
  new_format       TEXT NOT NULL,
  recycled_at      TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_content_recycling_tenant_id ON content_recycling(tenant_id);

-- ─── UGC Modules ──────────────────────────────────────────────────────────

CREATE TABLE ugc_videos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  file_name        TEXT NOT NULL,
  file_size        BIGINT NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  status           TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'uploaded', 'transcribing', 'transcribed', 'analysed')),
  uploaded_at      TIMESTAMPTZ NOT NULL,
  r2_url           TEXT NOT NULL,
  transcript       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ugc_videos_tenant_id ON ugc_videos(tenant_id);

CREATE TABLE ugc_clips (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  video_id   UUID NOT NULL REFERENCES ugc_videos(id) ON DELETE CASCADE,
  start_time DECIMAL(10,2) NOT NULL,
  end_time   DECIMAL(10,2) NOT NULL,
  score      INTEGER NOT NULL DEFAULT 0,
  hook_text  TEXT,
  status     TEXT NOT NULL DEFAULT 'candidate' CHECK (status IN ('candidate', 'approved', 'rejected', 'rendered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ugc_clips_tenant_id ON ugc_clips(tenant_id);

CREATE TABLE render_jobs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  clip_id    UUID NOT NULL REFERENCES ugc_clips(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'complete', 'failed')),
  progress   INTEGER NOT NULL DEFAULT 0,
  output_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_render_jobs_tenant_id ON render_jobs(tenant_id);

CREATE TABLE ugc_calendar_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  clip_id       UUID NOT NULL REFERENCES ugc_clips(id) ON DELETE CASCADE,
  platform      TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status        TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ugc_calendar_entries_tenant_id ON ugc_calendar_entries(tenant_id);

CREATE TABLE ugc_trends (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  trend_type TEXT NOT NULL,
  trend_text TEXT NOT NULL,
  platform   TEXT NOT NULL,
  score      INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ugc_trends_tenant_id ON ugc_trends(tenant_id);

CREATE TABLE monetisation_opportunities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  brand_name    TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  estimated_pay DECIMAL(12,2) NOT NULL DEFAULT 0,
  deadline      TIMESTAMPTZ NOT NULL,
  status        TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'applied', 'accepted', 'rejected')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_monetisation_opportunities_tenant_id ON monetisation_opportunities(tenant_id);

CREATE TABLE podcast_episodes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'published')),
  audio_url        TEXT,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_podcast_episodes_tenant_id ON podcast_episodes(tenant_id);

-- ─── Faceless Channel Modules ─────────────────────────────────────────────

CREATE TABLE faceless_characters (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  personality  TEXT NOT NULL,
  voice_id     TEXT NOT NULL,
  avatar_style TEXT NOT NULL CHECK (avatar_style IN ('illustrated', 'animated', 'ai_generated')),
  backstory    TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_faceless_characters_tenant_id ON faceless_characters(tenant_id);

CREATE TABLE storylines (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  character_id  UUID NOT NULL REFERENCES faceless_characters(id) ON DELETE CASCADE,
  episode_count INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'paused')),
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_storylines_tenant_id ON storylines(tenant_id);

CREATE TABLE series_bibles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  storyline_id     UUID NOT NULL REFERENCES storylines(id) ON DELETE CASCADE,
  world_rules      TEXT NOT NULL DEFAULT '',
  recurring_themes TEXT[] NOT NULL DEFAULT '{}',
  tone_notes       TEXT NOT NULL DEFAULT '',
  character_arcs   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_series_bibles_tenant_id ON series_bibles(tenant_id);

CREATE TABLE episode_outlines (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  storyline_id   UUID NOT NULL REFERENCES storylines(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title          TEXT NOT NULL,
  synopsis       TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'in_production', 'published')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_episode_outlines_tenant_id ON episode_outlines(tenant_id);

CREATE TABLE scenes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  outline_id      UUID NOT NULL REFERENCES episode_outlines(id) ON DELETE CASCADE,
  scene_number    INTEGER NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  visual_style    TEXT NOT NULL DEFAULT 'illustrated',
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  script_text     TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_scenes_tenant_id ON scenes(tenant_id);

CREATE TABLE runway_jobs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  scene_id     UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'complete', 'failed')),
  progress     INTEGER NOT NULL DEFAULT 0,
  output_url   TEXT,
  submitted_at TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_runway_jobs_tenant_id ON runway_jobs(tenant_id);

CREATE TABLE voice_jobs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES faceless_characters(id) ON DELETE CASCADE,
  provider    TEXT NOT NULL,
  voice_id    TEXT NOT NULL,
  sample_url  TEXT,
  status      TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'complete')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_voice_jobs_tenant_id ON voice_jobs(tenant_id);

CREATE TABLE assembly_jobs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  episode_id  UUID NOT NULL REFERENCES episode_outlines(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'complete', 'failed')),
  progress    INTEGER NOT NULL DEFAULT 0,
  preview_url TEXT,
  output_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_assembly_jobs_tenant_id ON assembly_jobs(tenant_id);

CREATE TABLE thumbnails (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  episode_id  UUID NOT NULL REFERENCES episode_outlines(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  style       TEXT NOT NULL DEFAULT 'illustrated',
  is_selected BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_thumbnails_tenant_id ON thumbnails(tenant_id);

CREATE TABLE episode_trackers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  storyline_id   UUID NOT NULL REFERENCES storylines(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title          TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'failed')),
  published_at   TIMESTAMPTZ,
  views          INTEGER NOT NULL DEFAULT 0,
  engagement     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_episode_trackers_tenant_id ON episode_trackers(tenant_id);

-- ─── Shared Modules ───────────────────────────────────────────────────────

CREATE TABLE bubble_conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bubble_conversations_tenant_id ON bubble_conversations(tenant_id);

CREATE TABLE bubble_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES bubble_conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bubble_messages_tenant_id ON bubble_messages(tenant_id);

CREATE TABLE inspiration_uploads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  file_id         TEXT NOT NULL,
  analysis_status TEXT NOT NULL DEFAULT 'processing' CHECK (analysis_status IN ('processing', 'complete', 'failed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_inspiration_uploads_tenant_id ON inspiration_uploads(tenant_id);

CREATE TABLE transcriptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'complete', 'failed')),
  text       TEXT,
  language   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_transcriptions_tenant_id ON transcriptions(tenant_id);

-- ─── App Developer Modules ────────────────────────────────────────────────

CREATE TABLE apps (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  platform   TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'both')),
  category   TEXT NOT NULL DEFAULT 'general',
  status     TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'suspended')),
  downloads  INTEGER NOT NULL DEFAULT 0,
  icon_url   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_apps_tenant_id ON apps(tenant_id);

CREATE TABLE app_reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  app_id     UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  author     TEXT NOT NULL,
  rating     INTEGER NOT NULL,
  text       TEXT NOT NULL,
  replied_at TIMESTAMPTZ,
  reply_text TEXT,
  platform   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_app_reviews_tenant_id ON app_reviews(tenant_id);

CREATE TABLE support_tickets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  app_id     UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  subject    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_support_tickets_tenant_id ON support_tickets(tenant_id);

CREATE TABLE app_submissions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  app_id         UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  app_name       TEXT NOT NULL,
  submitted_at   TIMESTAMPTZ NOT NULL,
  status         TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected')),
  reviewer_notes TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_app_submissions_tenant_id ON app_submissions(tenant_id);
