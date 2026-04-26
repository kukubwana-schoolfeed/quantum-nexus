# QUANTUM NEXUS — DATA_MODELS.md
# Version: 2.0.0 | Status: LOCKED
# Read CLAUDE.md, ARCHITECTURE.md, MODULES.md, and INTEGRATIONS.md before this file.
# Every Supabase table is defined here.
# Do not create tables not listed here without explicit human approval.
# Version 2.0 adds tables for 8 new domination modules. All existing tables unchanged.

---

## MULTI-TENANCY RULES

1. Every table that stores business or user data MUST have a tenant_id column
2. tenant_id is always UUID type, NOT NULL, with a foreign key to the tenants table
3. RLS policies are defined for every table — SELECT, INSERT, UPDATE, DELETE
4. Application layer also filters by tenant_id on every query
5. Indexes on tenant_id are required on every table for query performance
6. Super admin bypass: only via service role key, never via regular auth

---

## RLS POLICY TEMPLATE

Applied to every tenant-scoped table:

```sql
-- Enable RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY "[table_name]_select" ON [table_name]
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- INSERT policy
CREATE POLICY "[table_name]_insert" ON [table_name]
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- UPDATE policy
CREATE POLICY "[table_name]_update" ON [table_name]
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- DELETE policy
CREATE POLICY "[table_name]_delete" ON [table_name]
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

---

## PLATFORM TABLES (no tenant_id — platform-level data)

---

### TABLE: tenants
PURPOSE: Master record for every business/creator account on the platform.
```sql
CREATE TABLE tenants (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Identity
  business_name         TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  user_type             TEXT NOT NULL CHECK (user_type IN ('business', 'ugc_creator', 'faceless_creator', 'app_developer')),

  -- Billing and Tier
  tier                  TEXT NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'growth', 'pro', 'enterprise', 'internal')),
  billing_type          TEXT NOT NULL DEFAULT 'paid' CHECK (billing_type IN ('paid', 'internal', 'credits')),
  monthly_credit_allowance INTEGER DEFAULT 0,
  credits_used_this_month  INTEGER DEFAULT 0,
  credit_granted_by     UUID REFERENCES tenants(id),

  -- Status
  status                TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'active', 'grace_period', 'suspended', 'archived', 'rejected')),
  activated_at          TIMESTAMPTZ,
  suspended_at          TIMESTAMPTZ,
  archived_at           TIMESTAMPTZ,
  rejection_reason      TEXT,

  -- Sprint Mode
  sprint_mode_active    BOOLEAN NOT NULL DEFAULT true,
  sprint_mode_ends_at   TIMESTAMPTZ,

  -- Reseller
  reseller_id           UUID REFERENCES resellers(id),

  -- Completeness
  completeness_score    INTEGER NOT NULL DEFAULT 0 CHECK (completeness_score BETWEEN 0 AND 100),
  content_generation_unlocked   BOOLEAN NOT NULL DEFAULT false,
  publishing_unlocked           BOOLEAN NOT NULL DEFAULT false,
  analytics_unlocked            BOOLEAN NOT NULL DEFAULT false,

  -- Audit
  initial_audit_complete        BOOLEAN NOT NULL DEFAULT false,

  -- Admin
  admin_approved_by     UUID,
  admin_approved_at     TIMESTAMPTZ,
  admin_notes           TEXT
);

CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_tier ON tenants(tier);
CREATE INDEX idx_tenants_reseller ON tenants(reseller_id);
CREATE INDEX idx_tenants_slug ON tenants(slug);
```

---

### TABLE: resellers
PURPOSE: Agency/reseller accounts that manage multiple client businesses.
```sql
CREATE TABLE resellers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  brand_name            TEXT NOT NULL,
  brand_logo_url        TEXT,
  brand_primary_color   TEXT,
  brand_secondary_color TEXT,
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  admin_user_id         UUID NOT NULL
);
```

---

### TABLE: platform_users
PURPOSE: User accounts with roles and tenant associations.
```sql
CREATE TABLE platform_users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id          UUID NOT NULL UNIQUE,
  tenant_id             UUID REFERENCES tenants(id),
  reseller_id           UUID REFERENCES resellers(id),
  role                  TEXT NOT NULL CHECK (role IN ('business_owner', 'ugc_creator', 'faceless_creator', 'app_developer', 'agency_admin', 'sub_admin', 'super_admin')),
  permissions           JSONB DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at          TIMESTAMPTZ
);

