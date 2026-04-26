-- ============================================================================
-- QUANTUM NEXUS — Seed: SEO, Domination, Analytics, and Operational Tables
-- Phase: 2 (Mock Data Layer)
-- Terminal: 4 (Database)
--
-- Covers: seo_tasks, indexed_pages, trends, business_audits,
--          reputation_velocity, client_health_scores, entity_listings,
--          cannibalisation_reports, analytics_snapshots,
--          loyalty_transactions, birthday_tokens, dead_jobs
-- Depends on: 01_platform_seed.sql, 02_business_data_seed.sql
-- ============================================================================

-- ============================================================================
-- SEO TASKS
-- ============================================================================

-- Tenant 1 (Lusaka Smile Dental) — active tasks
INSERT INTO seo_tasks (id, tenant_id, created_at, task_date, task_type, status, question_text, answer_text, platform, question_posted_at, answer_posted_at, content_post_id, target_keyword, completed_at) VALUES
  ('l0000001-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', '2026-04-12T06:00:00Z', '2026-04-12', 'blog_post', 'in_progress', NULL, NULL, NULL, NULL, NULL, 'g0000001-0000-4000-8000-000000000004', 'dental checkup lusaka', NULL),
  ('l0000001-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', '2026-04-12T06:01:00Z', '2026-04-12', 'qa_seed', 'pending', 'How much does a dental checkup cost in Lusaka?', NULL, 'quora', NULL, NULL, NULL, 'dental checkup cost lusaka', NULL),
  ('l0000001-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', '2026-04-12T06:02:00Z', '2026-04-12', 'directory_submission', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('l0000001-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', '2026-04-12T06:03:00Z', '2026-04-12', 'indexing_request', 'complete', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-12T09:30:00Z'),
  ('l0000001-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', '2026-04-11T06:00:00Z', '2026-04-11', 'blog_post', 'complete', NULL, NULL, NULL, NULL, NULL, 'g0000001-0000-4000-8000-000000000008', 'dental implants zambia', '2026-04-11T16:00:00Z'),
  ('l0000001-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', '2026-04-11T06:01:00Z', '2026-04-11', 'qa_seed', 'complete', 'Is teeth whitening safe?', 'Yes, professional teeth whitening at Lusaka Smile Dental is safe. We use LED-accelerated gel with proven safety records. Minor sensitivity may occur but resolves within 24-48 hours.', 'quora', '2026-04-11T08:00:00Z', '2026-04-11T10:00:00Z', NULL, 'teeth whitening safety zambia', '2026-04-11T14:00:00Z'),
  ('l0000001-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000001', '2026-04-10T06:00:00Z', '2026-04-10', 'backlink_outreach', 'skipped', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('l0000001-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000001', '2026-04-10T06:01:00Z', '2026-04-10', 'content_refresh', 'awaiting_confirmation', NULL, NULL, NULL, NULL, NULL, 'g0000001-0000-4000-8000-000000000001', 'root canal lusaka', NULL);

-- Tenant 2 (Chewe Eats) — fewer SEO tasks
INSERT INTO seo_tasks (id, tenant_id, created_at, task_date, task_type, status, content_post_id, target_keyword, completed_at) VALUES
  ('l0000002-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', '2026-04-12T06:00:00Z', '2026-04-12', 'blog_post', 'in_progress', NULL, 'zambian street food', NULL),
  ('l0000002-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', '2026-04-12T06:01:00Z', '2026-04-12', 'qa_seed', 'pending', NULL, 'best restaurants lusaka', NULL),
  ('l0000002-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', '2026-04-11T06:00:00Z', '2026-04-11', 'blog_post', 'complete', 'g0000002-0000-4000-8000-000000000003', 'lusaka restaurants', '2026-04-11T15:00:00Z');

-- ============================================================================
-- INDEXED PAGES
-- ============================================================================

INSERT INTO indexed_pages (id, tenant_id, indexed_at, page_url, page_type, target_keyword, gsc_confirmed) VALUES
  -- Tenant 1
  ('m0000001-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', '2026-01-20T00:00:00Z', 'https://lusakasmile.co.zm', 'landing_page', 'dentist lusaka', true),
  ('m0000001-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', '2026-02-15T00:00:00Z', 'https://lusakasmile.co.zm/blog/dental-checkup-guide', 'blog_post', 'dental checkup lusaka', true),
  ('m0000001-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', '2026-03-20T00:00:00Z', 'https://lusakasmile.co.zm/blog/root-canal-guide', 'blog_post', 'root canal lusaka', true),
  ('m0000001-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', '2026-03-25T00:00:00Z', 'https://lusakasmile.co.zm/services', 'landing_page', 'dental services lusaka', true),
  ('m0000001-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', '2026-04-08T00:00:00Z', 'https://lusakasmile.co.zm/blog/dental-implants-guide', 'blog_post', 'dental implants zambia', true),
  ('m0000001-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', '2026-04-10T00:00:00Z', 'https://lusakasmile.co.zm/services/whitening', 'product_page', 'teeth whitening lusaka', false),
  ('m0000001-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000001', '2026-04-12T00:00:00Z', 'https://lusakasmile.co.zm/blog/5-signs-root-canal', 'blog_post', 'root canal signs', true),

  -- Tenant 2
  ('m0000002-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', '2026-02-01T00:00:00Z', 'https://cheweeats.co.zm', 'landing_page', 'zambian food blog', true),
  ('m0000002-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', '2026-03-01T00:00:00Z', 'https://cheweeats.co.zm/blog/hidden-gem-restaurants', 'blog_post', 'lusaka restaurants', true),
  ('m0000002-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', '2026-04-03T00:00:00Z', 'https://cheweeats.co.zm/blog/nshima-guide', 'blog_post', 'nshima recipe', true);

-- ============================================================================
-- TRENDS
-- ============================================================================

INSERT INTO trends (id, tenant_id, created_at, updated_at, trend_type, trend_text, platform, score, status, detected_at, expired_at, expiry_reason, times_used_in_content, last_used_at) VALUES
  -- Tenant 1 — dental niche trends
  ('n0000001-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', '2026-04-01T06:00:00Z', '2026-04-12T06:00:00Z', 'topic', 'Oral Health Month April', 'facebook', 78, 'ACTIVE', '2026-04-01T06:00:00Z', NULL, NULL, 2, '2026-04-10T10:00:00Z'),
  ('n0000001-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', '2026-04-05T08:00:00Z', '2026-04-12T08:00:00Z', 'hashtag', '#SmileMakeover', 'instagram', 62, 'ACTIVE', '2026-04-05T08:00:00Z', NULL, NULL, 1, '2026-04-08T09:00:00Z'),
  ('n0000001-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', '2026-03-15T10:00:00Z', '2026-03-28T10:00:00Z', 'keyword', 'dental implants zambia', 'google', 85, 'ACTIVE', '2026-03-15T10:00:00Z', NULL, NULL, 1, '2026-04-08T09:00:00Z'),
  ('n0000001-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', '2026-03-01T12:00:00Z', '2026-03-20T12:00:00Z', 'format', 'Before & After Carousel', 'instagram', 45, 'AGING', '2026-03-01T12:00:00Z', NULL, NULL, 0, NULL),
  ('n0000001-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', '2026-02-01T08:00:00Z', '2026-02-01T08:00:00Z', 'sound', 'Calm Dental Music Trend', 'tiktok', 20, 'EXPIRED', '2026-02-01T08:00:00Z', '2026-03-01T08:00:00Z', 'Trend cycle ended naturally', 0, NULL),

  -- Tenant 2 — food niche trends
  ('n0000002-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', '2026-04-10T08:00:00Z', '2026-04-12T08:00:00Z', 'hashtag', '#ZambianFood', 'tiktok', 85, 'NEW', '2026-04-10T08:00:00Z', NULL, NULL, 0, NULL),
  ('n0000002-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', '2026-04-05T10:00:00Z', '2026-04-11T10:00:00Z', 'keyword', 'nshima lusaka', 'google', 72, 'ACTIVE', '2026-04-05T10:00:00Z', NULL, NULL, 1, '2026-04-10T12:00:00Z'),
  ('n0000002-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', '2026-04-08T12:00:00Z', '2026-04-12T12:00:00Z', 'sound', 'Zambian Kitchen ASMR', 'tiktok', 68, 'ACTIVE', '2026-04-08T12:00:00Z', NULL, NULL, 0, NULL),
  ('n0000002-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000002', '2026-03-20T09:00:00Z', '2026-04-01T09:00:00Z', 'format', 'Food POV Reel', 'instagram', 55, 'AGING', '2026-03-20T09:00:00Z', NULL, NULL, 2, '2026-04-10T12:00:00Z'),

  -- Tenant 3 — finance niche trends
  ('n0000003-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', '2026-04-01T07:00:00Z', '2026-04-12T07:00:00Z', 'topic', 'Zambian Kwacha Stability', 'google', 70, 'ACTIVE', '2026-04-01T07:00:00Z', NULL, NULL, 1, '2026-04-05T07:00:00Z'),
  ('n0000003-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', '2026-04-10T06:00:00Z', '2026-04-12T06:00:00Z', 'hashtag', '#FinancialLiteracyMonth', 'tiktok', 60, 'NEW', '2026-04-10T06:00:00Z', NULL, NULL, 0, NULL);

-- ============================================================================
-- BUSINESS AUDITS
-- ============================================================================

INSERT INTO business_audits (id, tenant_id, created_at, audit_type, domain_authority, total_indexed_pages, backlink_count, gsc_impressions_90d, gsc_clicks_90d, gbp_completeness, review_count, average_rating, social_presence, competitor_data, recommended_priority, summary) VALUES
  -- Tenant 1 — initial audit
  ('o0000001-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', '2025-12-05T10:00:00Z', 'initial',
   22, 3, 8, 1200, 89,
   65, 12, 4.20,
   '{"facebook": {"followers": 245, "posts_per_week": 1}, "instagram": {"followers": 180, "posts_per_week": 0}, "google_business": {"reviews": 12, "rating": 4.2}}',
   '[{"domain": "lusakadental.com", "domain_authority": 35, "indexed_pages": 28, "review_count": 45}, {"domain": "zambiasmile.co.zm", "domain_authority": 18, "indexed_pages": 5, "review_count": 8}]',
   '{"1": "Complete GBP profile to 100%", "2": "Start weekly blog posting", "3": "Set up Facebook posting schedule", "4": "Get 20 more Google reviews"}',
   'Strong foundation with room for rapid growth. GBP is the lowest-hanging fruit. Blog content will drive organic traffic quickly in this low-competition niche.'),

  -- Tenant 1 — monthly refresh
  ('o0000001-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', '2026-04-01T08:00:00Z', 'monthly_refresh',
   28, 7, 15, 3400, 245,
   88, 18, 4.35,
   '{"facebook": {"followers": 890, "posts_per_week": 4}, "instagram": {"followers": 520, "posts_per_week": 2}, "google_business": {"reviews": 18, "rating": 4.35}}',
   '[{"domain": "lusakadental.com", "domain_authority": 36, "indexed_pages": 30, "review_count": 47}, {"domain": "zambiasmile.co.zm", "domain_authority": 19, "indexed_pages": 6, "review_count": 9}]',
   '{"1": "Increase blog frequency to 3/week", "2": "Start Instagram content calendar", "3": "Target 30 total Google reviews", "4": "Begin backlink outreach to health directories"}',
   'Excellent 4-month progress. Domain authority up 6 points, indexed pages more than doubled. Continue current trajectory and increase content velocity.'),

  -- Tenant 2 — initial audit
  ('o0000002-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', '2026-01-18T12:00:00Z', 'initial',
   15, 2, 3, 890, 45,
   NULL, NULL, NULL,
   '{"instagram": {"followers": 3200, "posts_per_week": 3}, "tiktok": {"followers": 1800, "posts_per_week": 2}, "youtube": {"subscribers": 450, "videos": 12}}',
   '[{"domain": "zambianfoodie.co.zm", "domain_authority": 22, "instagram_followers": 12000}]',
   '{"1": "Start blog for SEO traffic", "2": "Increase TikTok to 4/week", "3": "Optimize YouTube titles and descriptions"}',
   'Strong social presence already. Blog is the biggest growth lever — food content has massive search volume in Zambia.'),

  -- Tenant 3 — initial audit (minimal — onboarding incomplete)
  ('o0000003-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', '2026-02-05T11:00:00Z', 'initial',
   10, 1, 0, 120, 8,
   NULL, NULL, NULL,
   '{"youtube": {"subscribers": 120, "videos": 4}, "tiktok": {"followers": 80, "posts_per_week": 0}}',
   '[]',
   '{"1": "Complete niche profile", "2": "Upload brand assets", "3": "Start YouTube posting schedule", "4": "Begin TikTok content"}',
   'New account with minimal online presence. Profile completion is the priority before content generation begins.');

-- ============================================================================
-- REPUTATION VELOCITY
-- ============================================================================

INSERT INTO reputation_velocity (id, tenant_id, week_start, new_backlinks, new_indexed_pages, new_reviews, net_new_followers, gsc_impressions_growth, velocity_score, velocity_trend, created_at) VALUES
  -- Tenant 1 — 8 weeks of data showing improvement
  ('p0000001-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', '2026-02-17', 1, 1, 2, 45, 8.50, 32, 'stable', '2026-02-23T00:00:00Z'),
  ('p0000001-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', '2026-02-24', 1, 1, 1, 62, 12.30, 38, 'improving', '2026-03-02T00:00:00Z'),
  ('p0000001-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', '2026-03-03', 2, 1, 0, 78, 15.20, 42, 'improving', '2026-03-09T00:00:00Z'),
  ('p0000001-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', '2026-03-10', 1, 2, 1, 95, 10.80, 48, 'improving', '2026-03-16T00:00:00Z'),
  ('p0000001-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', '2026-03-17', 2, 1, 2, 110, 18.50, 55, 'improving', '2026-03-23T00:00:00Z'),
  ('p0000001-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', '2026-03-24', 1, 1, 1, 88, 14.20, 52, 'stable', '2026-03-30T00:00:00Z'),
  ('p0000001-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000001', '2026-03-31', 3, 2, 2, 130, 22.40, 64, 'improving', '2026-04-06T00:00:00Z'),
  ('p0000001-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000001', '2026-04-07', 2, 2, 1, 105, 16.80, 58, 'stable', '2026-04-13T00:00:00Z'),

  -- Tenant 2 — 6 weeks
  ('p0000002-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', '2026-03-03', 0, 1, 0, 120, 5.20, 28, 'stable', '2026-03-09T00:00:00Z'),
  ('p0000002-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', '2026-03-10', 1, 1, 0, 180, 8.40, 35, 'improving', '2026-03-16T00:00:00Z'),
  ('p0000002-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', '2026-03-17', 0, 0, 0, 250, 12.10, 40, 'improving', '2026-03-23T00:00:00Z'),
  ('p0000002-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000002', '2026-03-24', 1, 1, 0, 310, 15.60, 48, 'improving', '2026-03-30T00:00:00Z'),
  ('p0000002-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000002', '2026-03-31', 0, 1, 0, 290, 10.20, 44, 'stable', '2026-04-06T00:00:00Z'),
  ('p0000002-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000002', '2026-04-07', 1, 1, 0, 420, 18.90, 56, 'improving', '2026-04-13T00:00:00Z'),

  -- Tenant 3 — minimal (just started)
  ('p0000003-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', '2026-03-31', 0, 0, 0, 15, 2.10, 8, 'stable', '2026-04-06T00:00:00Z'),
  ('p0000003-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', '2026-04-07', 0, 1, 0, 25, 4.50, 12, 'improving', '2026-04-13T00:00:00Z');

-- ============================================================================
-- CLIENT HEALTH SCORES
-- ============================================================================

INSERT INTO client_health_scores (id, tenant_id, score_date, seo_score, content_score, review_score, social_score, entity_score, total_score, trend, top_recommendations, created_at) VALUES
  -- Tenant 1 — 7 days, showing improvement
  ('q0000001-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', '2026-04-06', 58, 65, 42, 50, 30, 52, 'stable', '{"Post 3 blog articles this week", "Get 3 more Google reviews"}', '2026-04-06T23:59:00Z'),
  ('q0000001-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', '2026-04-07', 60, 65, 42, 52, 30, 54, 'improving', '{"Post 3 blog articles this week", "Get 3 more Google reviews"}', '2026-04-07T23:59:00Z'),
  ('q0000001-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', '2026-04-08', 62, 68, 44, 54, 32, 57, 'improving', '{"Maintain blog posting frequency", "Submit 2 directory listings"}', '2026-04-08T23:59:00Z'),
  ('q0000001-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', '2026-04-09', 63, 70, 44, 55, 32, 58, 'stable', '{"Maintain blog posting frequency", "Submit 2 directory listings"}', '2026-04-09T23:59:00Z'),
  ('q0000001-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', '2026-04-10', 64, 70, 45, 58, 34, 60, 'improving', '{"Increase Instagram to 3/week", "Reply to 2 unanswered Google reviews"}', '2026-04-10T23:59:00Z'),
  ('q0000001-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', '2026-04-11', 66, 72, 46, 60, 35, 63, 'improving', '{"Increase Instagram to 3/week", "Begin backlink outreach to health directories"}', '2026-04-11T23:59:00Z'),
  ('q0000001-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000001', '2026-04-12', 68, 74, 46, 62, 36, 65, 'improving', '{"Increase Instagram to 3/week", "Begin backlink outreach to health directories"}', '2026-04-12T23:59:00Z'),

  -- Tenant 2 — 3 recent days
  ('q0000002-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', '2026-04-10', 38, 82, 20, 78, 12, 55, 'stable', '{"Start blog posting for SEO", "Increase TikTok frequency"}', '2026-04-10T23:59:00Z'),
  ('q0000002-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', '2026-04-11', 40, 84, 20, 80, 12, 57, 'improving', '{"Start blog posting for SEO", "Increase TikTok frequency"}', '2026-04-11T23:59:00Z'),
  ('q0000002-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', '2026-04-12', 42, 85, 22, 82, 14, 59, 'improving', '{"Start blog posting for SEO", "Publish 2 Q&A answers"}', '2026-04-12T23:59:00Z'),

  -- Tenant 3 — low scores (onboarding)
  ('q0000003-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', '2026-04-11', 10, 20, 0, 8, 0, 8, 'stable', '{"Complete niche profile", "Upload brand assets"}', '2026-04-11T23:59:00Z'),
  ('q0000003-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', '2026-04-12', 12, 22, 0, 10, 0, 10, 'improving', '{"Complete niche profile", "Upload brand assets"}', '2026-04-12T23:59:00Z');

-- ============================================================================
-- ENTITY LISTINGS
-- ============================================================================

INSERT INTO entity_listings (id, tenant_id, created_at, updated_at, directory_name, directory_url, listing_url, status, submitted_name, submitted_address, submitted_phone, submitted_website, last_checked_at, is_consistent, inconsistency_notes) VALUES
  -- Tenant 1 — directory submissions
  ('r0000001-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', '2026-01-10T08:00:00Z', '2026-04-10T08:00:00Z',
   'Google Business Profile', 'https://business.google.com', 'https://g.co/kgs/lusakasmile', 'live',
   'Lusaka Smile Dental Clinic', '45 Independence Ave, Lusaka, Zambia', '+260 97 7000 001', 'https://lusakasmile.co.zm',
   '2026-04-10T08:00:00Z', true, NULL),

  ('r0000001-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', '2026-01-15T10:00:00Z', '2026-04-05T10:00:00Z',
   'Yellow Pages Zambia', 'https://yellowpages.co.zm', 'https://yellowpages.co.zm/lusaka-smile-dental', 'live',
   'Lusaka Smile Dental Clinic', '45 Independence Ave, Lusaka, Zambia', '+260 97 7000 001', 'https://lusakasmile.co.zm',
   '2026-04-05T10:00:00Z', true, NULL),

  ('r0000001-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', '2026-02-01T09:00:00Z', '2026-04-08T09:00:00Z',
   'Zambia Healthcare Directory', 'https://zambiahealth.co.zm', 'https://zambiahealth.co.zm/listing/lusaka-smile', 'inconsistent',
   'Lusaka Smile Dental', '45 Independence Ave, Lusaka', '+260 97 700 0001', 'https://lusakasmile.co.zm',
   '2026-04-08T09:00:00Z', false, 'Phone number format differs (missing digit grouping). Business name shortened — missing "Clinic".'),

  ('r0000001-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', '2026-04-12T06:00:00Z', '2026-04-12T06:00:00Z',
   'Yelp Zambia', 'https://yelp.co.zm', NULL, 'pending',
   'Lusaka Smile Dental Clinic', '45 Independence Ave, Lusaka, Zambia', '+260 97 7000 001', 'https://lusakasmile.co.zm',
   NULL, NULL, NULL),

  ('r0000001-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', '2026-03-15T11:00:00Z', '2026-04-01T11:00:00Z',
   'Facebook Business Page', 'https://facebook.com/business', 'https://facebook.com/lusakasmiledental', 'live',
   'Lusaka Smile Dental Clinic', '45 Independence Ave, Lusaka, Zambia', '+260 97 7000 001', 'https://lusakasmile.co.zm',
   '2026-04-01T11:00:00Z', true, NULL);

-- ============================================================================
-- CANNIBALISATION REPORTS
-- ============================================================================

INSERT INTO cannibalisation_reports (id, tenant_id, detected_at, conflicting_keyword, strong_post_id, weak_post_id, strong_post_url, weak_post_url, recommended_action, status, resolved_at, resolved_by) VALUES
  -- Tenant 1 — detected cannibalisation between two root canal posts
  ('s0000001-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', '2026-04-10T08:00:00Z',
   'root canal lusaka',
   'g0000001-0000-4000-8000-000000000001', 'g0000001-0000-4000-8000-000000000008',
   'https://lusakasmile.co.zm/blog/5-signs-root-canal', 'https://lusakasmile.co.zm/blog/root-canal-guide',
   'consolidate', 'pending', NULL, NULL),

  -- Tenant 1 — resolved case
  ('s0000001-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', '2026-03-15T06:00:00Z',
   'teeth whitening lusaka',
   NULL, NULL,
   'https://lusakasmile.co.zm/services/whitening', 'https://lusakasmile.co.zm/blog/whitening-tips',
   'redirect', 'approved', '2026-03-20T10:00:00Z', 'c0000000-0000-4000-8000-000000000003');

-- ============================================================================
-- ANALYTICS SNAPSHOTS
-- ============================================================================

INSERT INTO analytics_snapshots (id, tenant_id, snapshot_at, revenue_today, revenue_this_week, revenue_this_month, posts_published_today, posts_scheduled_24h, total_indexed_pages, pages_indexed_today, new_customers_today, upcoming_birthdays_7d, tasks_today_total, tasks_today_complete, latest_health_score, health_trend, latest_velocity_score) VALUES
  -- Tenant 1 — hourly snapshots for the last 6 hours (Mission Control data)
  ('t0000001-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', '2026-04-12T06:00:00Z', 850.00, 3200.00, 12500.00, 0, 2, 7, 0, 1, 1, 4, 1, 63, 'improving', 58),
  ('t0000001-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', '2026-04-12T06:15:00Z', 850.00, 3200.00, 12500.00, 0, 2, 7, 0, 1, 1, 4, 1, 63, 'improving', 58),
  ('t0000001-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', '2026-04-12T06:30:00Z', 1200.00, 3200.00, 12500.00, 0, 2, 7, 1, 1, 1, 4, 1, 65, 'improving', 58),
  ('t0000001-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', '2026-04-12T06:45:00Z', 1200.00, 3200.00, 12500.00, 0, 2, 7, 1, 1, 1, 4, 1, 65, 'improving', 58),
  ('t0000001-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', '2026-04-12T07:00:00Z', 1450.00, 3800.00, 12500.00, 1, 3, 7, 1, 2, 1, 4, 2, 65, 'improving', 58),
  ('t0000001-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', '2026-04-12T07:15:00Z', 1450.00, 3800.00, 12500.00, 1, 3, 7, 1, 2, 1, 4, 2, 65, 'improving', 58),

  -- Tenant 2 — latest snapshot
  ('t0000002-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', '2026-04-12T07:00:00Z', 0.00, 0.00, 0.00, 1, 2, 3, 0, 1, 0, 2, 1, 59, 'improving', 56),

  -- Tenant 3 — latest snapshot
  ('t0000003-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', '2026-04-12T07:00:00Z', 0.00, 0.00, 0.00, 0, 1, 1, 0, 0, 0, 1, 0, 10, 'stable', 12),

  -- Tenant 4 — latest snapshot
  ('t0000004-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000004', '2026-04-12T07:00:00Z', 0.00, 0.00, 0.00, 0, 0, 2, 0, 0, 0, 1, 0, 45, 'stable', 20);

-- ============================================================================
-- LOYALTY TRANSACTIONS
-- ============================================================================

INSERT INTO loyalty_transactions (id, tenant_id, customer_id, created_at, type, points, balance_after, description, reference_id) VALUES
  -- ====================================================================
  -- TENANT 1 — Lusaka Smile Dental
  -- ====================================================================

  -- Mwansa Banda loyalty history (standard → priority tier journey)
  ('u0000001-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000001', '2026-01-15T10:00:00Z', 'earn', 50, 50, 'Welcome bonus — QR bridge sign-up', 'WELCOME-001'),
  ('u0000001-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000001', '2026-02-05T14:00:00Z', 'earn', 80, 130, 'Dental checkup visit', 'VISIT-2026-0205'),
  ('u0000001-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000001', '2026-02-20T09:00:00Z', 'earn', 60, 190, 'Teeth cleaning appointment', 'VISIT-2026-0220'),
  ('u0000001-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000001', '2026-03-10T11:00:00Z', 'earn', 100, 290, 'Teeth whitening referral — new patient', 'REFERRAL-2026-0310'),
  ('u0000001-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000001', '2026-03-15T16:00:00Z', 'earn', 50, 340, 'Social media share bonus', 'SOCIAL-2026-0315'),
  ('u0000001-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000001', '2026-04-01T10:00:00Z', 'redeem', -100, 240, 'Free dental cleaning redemption', 'REDEEM-2026-0401'),

  -- Nalishe Mwewa (VIP — high-value patient)
  ('u0000001-0000-4000-8000-000000000010', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000003', '2026-02-10T09:00:00Z', 'earn', 50, 50, 'Welcome bonus — call sign-up', 'WELCOME-003'),
  ('u0000001-0000-4000-8000-000000000011', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000003', '2026-03-01T08:00:00Z', 'earn', 120, 170, 'Implant procedure — major treatment', 'VISIT-2026-0301'),
  ('u0000001-0000-4000-8000-000000000012', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000003', '2026-04-01T10:00:00Z', 'earn', 200, 370, 'Crown procedure — major treatment', 'VISIT-2026-0401'),
  ('u0000001-0000-4000-8000-000000000013', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000003', '2026-04-05T15:00:00Z', 'earn', 150, 520, 'Referral — 3 new patients from recommendation', 'REFERRAL-2026-0405'),

  -- Grace Tembo (priority — steady earner)
  ('u0000001-0000-4000-8000-000000000020', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000007', '2026-01-20T09:00:00Z', 'earn', 50, 50, 'Welcome bonus — WhatsApp sign-up', 'WELCOME-007'),
  ('u0000001-0000-4000-8000-000000000021', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000007', '2026-02-15T11:00:00Z', 'earn', 80, 130, 'Teeth cleaning + checkup', 'VISIT-2026-0215'),
  ('u0000001-0000-4000-8000-000000000022', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000007', '2026-03-10T10:00:00Z', 'earn', 80, 210, 'Whitening treatment', 'VISIT-2026-0310-W'),
  ('u0000001-0000-4000-8000-000000000023', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000007', '2026-04-02T09:00:00Z', 'earn', 100, 310, 'Dental implant referral — new patient', 'REFERRAL-2026-0402'),
  ('u0000001-0000-4000-8000-000000000024', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000007', '2026-04-08T16:00:00Z', 'earn', 100, 410, 'Regular checkup + 6-month loyalty bonus', 'VISIT-2026-0408-LB'),

  -- Chanda Mulonga (points expiry test — inactive customer)
  ('u0000001-0000-4000-8000-000000000030', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000002', '2026-01-10T11:00:00Z', 'earn', 50, 50, 'Welcome bonus — manual sign-up', 'WELCOME-002'),
  ('u0000001-0000-4000-8000-000000000031', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000002', '2026-02-28T14:00:00Z', 'earn', 80, 130, 'Checkup visit', 'VISIT-2026-0228'),
  ('u0000001-0000-4000-8000-000000000032', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000002', '2026-04-01T08:00:00Z', 'expire', -50, 80, 'Points expired — 90 days inactivity', 'EXPIRE-2026-Q1'),

  -- Bwalya Chisenga (adjustment test — admin corrected wrong points)
  ('u0000001-0000-4000-8000-000000000040', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000004', '2026-02-14T09:00:00Z', 'earn', 50, 50, 'Welcome bonus — social sign-up', 'WELCOME-004'),
  ('u0000001-0000-4000-8000-000000000041', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000004', '2026-03-01T10:00:00Z', 'earn', 40, 90, 'Dental checkup', 'VISIT-2026-0301-BC'),
  ('u0000001-0000-4000-8000-000000000042', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000004', '2026-04-10T08:00:00Z', 'adjustment', -10, 80, 'Admin correction — duplicate visit points removed', 'ADJUST-2026-0410'),

  -- ====================================================================
  -- TENANT 2 — Chewe Eats (UGC Creator)
  -- ====================================================================

  -- Tash Mwanza (brand collaborator)
  ('u0000002-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'h0000002-0000-4000-8000-000000000001', '2026-02-05T10:00:00Z', 'earn', 50, 50, 'Welcome bonus', 'WELCOME-TASH'),
  ('u0000002-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'h0000002-0000-4000-8000-000000000001', '2026-03-15T12:00:00Z', 'earn', 100, 150, 'Brand collaboration — restaurant feature', 'COLLAB-2026-0315'),

  -- Mwaba Chanda (VIP — early supporter)
  ('u0000002-0000-4000-8000-000000000010', 'b0000000-0000-4000-8000-000000000002', 'h0000002-0000-4000-8000-000000000004', '2026-01-20T11:00:00Z', 'earn', 50, 50, 'Welcome bonus — early follower', 'WELCOME-MWABA'),
  ('u0000002-0000-4000-8000-000000000011', 'b0000000-0000-4000-8000-000000000002', 'h0000002-0000-4000-8000-000000000004', '2026-02-20T09:00:00Z', 'earn', 80, 130, 'Recipe video share bonus', 'SOCIAL-2026-0220'),
  ('u0000002-0000-4000-8000-000000000012', 'b0000000-0000-4000-8000-000000000002', 'h0000002-0000-4000-8000-000000000004', '2026-03-10T14:00:00Z', 'earn', 70, 200, 'Brand ambassador — 3 restaurant intros', 'COLLAB-2026-0310'),
  ('u0000002-0000-4000-8000-000000000013', 'b0000000-0000-4000-8000-000000000002', 'h0000002-0000-4000-8000-000000000004', '2026-04-05T10:00:00Z', 'redeem', -50, 150, 'Exclusive dinner invitation redemption', 'REDEEM-2026-0405'),

  -- Kondwani Banda (standard — engagement rewards)
  ('u0000002-0000-4000-8000-000000000020', 'b0000000-0000-4000-8000-000000000002', 'h0000002-0000-4000-8000-000000000002', '2026-03-10T14:00:00Z', 'earn', 30, 30, 'Welcome bonus', 'WELCOME-KB'),
  ('u0000002-0000-4000-8000-000000000021', 'b0000000-0000-4000-8000-000000000002', 'h0000002-0000-4000-8000-000000000002', '2026-04-01T16:00:00Z', 'earn', 50, 80, 'Comment engagement streak — 5 videos', 'ENGAGE-2026-0401'),

  -- ====================================================================
  -- TENANT 3 — ZedFinance (Faceless Creator)
  -- ====================================================================

  -- Mirriam Zimba (priority — financial literacy advocate)
  ('u0000003-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', 'h0000003-0000-4000-8000-000000000002', '2026-03-01T10:00:00Z', 'earn', 30, 30, 'Welcome bonus — WhatsApp sign-up', 'WELCOME-MZ'),
  ('u0000003-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', 'h0000003-0000-4000-8000-000000000002', '2026-03-20T12:00:00Z', 'earn', 50, 80, 'Completed savings challenge share', 'CHALLENGE-2026-0320'),
  ('u0000003-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003', 'h0000003-0000-4000-8000-000000000002', '2026-04-10T09:00:00Z', 'earn', 40, 120, 'Webinar attendance bonus', 'WEBINAR-2026-0410'),

  -- Loveness Sakala (VIP — financial advisor partner)
  ('u0000003-0000-4000-8000-000000000010', 'b0000000-0000-4000-8000-000000000003', 'h0000003-0000-4000-8000-000000000004', '2026-02-20T11:00:00Z', 'earn', 50, 50, 'Welcome bonus — partner sign-up', 'WELCOME-LS'),
  ('u0000003-0000-4000-8000-000000000011', 'b0000000-0000-4000-8000-000000000003', 'h0000003-0000-4000-8000-000000000004', '2026-03-15T10:00:00Z', 'earn', 80, 130, 'Guest expert contribution — budgeting video', 'GUEST-2026-0315'),
  ('u0000003-0000-4000-8000-000000000012', 'b0000000-0000-4000-8000-000000000003', 'h0000003-0000-4000-8000-000000000004', '2026-04-01T08:00:00Z', 'earn', 70, 200, 'Referral — 5 new subscribers from network', 'REFERRAL-2026-0401-LS'),

  -- Felix Katongo (standard — viewer rewards)
  ('u0000003-0000-4000-8000-000000000020', 'b0000000-0000-4000-8000-000000000003', 'h0000003-0000-4000-8000-000000000001', '2026-02-15T08:00:00Z', 'earn', 30, 30, 'Welcome bonus', 'WELCOME-FK'),
  ('u0000003-0000-4000-8000-000000000021', 'b0000000-0000-4000-8000-000000000003', 'h0000003-0000-4000-8000-000000000001', '2026-03-25T18:00:00Z', 'earn', 50, 80, 'Watched 10 full videos — streak bonus', 'STREAK-2026-0325'),

  -- ====================================================================
  -- TENANT 4 — MukaPay (App Developer)
  -- ====================================================================

  -- Austin Phiri (VIP — power user, highest transaction volume)
  ('u0000004-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000002', '2026-03-15T09:00:00Z', 'earn', 100, 100, 'Welcome bonus — early adopter', 'WELCOME-AP'),
  ('u0000004-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000002', '2026-03-25T12:00:00Z', 'earn', 120, 220, 'Transaction milestone — K10,000 processed', 'MILESTONE-2026-0325'),
  ('u0000004-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000002', '2026-04-05T14:00:00Z', 'earn', 80, 300, 'Referral — merchant sign-up from recommendation', 'REFERRAL-2026-0405-AP'),
  ('u0000004-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000002', '2026-04-10T10:00:00Z', 'earn', 100, 400, 'Transaction milestone — K25,000 processed', 'MILESTONE-2026-0410'),
  ('u0000004-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000002', '2026-04-12T08:00:00Z', 'redeem', -100, 300, 'Fee discount redemption — next 10 transactions', 'REDEEM-2026-0412-AP'),
  ('u0000004-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000002', '2026-04-12T08:01:00Z', 'earn', 200, 500, 'Beta tester bonus — reported 3 critical bugs', 'BETA-2026-0412'),

  -- Chimwemwe Mwanza (priority — regular merchant)
  ('u0000004-0000-4000-8000-000000000010', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000001', '2026-03-10T08:00:00Z', 'earn', 50, 50, 'Welcome bonus — QR bridge sign-up', 'WELCOME-CM'),
  ('u0000004-0000-4000-8000-000000000011', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000001', '2026-03-28T10:00:00Z', 'earn', 80, 130, 'Transaction milestone — K5,000 processed', 'MILESTONE-2026-0328-CM'),
  ('u0000004-0000-4000-8000-000000000012', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000001', '2026-04-08T09:00:00Z', 'earn', 70, 200, 'Referral — 2 users signed up', 'REFERRAL-2026-0408-CM'),
  ('u0000004-0000-4000-8000-000000000013', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000001', '2026-04-11T14:00:00Z', 'earn', 100, 300, 'Transaction milestone — K10,000 processed', 'MILESTONE-2026-0411-CM'),

  -- Webby Mweetwa (standard — growing user)
  ('u0000004-0000-4000-8000-000000000020', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000004', '2026-03-20T12:00:00Z', 'earn', 50, 50, 'Welcome bonus — QR bridge sign-up', 'WELCOME-WM'),
  ('u0000004-0000-4000-8000-000000000021', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000004', '2026-04-05T11:00:00Z', 'earn', 50, 100, 'First K1,000 in transactions', 'MILESTONE-2026-0405-WM'),
  ('u0000004-0000-4000-8000-000000000022', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000004', '2026-04-09T15:00:00Z', 'earn', 50, 150, 'Referral — 1 user signed up', 'REFERRAL-2026-0409-WM'),

  -- Natasha Chanda (new user — minimal history)
  ('u0000004-0000-4000-8000-000000000030', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000003', '2026-04-01T10:00:00Z', 'earn', 30, 30, 'Welcome bonus', 'WELCOME-NC'),
  ('u0000004-0000-4000-8000-000000000031', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000003', '2026-04-10T12:00:00Z', 'earn', 20, 50, 'First transaction bonus', 'TXN-2026-0410-NC'),

  -- ====================================================================
  -- TENANT 5 — Kitwe Auto Spares (pending_approval — no real activity yet)
  -- ====================================================================

  -- Mwape Chilufya (imported contact, no platform interaction)
  ('u0000005-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000005', 'h0000005-0000-4000-8000-000000000001', '2026-04-10T15:00:00Z', 'earn', 10, 10, 'Pre-launch bonus — imported contact', 'PRELAUNCH-001'),

  -- Gift Bwalya (imported contact, no platform interaction)
  ('u0000005-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000005', 'h0000005-0000-4000-8000-000000000002', '2026-04-11T08:00:00Z', 'earn', 10, 10, 'Pre-launch bonus — imported contact', 'PRELAUNCH-002');

-- ============================================================================
-- BIRTHDAY TOKENS
-- ============================================================================

INSERT INTO birthday_tokens (id, tenant_id, customer_id, created_at, token, birth_year_this_run, offer_description, expires_at, redeemed, redeemed_at, redeemed_by_staff) VALUES
  -- ====================================================================
  -- TENANT 1 — Lusaka Smile Dental
  -- ====================================================================

  -- Mwansa Banda (birthday April 15 — active, unredeemed)
  ('v0000001-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000001', '2026-04-12T06:00:00Z',
   'bday-lsm-2026-mwansa-a1b2c3', 1988, 'Free dental cleaning + 20% off whitening', '2026-04-30T23:59:00Z', false, NULL, NULL),

  -- Grace Tembo (birthday Dec 12 — expired token from last year, redeemed)
  ('v0000001-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000007', '2025-12-01T06:00:00Z',
   'bday-lsm-2025-grace-d4e5f6', 1990, 'Free dental cleaning + 15% off any treatment', '2025-12-31T23:59:00Z', true, '2025-12-20T14:30:00Z', 'c0000000-0000-4000-8000-000000000004'),

  -- Peter Ngoma (birthday Feb 5 — redeemed this year)
  ('v0000001-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000008', '2026-02-01T06:00:00Z',
   'bday-lsm-2026-peter-g7h8i9', 1987, 'Free dental checkup', '2026-02-28T23:59:00Z', true, '2026-02-10T11:00:00Z', 'c0000000-0000-4000-8000-000000000004'),

  -- Nalishe Mwewa (birthday Nov 8 — expired unredeemed, tests expired-token flow)
  ('v0000001-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000003', '2025-11-01T06:00:00Z',
   'bday-lsm-2025-nalishe-j4k5l6', 1975, 'Free dental cleaning + VIP gift bag', '2025-11-30T23:59:00Z', false, NULL, NULL),

  -- Bwalya Chisenga (birthday Apr 3 — missed birthday, token generated late, still valid)
  ('v0000001-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000004', '2026-04-05T06:00:00Z',
   'bday-lsm-2026-bwalya-m7n8o9', 1995, 'Free dental checkup + 10% off any treatment', '2026-04-30T23:59:00Z', false, NULL, NULL),

  -- Angela Simwinga (birthday Jan 30 — this year redeemed)
  ('v0000001-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', 'h0000001-0000-4000-8000-000000000011', '2026-01-25T06:00:00Z',
   'bday-lsm-2026-angela-p0q1r2', 1985, 'Free dental cleaning', '2026-02-15T23:59:00Z', true, '2026-02-01T09:00:00Z', 'c0000000-0000-4000-8000-000000000004'),

  -- ====================================================================
  -- TENANT 2 — Chewe Eats (UGC Creator — followers get promo codes)
  -- ====================================================================

  -- Mwaba Chanda (birthday Jan 1 — redeemed)
  ('v0000002-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'h0000002-0000-4000-8000-000000000004', '2025-12-28T06:00:00Z',
   'bday-che-2026-mwaba-s3t4u5', 1993, 'Free meal at our partner restaurant + shoutout in next reel', '2026-01-15T23:59:00Z', true, '2026-01-05T18:00:00Z', NULL),

  -- Kondwani Banda (birthday May 7 — upcoming, active token)
  ('v0000002-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'h0000002-0000-4000-8000-000000000002', '2026-04-25T06:00:00Z',
   'bday-che-2026-kondwani-v6w7x8', 1995, 'Exclusive recipe card + 20% off partner restaurant', '2026-05-31T23:59:00Z', false, NULL, NULL),

  -- Tash Mwanza (birthday Feb 14 — expired unredeemed)
  ('v0000002-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', 'h0000002-0000-4000-8000-000000000001', '2026-02-08T06:00:00Z',
   'bday-che-2026-tash-y9z0a1', 1998, 'VIP dinner invitation at featured restaurant', '2026-02-28T23:59:00Z', false, NULL, NULL),

  -- ====================================================================
  -- TENANT 3 — ZedFinance (Faceless Creator — digital rewards)
  -- ====================================================================

  -- Mirriam Zimba (birthday Apr 22 — active, upcoming)
  ('v0000003-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', 'h0000003-0000-4000-8000-000000000002', '2026-04-15T06:00:00Z',
   'bday-zed-2026-mirriam-b2c3d4', 1987, 'Free premium budgeting template + 1-on-1 finance Q&A session', '2026-04-30T23:59:00Z', false, NULL, NULL),

  -- Felix Katongo (birthday Aug 8 — not yet generated, tests mid-year generation)
  ('v0000003-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', 'h0000003-0000-4000-8000-000000000001', '2026-08-01T06:00:00Z',
   'bday-zed-2026-felix-e5f6g7', 1991, 'Exclusive savings challenge access + ebook download', '2026-08-31T23:59:00Z', false, NULL, NULL),

  -- Loveness Sakala (birthday Jul 17 — not yet generated)
  ('v0000003-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003', 'h0000003-0000-4000-8000-000000000004', '2026-07-10T06:00:00Z',
   'bday-zed-2026-loveness-h8i9j0', 1984, 'Co-host a finance webinar + premium course access', '2026-07-31T23:59:00Z', false, NULL, NULL),

  -- ====================================================================
  -- TENANT 4 — MukaPay (App Developer — fee discounts and premium features)
  -- ====================================================================

  -- Austin Phiri (birthday Dec 25 — redeemed last December)
  ('v0000004-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000002', '2025-12-18T06:00:00Z',
   'bday-pay-2025-austin-k1l2m3', 1988, '50% off transaction fees for 1 month', '2026-01-15T23:59:00Z', true, '2025-12-28T10:00:00Z', NULL),

  -- Chimwemwe Mwanza (birthday Oct 10 — upcoming, active token)
  ('v0000004-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000001', '2026-10-01T06:00:00Z',
   'bday-pay-2026-chimwemwe-n4o5p6', 1993, 'Free premium tier for 1 month + priority support', '2026-10-31T23:59:00Z', false, NULL, NULL),

  -- Webby Mweetwa (birthday Sep 18 — upcoming)
  ('v0000004-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000004', '2026-09-10T06:00:00Z',
   'bday-pay-2026-webby-q7r8s9', 1979, 'Zero fees for 2 weeks + business analytics upgrade', '2026-09-30T23:59:00Z', false, NULL, NULL),

  -- Natasha Chanda (birthday May 5 — generated now, active)
  ('v0000004-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000004', 'h0000004-0000-4000-8000-000000000003', '2026-04-28T06:00:00Z',
   'bday-pay-2026-natasha-t0u1v2', 1996, 'Free QR code setup + 30% off next invoice', '2026-05-31T23:59:00Z', false, NULL, NULL),

  -- ====================================================================
  -- TENANT 5 — Kitwe Auto Spares (pending_approval — minimal, pre-launch only)
  -- ====================================================================

  -- Mwape Chilufya (birthday Jun 14 — pre-launch placeholder token)
  ('v0000005-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000005', 'h0000005-0000-4000-8000-000000000001', '2026-04-10T15:00:00Z',
   'bday-kas-2026-mwape-w3x4y5', 1982, '10% off first purchase (once account is approved)', '2026-06-30T23:59:00Z', false, NULL, NULL),

  -- Gift Bwalya (birthday Mar 30 — already passed this year, token created anyway for pre-launch)
  ('v0000005-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000005', 'h0000005-0000-4000-8000-000000000002', '2026-04-11T08:00:00Z',
   'bday-kas-2026-gift-z6a7b8', 1975, 'Free diagnostic check (once account is approved)', '2026-05-15T23:59:00Z', false, NULL, NULL);

-- ============================================================================
-- DEAD JOBS
-- ============================================================================

INSERT INTO dead_jobs (id, tenant_id, failed_at, queue_name, job_type, job_data, error_message, attempts, bullmq_job_id, reviewed, reviewed_by, reviewed_at, resolution_notes) VALUES
  -- Unreviewed dead job
  ('w0000001-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', '2026-04-10T10:05:00Z',
   'content-publish', 'publish_social_post',
   '{"post_id": "g0000001-0000-4000-8000-000000000006", "platform": "facebook"}',
   'META_GRAPH_API: Page access token expired. Refresh required.',
   3, 'bullmq-cp-20260410-001',
   false, NULL, NULL, NULL),

  -- Reviewed dead job
  ('w0000001-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', '2026-03-28T09:30:00Z',
   'content-generate', 'generate_blog_post',
   '{"tenant_id": "b0000000-0000-4000-8000-000000000001", "keyword": "orthodontics lusaka"}',
   'CLAUDE_API: Rate limit exceeded. Retry after 60 seconds.',
   5, 'bullmq-cg-20260328-042',
   true, 'c0000000-0000-4000-8000-000000000001', '2026-03-29T08:00:00Z', 'Rate limit — job rescheduled successfully after cooldown. No data loss.'),

  -- Platform-level dead job (no tenant)
  ('w0000000-0000-4000-8000-000000000001', NULL, '2026-04-08T03:15:00Z',
   'analytics', 'aggregate_snapshots',
   '{"worker": "worker4", "cycle": "15min"}',
   'REDIS: Connection timeout to redis:6379. Worker 4 health check failed.',
   3, 'bullmq-an-20260408-008',
   true, 'c0000000-0000-4000-8000-000000000001', '2026-04-08T08:00:00Z', 'Redis blip during backup window. Resolved after Redis restart. Added retry backoff config.');