CREATE INDEX idx_platform_users_tenant ON platform_users(tenant_id);
CREATE INDEX idx_platform_users_role ON platform_users(role);
```

---

### TABLE: niche_profiles
PURPOSE: Niche library and auto-researched niche profiles. Shared across all tenants in the same niche.
```sql
CREATE TABLE niche_profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  niche_name            TEXT NOT NULL UNIQUE,
  status                TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'active', 'deprecated')),
  approved_by           UUID,
  approved_at           TIMESTAMPTZ,

  -- Content Strategy
  primary_keywords      TEXT[] NOT NULL DEFAULT '{}',
  content_formats       TEXT[] NOT NULL DEFAULT '{}',
  tone                  TEXT NOT NULL,
  platforms             TEXT[] NOT NULL DEFAULT '{}',
  target_audience       TEXT NOT NULL,
  posting_frequency     JSONB NOT NULL DEFAULT '{}',

  -- Regulatory
  regulatory_flags      TEXT[] DEFAULT '{}',
  content_restrictions  TEXT[] DEFAULT '{}',

  -- SEO
  seo_keyword_clusters  JSONB DEFAULT '[]',
  competitor_domains    TEXT[] DEFAULT '{}'
);
```

---

### TABLE: encrypted_keys
PURPOSE: AES-256-GCM encrypted storage for all business API keys and OAuth tokens.
```sql
CREATE TABLE encrypted_keys (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key_name              TEXT NOT NULL,
  encrypted_value       TEXT NOT NULL,
  iv                    TEXT NOT NULL,
  auth_tag              TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at            TIMESTAMPTZ,

  UNIQUE(tenant_id, key_name)
);

CREATE INDEX idx_encrypted_keys_tenant ON encrypted_keys(tenant_id);
ALTER TABLE encrypted_keys ENABLE ROW LEVEL SECURITY;
-- RLS: only service role can access this table. Never via regular auth.
```

---

## BUSINESS PROFILE TABLES

---

### TABLE: business_profiles
PURPOSE: Extended business information beyond the tenant record. Niche-specific data, brand voice, content preferences.
```sql
CREATE TABLE business_profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Business Details
  niche                 TEXT NOT NULL,
  niche_profile_id      UUID REFERENCES niche_profiles(id),
  location              TEXT NOT NULL,
  website_url           TEXT,
  phone_number          TEXT,

  -- Brand
  logo_url              TEXT,
  brand_primary_color   TEXT,
  brand_secondary_color TEXT,
  brand_voice_tone      TEXT NOT NULL DEFAULT 'professional',
  content_language      TEXT NOT NULL DEFAULT 'english',
  fallback_message      TEXT NOT NULL DEFAULT 'Let me get back to you on that.',

  -- Content Preferences
  keyword_blocklist     TEXT[] DEFAULT '{}',
  preferred_formats     TEXT[] DEFAULT '{}',
  posting_schedule      JSONB DEFAULT '{}',

  -- Twilio
  twilio_phone_number   TEXT UNIQUE,

  UNIQUE(tenant_id)
);

CREATE INDEX idx_business_profiles_tenant ON business_profiles(tenant_id);
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
-- Standard RLS policies apply
```

---

## CONTENT TABLES

---

### TABLE: content_posts
PURPOSE: All content created by the platform for scheduling and publishing.
```sql
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
-- Standard RLS policies apply
```

---

## CUSTOMER TABLES

---

### TABLE: customers
PURPOSE: Customer CRM. All customer data per business.
```sql
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
-- Standard RLS policies apply
```

---

## SEO AND DOMINATION TABLES

---

### TABLE: seo_tasks
PURPOSE: Daily SEO tasks generated by seo-domination-engine. Business owner confirms completion of manual tasks.
```sql
CREATE TABLE seo_tasks (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  task_date             DATE NOT NULL,
  task_type             TEXT NOT NULL CHECK (task_type IN ('blog_post', 'qa_seed', 'directory_submission', 'content_refresh', 'indexing_request', 'backlink_outreach')),
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'awaiting_confirmation', 'complete', 'skipped')),

  -- For Q&A tasks
  question_text         TEXT,
  answer_text           TEXT,
  platform              TEXT,
  question_posted_at    TIMESTAMPTZ,
  answer_posted_at      TIMESTAMPTZ,

  -- For blog posts
  content_post_id       UUID REFERENCES content_posts(id),
  target_keyword        TEXT,

  completed_at          TIMESTAMPTZ
);

CREATE INDEX idx_seo_tasks_tenant ON seo_tasks(tenant_id);
CREATE INDEX idx_seo_tasks_date ON seo_tasks(task_date);
CREATE INDEX idx_seo_tasks_status ON seo_tasks(status);
ALTER TABLE seo_tasks ENABLE ROW LEVEL SECURITY;
-- Standard RLS policies apply
```

---

### TABLE: indexed_pages
PURPOSE: Tracks all pages confirmed indexed by Google. Powers Mission Control live indexing feed and reputation velocity score.
```sql
CREATE TABLE indexed_pages (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  indexed_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  page_url              TEXT NOT NULL,
  page_type             TEXT CHECK (page_type IN ('blog_post', 'landing_page', 'product_page', 'qa_answer', 'other')),
  target_keyword        TEXT,
  gsc_confirmed         BOOLEAN DEFAULT false,

  UNIQUE(tenant_id, page_url)
);

CREATE INDEX idx_indexed_pages_tenant ON indexed_pages(tenant_id);
CREATE INDEX idx_indexed_pages_date ON indexed_pages(indexed_at);
ALTER TABLE indexed_pages ENABLE ROW LEVEL SECURITY;
-- Standard RLS policies apply
```

---

### TABLE: trends
PURPOSE: Active and historical trend data from trend-intelligence-engine.
```sql
CREATE TABLE trends (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  trend_type            TEXT NOT NULL CHECK (trend_type IN ('keyword', 'phrase', 'hashtag', 'sound', 'format', 'topic')),
  trend_text            TEXT NOT NULL,
  platform              TEXT,
  score                 INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  status                TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'ACTIVE', 'AGING', 'EXPIRED')),

  detected_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  expired_at            TIMESTAMPTZ,
  expiry_reason         TEXT,

  -- Usage tracking
  times_used_in_content INTEGER DEFAULT 0,
  last_used_at          TIMESTAMPTZ
);

CREATE INDEX idx_trends_tenant ON trends(tenant_id);
CREATE INDEX idx_trends_status ON trends(status);
CREATE INDEX idx_trends_score ON trends(score DESC);
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
-- Standard RLS policies apply
```

---

### TABLE: business_audits
PURPOSE: Business audit snapshots from business-audit-engine. Baseline and monthly refreshes.
```sql
CREATE TABLE business_audits (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  audit_type            TEXT NOT NULL CHECK (audit_type IN ('initial', 'monthly_refresh', 'on_demand')),

  -- SEO Baseline
  domain_authority      INTEGER,
  total_indexed_pages   INTEGER,
  backlink_count        INTEGER,
  gsc_impressions_90d   INTEGER,
  gsc_clicks_90d        INTEGER,

  -- GBP Baseline
  gbp_completeness      INTEGER,
  review_count          INTEGER,
  average_rating        DECIMAL(3,2),

  -- Social Baseline
  social_presence       JSONB DEFAULT '{}',

  -- Competitor Gaps
  competitor_data       JSONB DEFAULT '[]',

  -- Recommended Starting Point
  recommended_priority  TEXT[],
  summary               TEXT
);

CREATE INDEX idx_business_audits_tenant ON business_audits(tenant_id);
CREATE INDEX idx_business_audits_type ON business_audits(audit_type);
ALTER TABLE business_audits ENABLE ROW LEVEL SECURITY;
-- Standard RLS policies apply
```

---

### TABLE: reputation_velocity
PURPOSE: Weekly reputation velocity scores for each tenant. Powers Mission Control panel and client-health-score.
```sql
CREATE TABLE reputation_velocity (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  week_start            DATE NOT NULL,

  -- Components
  new_backlinks         INTEGER DEFAULT 0,
  new_indexed_pages     INTEGER DEFAULT 0,
  new_reviews           INTEGER DEFAULT 0,
  net_new_followers     INTEGER DEFAULT 0,
  gsc_impressions_growth DECIMAL(6,2) DEFAULT 0,

  -- Composite
  velocity_score        INTEGER NOT NULL DEFAULT 0,
  velocity_trend        TEXT CHECK (velocity_trend IN ('improving', 'stable', 'declining')),

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(tenant_id, week_start)
);

CREATE INDEX idx_reputation_velocity_tenant ON reputation_velocity(tenant_id);
CREATE INDEX idx_reputation_velocity_week ON reputation_velocity(week_start DESC);
ALTER TABLE reputation_velocity ENABLE ROW LEVEL SECURITY;
-- Standard RLS policies apply
```

---

### TABLE: client_health_scores
PURPOSE: Daily composite health scores per tenant. Visible on Mission Control and super admin dashboard.
```sql
CREATE TABLE client_health_scores (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  score_date            DATE NOT NULL,

  -- Component Scores
  seo_score             INTEGER DEFAULT 0,
  content_score         INTEGER DEFAULT 0,
  review_score          INTEGER DEFAULT 0,
  social_score          INTEGER DEFAULT 0,
  entity_score          INTEGER DEFAULT 0,

  -- Composite
  total_score           INTEGER NOT NULL DEFAULT 0 CHECK (total_score BETWEEN 0 AND 100),
  trend                 TEXT CHECK (trend IN ('improving', 'stable', 'declining')),

  -- Recommendations
  top_recommendations   TEXT[] DEFAULT '{}',

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(tenant_id, score_date)
);

CREATE INDEX idx_client_health_tenant ON client_health_scores(tenant_id);
CREATE INDEX idx_client_health_date ON client_health_scores(score_date DESC);
ALTER TABLE client_health_scores ENABLE ROW LEVEL SECURITY;
-- Standard RLS policies apply
```

---

### TABLE: entity_listings
PURPOSE: Tracks all directory listings submitted by entity-builder and their consistency status.
```sql
CREATE TABLE entity_listings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  directory_name        TEXT NOT NULL,
  directory_url         TEXT,
  listing_url           TEXT,
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'live', 'inconsistent', 'rejected')),

  -- NAP at time of submission
  submitted_name        TEXT NOT NULL,
  submitted_address     TEXT,
  submitted_phone       TEXT,
  submitted_website     TEXT,

  -- Consistency check
  last_checked_at       TIMESTAMPTZ,
  is_consistent         BOOLEAN,
  inconsistency_notes   TEXT,

  UNIQUE(tenant_id, directory_name)
);

CREATE INDEX idx_entity_listings_tenant ON entity_listings(tenant_id);
CREATE INDEX idx_entity_listings_status ON entity_listings(status);
ALTER TABLE entity_listings ENABLE ROW LEVEL SECURITY;
-- Standard RLS policies apply
```

---

### TABLE: cannibalisation_reports
PURPOSE: Keyword cannibalisation detection results from keyword-cannibalisation-detector.
```sql
CREATE TABLE cannibalisation_reports (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  detected_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  conflicting_keyword   TEXT NOT NULL,
  strong_post_id        UUID REFERENCES content_posts(id),
  weak_post_id          UUID REFERENCES content_posts(id),
  strong_post_url       TEXT,
  weak_post_url         TEXT,
  recommended_action    TEXT NOT NULL CHECK (recommended_action IN ('consolidate', 'redirect')),

  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'dismissed')),
  resolved_at           TIMESTAMPTZ,
  resolved_by           UUID
);

CREATE INDEX idx_cannibalisation_tenant ON cannibalisation_reports(tenant_id);
CREATE INDEX idx_cannibalisation_status ON cannibalisation_reports(status);
ALTER TABLE cannibalisation_reports ENABLE ROW LEVEL SECURITY;
-- Standard RLS policies apply
```

---

### TABLE: analytics_snapshots
PURPOSE: Pre-aggregated analytics data for Mission Control. Updated by Worker 4 every 15 minutes. Read-only for Mission Control — never written to by frontend.
```sql
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
-- Standard RLS policies apply
```

---

## BILLING TABLES

---

### TABLE: invoices
PURPOSE: Monthly invoices generated by billing-engine.
```sql
CREATE TABLE invoices (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  invoice_date          DATE NOT NULL,
  due_date              DATE NOT NULL,
  amount_zmw            DECIMAL(12,2) NOT NULL,
  status                TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'grace_period', 'overdue', 'written_off')),
  paid_at               TIMESTAMPTZ,
  lenco_transaction_id  TEXT,

  grace_period_started_at  TIMESTAMPTZ,
  suspension_triggered_at  TIMESTAMPTZ
);

CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_status ON invoices(status);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
-- Standard RLS policies apply
```

---

## NOTIFICATION TABLES

---

### TABLE: notifications
PURPOSE: All in-app notifications per tenant.
```sql
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
-- Standard RLS policies apply
```

---

## LOYALTY AND BIRTHDAY TABLES

---

### TABLE: loyalty_transactions
PURPOSE: All loyalty point earning and redemption events.
```sql
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
-- Standard RLS policies apply
```

---

### TABLE: birthday_tokens
PURPOSE: Single-use QR tokens for birthday redemptions.
```sql
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
-- Standard RLS policies apply
```

---

## KNOWLEDGE BASE TABLES

---

### TABLE: knowledge_base
PURPOSE: Single source of truth for all business information used in AI responses.
```sql
CREATE TABLE knowledge_base (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  category              TEXT NOT NULL CHECK (category IN ('faq', 'price_list', 'service_description', 'product', 'policy', 'custom')),
  title                 TEXT NOT NULL,
  content               TEXT NOT NULL,
  is_active             BOOLEAN NOT NULL DEFAULT true,
  source                TEXT CHECK (source IN ('manual', 'document_upload', 'ai_extracted'))
);

CREATE INDEX idx_knowledge_base_tenant ON knowledge_base(tenant_id);
CREATE INDEX idx_knowledge_base_category ON knowledge_base(category);
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
-- Standard RLS policies apply
```

---

## JOB TRACKING TABLES

---

### TABLE: dead_jobs
PURPOSE: Permanently failed BullMQ jobs for super admin review.
```sql
CREATE TABLE dead_jobs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID REFERENCES tenants(id),
  failed_at             TIMESTAMPTZ NOT NULL DEFAULT now(),

  queue_name            TEXT NOT NULL,
  job_type              TEXT NOT NULL,
  job_data              JSONB,
  error_message         TEXT NOT NULL,
  attempts              INTEGER NOT NULL,
  bullmq_job_id         TEXT NOT NULL,

  reviewed              BOOLEAN DEFAULT false,
  reviewed_by           UUID,
  reviewed_at           TIMESTAMPTZ,
  resolution_notes      TEXT
);

CREATE INDEX idx_dead_jobs_tenant ON dead_jobs(tenant_id);
CREATE INDEX idx_dead_jobs_reviewed ON dead_jobs(reviewed);
CREATE INDEX idx_dead_jobs_failed ON dead_jobs(failed_at DESC);
-- No RLS — super admin only, accessed via service role key
```
