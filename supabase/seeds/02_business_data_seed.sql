-- ============================================================================
-- QUANTUM NEXUS — Seed: Tenant Business Data
-- Phase: 2 (Mock Data Layer)
-- Terminal: 4 (Database)
--
-- Covers: business_profiles, content_posts, customers, knowledge_base,
--          invoices, notifications
-- Depends on: 01_platform_seed.sql (tenants, niche_profiles)
-- ============================================================================

-- ============================================================================
-- BUSINESS PROFILES
-- ============================================================================

INSERT INTO business_profiles (id, tenant_id, created_at, updated_at, niche, niche_profile_id, location, website_url, phone_number, logo_url, brand_primary_color, brand_secondary_color, brand_voice_tone, content_language, fallback_message, keyword_blocklist, preferred_formats, posting_schedule, twilio_phone_number) VALUES
  (
    'f0000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000001',
    '2025-12-02T08:00:00Z', '2026-04-10T14:30:00Z',
    'dental_care_zambia', 'd0000000-0000-4000-8000-000000000001',
    'Lusaka, Zambia', 'https://lusakasmile.co.zm', '+260 97 7000 001',
    'https://r2.quantumnexus.io/logos/lusaka-smile-logo.png',
    '#0EA5E9', '#0284C7',
    'professional yet warm', 'english',
    'Thank you for reaching out. We will get back to you shortly during business hours.',
    '{"cheap", "discount", "free consultation"}',
    '{"blog_post", "social_post", "gbp_post"}',
    '{"monday": {"social": "10:00", "blog": "14:00"}, "wednesday": {"social": "10:00", "gbp": "12:00"}, "friday": {"social": "10:00", "blog": "14:00"}}',
    '+260 97 7100 001'
  ),
  (
    'f0000000-0000-4000-8000-000000000002',
    'b0000000-0000-4000-8000-000000000002',
    '2026-01-16T09:00:00Z', '2026-04-12T08:15:00Z',
    'food_lifestyle_zambia', 'd0000000-0000-4000-8000-000000000002',
    'Lusaka, Zambia', 'https://cheweeats.co.zm', '+260 96 5000 002',
    'https://r2.quantumnexus.io/logos/chewe-eats-logo.png',
    '#F97316', '#EA580C',
    'energetic and relatable', 'english',
    'Hey! New review dropping soon — stay tuned!',
    '{"expensive", "overpriced"}',
    '{"reel", "tiktok", "social_post"}',
    '{"tuesday": {"reel": "11:00", "tiktok": "18:00"}, "thursday": {"social": "12:00", "tiktok": "18:00"}, "saturday": {"reel": "10:00", "social": "16:00"}}',
    NULL
  ),
  (
    'f0000000-0000-4000-8000-000000000003',
    'b0000000-0000-4000-8000-000000000003',
    '2026-02-02T07:00:00Z', '2026-04-11T20:00:00Z',
    'personal_finance_zambia', 'd0000000-0000-4000-8000-000000000003',
    'Lusaka, Zambia', 'https://zedfinance.co.zm', '+260 95 3000 003',
    'https://r2.quantumnexus.io/logos/zedfinance-logo.png',
    '#10B981', '#059669',
    'calm and educational', 'english',
    'Financial literacy content coming your way!',
    '{"get rich quick", "guaranteed returns"}',
    '{"youtube_video", "tiktok", "blog_post"}',
    '{"monday": {"youtube": "07:00", "tiktok": "12:00"}, "wednesday": {"blog": "09:00", "tiktok": "12:00"}, "friday": {"youtube": "07:00", "social": "15:00"}}',
    NULL
  ),
  (
    'f0000000-0000-4000-8000-000000000004',
    'b0000000-0000-4000-8000-000000000004',
    '2026-03-02T10:00:00Z', '2026-04-12T06:45:00Z',
    'fintech_app_zambia', 'd0000000-0000-4000-8000-000000000004',
    'Lusaka, Zambia', 'https://mukapay.co.zm', '+260 97 8000 004',
    'https://r2.quantumnexus.io/logos/mukapay-logo.png',
    '#7C3AED', '#6D28D9',
    'modern and trustworthy', 'english',
    'Need help? Our support team is here for you.',
    '{}',
    '{"blog_post", "social_post", "email"}',
    '{"tuesday": {"social": "10:00"}, "thursday": {"blog": "14:00", "social": "10:00"}}',
    NULL
  );

-- ============================================================================
-- CONTENT POSTS
-- ============================================================================

-- Tenant 1 (Lusaka Smile Dental) — 8 posts across statuses
INSERT INTO content_posts (id, tenant_id, created_at, updated_at, content_type, platform, target_platform, caption, media_url, media_type, blog_content, email_subject, target_keyword, meta_description, internal_links, status, scheduled_for, published_at, algorithm_score, algorithm_score_breakdown, safety_check_result, safety_check_reason, impressions, reach, engagement, engagement_rate, clicks, saves, shares, comments, trend_id, trend_phrase) VALUES
  -- Published blog post
  ('g0000001-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', '2026-03-15T08:00:00Z', '2026-03-20T10:00:00Z',
   'blog_post', NULL, 'blog', '5 Signs You Need a Root Canal — And What to Expect',
   NULL, NULL,
   '<h2>How Do You Know If You Need a Root Canal?</h2><p>Persistent tooth pain, sensitivity to hot and cold, swollen gums, darkening of the tooth, and a pimple on the gums are the five key signs...</p><h2>What Happens During a Root Canal?</h2><p>A root canal procedure at Lusaka Smile Dental typically takes 60-90 minutes. We use local anaesthesia and modern rotary instruments for maximum comfort...</p>',
   NULL, 'root canal lusaka', 'Learn the 5 warning signs that indicate you may need a root canal and what to expect during the procedure at Lusaka Smile Dental.',
   '{"https://lusakasmile.co.zm/services", "https://lusakasmile.co.zm/blog/dental-checkup-guide"}',
   'published', '2026-03-20T09:00:00Z', '2026-03-20T09:00:12Z',
   87, '{"keyword_relevance": 25, "content_depth": 22, "readability": 18, "engagement_prediction": 12, "seo_structure": 10}',
   'pass', NULL,
   342, 289, 47, 16.26, 38, 12, 8, 3, NULL, NULL),

  -- Scheduled social post
  ('g0000001-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', '2026-04-10T14:00:00Z', '2026-04-10T14:00:00Z',
   'social_post', 'facebook', 'facebook', 'Your smile deserves the best care. Book your dental checkup at Lusaka Smile Dental today — walk-ins welcome!',
   'https://r2.quantumnexus.io/media/lusaka-smile-checkup-post.jpg', 'image',
   NULL, NULL, NULL, NULL, NULL, '{}',
   'scheduled', '2026-04-16T10:00:00Z', NULL,
   72, '{"keyword_relevance": 18, "visual_quality": 20, "timing": 16, "audience_fit": 18}',
   'pass', NULL,
   0, 0, 0, NULL, 0, 0, 0, 0, NULL, NULL),

  -- Scheduled Instagram post
  ('g0000001-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', '2026-04-10T14:30:00Z', '2026-04-10T14:30:00Z',
   'social_post', 'instagram', 'instagram', 'Teeth whitening results that speak for themselves. DM us to learn about our professional whitening services.',
   'https://r2.quantumnexus.io/media/lusaka-smile-whitening.jpg', 'image',
   NULL, NULL, NULL, NULL, NULL, '{}',
   'scheduled', '2026-04-17T11:00:00Z', NULL,
   78, '{"keyword_relevance": 20, "visual_quality": 22, "timing": 16, "audience_fit": 20}',
   'pass', NULL,
   0, 0, 0, NULL, 0, 0, 0, 0, NULL, NULL),

  -- Draft blog post
  ('g0000001-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', '2026-04-11T09:00:00Z', '2026-04-11T09:00:00Z',
   'blog_post', NULL, 'blog', 'Why Regular Dental Checkups Save You Money in the Long Run',
   NULL, NULL,
   '<h2>The Hidden Cost of Skipping Dental Visits</h2><p>Many people in Lusaka avoid the dentist until pain becomes unbearable. But preventive checkups cost a fraction of emergency treatments...</p>',
   NULL, 'dental checkup lusaka', 'Discover how regular dental checkups at Lusaka Smile Dental can save you money by catching problems early.',
   '{}',
   'draft', NULL, NULL,
   NULL, NULL, NULL, NULL,
   0, 0, 0, NULL, 0, 0, 0, 0, NULL, NULL),

  -- Published GBP post
  ('g0000001-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', '2026-04-01T08:00:00Z', '2026-04-01T12:00:00Z',
   'gbp_post', 'google_business', 'google_business', 'Now offering Saturday appointments for dental cleanings and checkups! Call +260 97 7000 001 to book.',
   'https://r2.quantumnexus.io/media/lusaka-smile-gbp-saturday.jpg', 'image',
   NULL, NULL, NULL, NULL, NULL, '{}',
   'published', '2026-04-01T12:00:00Z', '2026-04-01T12:00:05Z',
   65, '{"keyword_relevance": 16, "visual_quality": 18, "audience_fit": 16, "call_to_action": 15}',
   'pass', NULL,
   156, 142, 22, 15.49, 19, 4, 6, 2, NULL, NULL),

  -- Failed post
  ('g0000001-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', '2026-03-28T10:00:00Z', '2026-03-28T10:05:00Z',
   'social_post', 'facebook', 'facebook', 'Happy Easter from Lusaka Smile Dental! Keep your smile bright this holiday.',
   'https://r2.quantumnexus.io/media/lusaka-smile-easter.jpg', 'image',
   NULL, NULL, NULL, NULL, NULL, '{}',
   'failed', '2026-03-28T09:00:00Z', NULL,
   NULL, NULL, NULL, NULL,
   0, 0, 0, NULL, 0, 0, 0, 0, NULL, NULL),

  -- Pending safety check
  ('g0000001-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000001', '2026-04-12T06:00:00Z', '2026-04-12T06:00:00Z',
   'social_post', 'instagram', 'instagram', 'New dental implant technology now available in Lusaka. Restore your smile with confidence.',
   'https://r2.quantumnexus.io/media/lusaka-smile-implants.jpg', 'image',
   NULL, NULL, NULL, NULL, NULL, '{}',
   'pending_safety', '2026-04-18T10:00:00Z', NULL,
   NULL, NULL, NULL, NULL,
   0, 0, 0, NULL, 0, 0, 0, 0, NULL, NULL),

  -- Published blog with trend
  ('g0000001-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000001', '2026-04-05T07:00:00Z', '2026-04-08T10:00:00Z',
   'blog_post', NULL, 'blog', 'The Ultimate Guide to Dental Implants in Zambia',
   NULL, NULL,
   '<h2>Are Dental Implants Right for You?</h2><p>Dental implants are the gold standard for replacing missing teeth. At Lusaka Smile Dental, we use titanium implants with a 98% success rate...</p>',
   NULL, 'dental implants zambia', 'Everything you need to know about dental implants in Zambia — costs, procedure, recovery, and why Lusaka Smile Dental is your best choice.',
   '{"https://lusakasmile.co.zm/services/implants", "https://lusakasmile.co.zm/blog/root-canal-guide"}',
   'published', '2026-04-08T09:00:00Z', '2026-04-08T09:00:18Z',
   91, '{"keyword_relevance": 26, "content_depth": 24, "readability": 18, "engagement_prediction": 13, "seo_structure": 10}',
   'pass', NULL,
   521, 445, 68, 15.28, 62, 24, 14, 7, NULL, 'dental implants zambia');

-- Tenant 2 (Chewe Eats) — 6 posts
INSERT INTO content_posts (id, tenant_id, created_at, updated_at, content_type, platform, target_platform, caption, media_url, media_type, blog_content, target_keyword, meta_description, status, scheduled_for, published_at, algorithm_score, safety_check_result, impressions, reach, engagement, engagement_rate, clicks, saves, shares, comments, trend_id, trend_phrase) VALUES
  ('g0000002-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', '2026-04-05T11:00:00Z', '2026-04-10T14:00:00Z',
   'reel', 'instagram', 'instagram', 'Found the BEST nshima in Lusaka and you need to try this! Location in bio.',
   'https://r2.quantumnexus.io/media/chewe-nshima-reel.mp4', 'video',
   NULL, NULL, NULL,
   'published', '2026-04-10T12:00:00Z', '2026-04-10T12:00:08Z',
   88, 'pass', 8920, 7450, 1234, 16.57, 456, 312, 289, 89, NULL, 'nshima lusaka'),

  ('g0000002-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', '2026-04-11T08:00:00Z', '2026-04-11T08:00:00Z',
   'tiktok', 'tiktok', 'tiktok', 'POV: You discover Zambian street food for the first time #zambianfood #lusaka',
   'https://r2.quantumnexus.io/media/chewe-street-food.mp4', 'video',
   NULL, NULL, NULL,
   'scheduled', '2026-04-16T18:00:00Z', NULL,
   82, 'pass', 0, 0, 0, NULL, 0, 0, 0, 0, NULL, NULL),

  ('g0000002-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', '2026-04-01T09:00:00Z', '2026-04-03T15:00:00Z',
   'blog_post', NULL, 'blog', 'Top 5 Hidden Gem Restaurants in Lusaka You Haven''t Tried Yet',
   NULL, NULL,
   '<h2>Beyond the Usual Spots</h2><p>Everyone knows about the malls and hotel restaurants, but Lusaka has a thriving hidden food scene. Here are 5 spots that locals love but tourists never find...</p>',
   'lusaka restaurants', 'Discover 5 underrated restaurants in Lusaka that only the locals know about. Authentic Zambian cuisine at its finest.',
   'published', '2026-04-03T09:00:00Z', '2026-04-03T09:00:22Z',
   85, 'pass', 1876, 1620, 287, 17.72, 198, 87, 45, 32, NULL, NULL),

  ('g0000002-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000002', '2026-04-12T06:00:00Z', '2026-04-12T06:00:00Z',
   'social_post', 'facebook', 'facebook', 'This weekend: ifisashi recipe walkthrough coming to the channel! Drop a comment if you want the recipe card.',
   'https://r2.quantumnexus.io/media/chewe-ifisashi-teaser.jpg', 'image',
   NULL, NULL, NULL,
   'pending_approval', '2026-04-19T12:00:00Z', NULL,
   76, 'pass', 0, 0, 0, NULL, 0, 0, 0, 0, NULL, NULL),

  ('g0000002-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000002', '2026-03-25T10:00:00Z', '2026-03-28T12:00:00Z',
   'reel', 'instagram', 'instagram', 'Making the perfect vitumbuwa from scratch. Crispy on the outside, soft on the inside!',
   'https://r2.quantumnexus.io/media/chewe-vitumbuwa.mp4', 'video',
   NULL, NULL, NULL,
   'published', '2026-03-28T11:00:00Z', '2026-03-28T11:00:15Z',
   79, 'pass', 5430, 4890, 678, 13.86, 189, 156, 98, 34, NULL, 'vitumbuwa recipe'),

  ('g0000002-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000002', '2026-04-12T07:30:00Z', '2026-04-12T07:30:00Z',
   'social_post', 'instagram', 'instagram', 'Rate this chibuku experience 1-10. Comment below!',
   'https://r2.quantumnexus.io/media/chewe-chibuku.jpg', 'image',
   NULL, NULL, NULL,
   'draft', NULL, NULL,
   NULL, NULL, 0, 0, 0, NULL, 0, 0, 0, 0, NULL, NULL);

-- Tenant 3 (ZedFinance) — 3 posts
INSERT INTO content_posts (id, tenant_id, created_at, updated_at, content_type, platform, target_platform, caption, media_url, media_type, blog_content, target_keyword, meta_description, status, scheduled_for, published_at, algorithm_score, safety_check_result, impressions, reach, engagement, engagement_rate, clicks, saves, shares, comments) VALUES
  ('g0000003-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', '2026-04-01T07:00:00Z', '2026-04-05T09:00:00Z',
   'youtube_video', 'youtube', 'youtube', 'How to Start Saving Money in Zambia — Even on a Small Salary',
   'https://r2.quantumnexus.io/media/zedfinance-saving-video.mp4', 'video',
   '<h2>Start Small, Grow Steady</h2><p>The biggest myth about saving money is that you need a lot to start. In this video, we break down practical strategies for Zambians earning K3,000 to K10,000 a month...</p>',
   'saving money zambia', 'Practical money-saving strategies for Zambians on any income. Start building your financial future today.',
   'published', '2026-04-05T07:00:00Z', '2026-04-05T07:00:30Z',
   83, 'pass', 12800, 11200, 945, 8.44, 876, 534, 312, 156),

  ('g0000003-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', '2026-04-10T06:00:00Z', '2026-04-10T06:00:00Z',
   'tiktok', 'tiktok', 'tiktok', '3 money rules every Zambian should know #personalfinance #zambia #moneytips',
   'https://r2.quantumnexus.io/media/zedfinance-3rules.mp4', 'video',
   NULL, NULL, NULL,
   'scheduled', '2026-04-17T12:00:00Z', NULL,
   75, 'pass', 0, 0, 0, NULL, 0, 0, 0, 0),

  ('g0000003-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003', '2026-04-12T05:00:00Z', '2026-04-12T05:00:00Z',
   'blog_post', NULL, 'blog', 'Understanding Zambian Kwacha Inflation: What It Means for Your Savings',
   NULL, NULL,
   '<h2>Inflation and Your Wallet</h2><p>Zambia experienced inflation rates averaging 10-15% in recent years. This means your K10,000 under the mattress is worth less each year. Here is how to protect your savings...</p>',
   'zambian kwacha inflation', 'Learn how inflation affects your savings in Zambia and practical steps to protect your purchasing power.',
   'draft', NULL, NULL,
   NULL, NULL, 0, 0, 0, NULL, 0, 0, 0, 0);

-- ============================================================================
-- CUSTOMERS
-- ============================================================================

-- Tenant 1 (Lusaka Smile Dental) — 12 customers
INSERT INTO customers (id, tenant_id, created_at, updated_at, first_name, last_name, phone_number, email, source, birth_day, birth_month, birth_year, loyalty_points, tier, total_spend, visit_count, status) VALUES
  ('h0000001-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', '2026-01-05T10:00:00Z', '2026-04-08T14:00:00Z', 'Mwansa', 'Banda', '+260 97 1001 001', 'mwansa.banda@email.co.zm', 'qr_bridge', 15, 3, 1988, 340, 'priority', 2850.00, 8, 'active'),
  ('h0000001-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', '2026-01-10T11:00:00Z', '2026-03-20T09:00:00Z', 'Chanda', 'Mulonga', '+260 96 1002 002', 'chanda.m@gmail.com', 'manual', 22, 7, 1992, 180, 'standard', 1200.00, 4, 'active'),
  ('h0000001-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', '2026-02-01T08:30:00Z', '2026-04-01T16:00:00Z', 'Nalishe', 'Mwewa', '+260 95 1003 003', NULL, 'call', 8, 11, 1975, 520, 'vip', 6400.00, 14, 'active'),
  ('h0000001-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', '2026-02-14T09:00:00Z', '2026-04-10T11:00:00Z', 'Bwalya', 'Chisenga', '+260 97 1004 004', 'bwalya.c@email.co.zm', 'social', 3, 4, 1995, 90, 'standard', 650.00, 3, 'active'),
  ('h0000001-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', '2026-03-01T13:00:00Z', '2026-04-05T10:00:00Z', 'Thandiwe', 'Phiri', '+260 96 1005 005', NULL, 'qr_bridge', 28, 9, 1983, 0, 'standard', 0.00, 1, 'active'),
  ('h0000001-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', '2026-03-15T15:00:00Z', '2026-03-15T15:00:00Z', 'Joseph', 'Sakala', '+260 95 1006 006', 'joseph.s@email.co.zm', 'import', 19, 6, 1970, 0, 'standard', 0.00, 0, 'active'),
  ('h0000001-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000001', '2026-01-20T10:00:00Z', '2026-04-10T10:00:00Z', 'Grace', 'Tembo', '+260 97 1007 007', 'grace.tembo@email.co.zm', 'whatsapp', 12, 12, 1990, 410, 'priority', 3200.00, 10, 'active'),
  ('h0000001-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000001', '2026-02-28T14:00:00Z', '2026-04-06T09:00:00Z', 'Peter', 'Ngoma', '+260 96 1008 008', NULL, 'qr_bridge', 5, 2, 1987, 60, 'standard', 400.00, 2, 'active'),
  ('h0000001-0000-4000-8000-000000000009', 'b0000000-0000-4000-8000-000000000001', '2025-12-20T16:00:00Z', '2026-02-15T10:00:00Z', 'Linda', 'Chilufya', '+260 95 1009 009', 'linda.c@email.co.zm', 'call', 25, 8, 1978, 0, 'standard', 0.00, 0, 'inactive'),
  ('h0000001-0000-4000-8000-000000000010', 'b0000000-0000-4000-8000-000000000001', '2026-04-01T08:00:00Z', '2026-04-10T14:00:00Z', 'Moses', 'Zulu', '+260 97 1010 010', 'moses.z@email.co.zm', 'social', 17, 4, 2000, 30, 'standard', 250.00, 1, 'active'),
  ('h0000001-0000-4000-8000-000000000011', 'b0000000-0000-4000-8000-000000000001', '2026-03-20T11:00:00Z', '2026-04-08T15:00:00Z', 'Angela', 'Simwinga', '+260 96 1011 011', NULL, 'manual', 30, 1, 1985, 70, 'standard', 550.00, 2, 'active'),
  ('h0000001-0000-4000-8000-000000000012', 'b0000000-0000-4000-8000-000000000001', '2026-02-05T09:30:00Z', '2026-02-05T09:30:00Z', 'David', 'Mwale', '+260 95 1012 012', NULL, 'call', 10, 10, 1965, 0, 'standard', 0.00, 0, 'blocked');

-- Tenant 2 (Chewe Eats) — 5 customers (brand collabs, followers)
INSERT INTO customers (id, tenant_id, created_at, updated_at, first_name, last_name, phone_number, email, source, birth_day, birth_month, birth_year, loyalty_points, tier, total_spend, visit_count, status) VALUES
  ('h0000002-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', '2026-02-01T09:00:00Z', '2026-04-10T18:00:00Z', 'Tash', 'Mwanza', '+260 97 2001 001', 'tash.m@email.co.zm', 'social', 14, 2, 1998, 150, 'priority', 0.00, 0, 'active'),
  ('h0000002-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', '2026-03-10T14:00:00Z', '2026-04-09T12:00:00Z', 'Kondwani', 'Banda', '+260 96 2002 002', 'kondwani.b@email.co.zm', 'whatsapp', 7, 5, 1995, 80, 'standard', 0.00, 0, 'active'),
  ('h0000002-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', '2026-04-01T10:00:00Z', '2026-04-11T16:00:00Z', 'Precious', 'Lungu', '+260 95 2003 003', NULL, 'social', 20, 10, 2001, 0, 'standard', 0.00, 0, 'active'),
  ('h0000002-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000002', '2026-01-20T11:00:00Z', '2026-04-05T14:00:00Z', 'Mwaba', 'Chanda', '+260 97 2004 004', 'mwaba.c@email.co.zm', 'manual', 1, 1, 1993, 200, 'vip', 0.00, 0, 'active'),
  ('h0000002-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000002', '2026-04-10T08:00:00Z', '2026-04-10T08:00:00Z', 'Sasha', 'Mumba', '+260 96 2005 005', NULL, 'social', 15, 6, 1997, 0, 'standard', 0.00, 0, 'active');

-- Tenant 3 (ZedFinance) — faceless channel followers/brand partners
INSERT INTO customers (id, tenant_id, created_at, updated_at, first_name, last_name, phone_number, email, source, birth_day, birth_month, birth_year, loyalty_points, tier, total_spend, visit_count, status) VALUES
  ('h0000003-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', '2026-02-15T08:00:00Z', '2026-04-10T12:00:00Z', 'Felix', 'Katongo', '+260 97 3001 001', 'felix.k@email.co.zm', 'social', 8, 8, 1991, 80, 'standard', 0.00, 0, 'active'),
  ('h0000003-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', '2026-03-01T10:00:00Z', '2026-04-08T14:00:00Z', 'Mirriam', 'Zimba', '+260 96 3002 002', 'mirriam.z@email.co.zm', 'whatsapp', 22, 4, 1987, 120, 'priority', 0.00, 0, 'active'),
  ('h0000003-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003', '2026-04-05T09:00:00Z', '2026-04-12T06:00:00Z', 'Davison', 'Bwalya', '+260 95 3003 003', NULL, 'social', 3, 11, 1999, 0, 'standard', 0.00, 0, 'active'),
  ('h0000003-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000003', '2026-02-20T11:00:00Z', '2026-04-05T10:00:00Z', 'Loveness', 'Sakala', '+260 97 3004 004', 'loveness.s@email.co.zm', 'manual', 17, 7, 1984, 200, 'vip', 0.00, 0, 'active');

-- Tenant 4 (MukaPay) — app users / beta testers
INSERT INTO customers (id, tenant_id, created_at, updated_at, first_name, last_name, phone_number, email, source, birth_day, birth_month, birth_year, loyalty_points, tier, total_spend, visit_count, status) VALUES
  ('h0000004-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000004', '2026-03-10T08:00:00Z', '2026-04-12T07:00:00Z', 'Chimwemwe', 'Mwanza', '+260 97 4001 001', 'chimwemwe.m@email.co.zm', 'qr_bridge', 10, 10, 1993, 300, 'priority', 15000.00, 24, 'active'),
  ('h0000004-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000004', '2026-03-15T09:00:00Z', '2026-04-11T16:00:00Z', 'Austin', 'Phiri', '+260 96 4002 002', 'austin.p@email.co.zm', 'social', 25, 12, 1988, 500, 'vip', 45000.00, 52, 'active'),
  ('h0000004-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000004', '2026-04-01T10:00:00Z', '2026-04-10T14:00:00Z', 'Natasha', 'Chanda', '+260 95 4003 003', 'natasha.c@email.co.zm', 'manual', 5, 5, 1996, 50, 'standard', 2000.00, 3, 'active'),
  ('h0000004-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000004', '2026-03-20T12:00:00Z', '2026-04-09T11:00:00Z', 'Webby', 'Mweetwa', '+260 97 4004 004', NULL, 'qr_bridge', 18, 9, 1979, 150, 'standard', 8500.00, 12, 'active'),
  ('h0000004-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000004', '2026-04-08T14:00:00Z', '2026-04-08T14:00:00Z', 'Ireen', 'Tembo', '+260 96 4005 005', 'ireen.t@email.co.zm', 'import', 28, 2, 2000, 0, 'standard', 0.00, 1, 'active');

-- Tenant 5 (Kitwe Auto Spares) — pending_approval, minimal customer list from before onboarding
INSERT INTO customers (id, tenant_id, created_at, updated_at, first_name, last_name, phone_number, email, source, birth_day, birth_month, birth_year, loyalty_points, tier, total_spend, visit_count, status) VALUES
  ('h0000005-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000005', '2026-04-10T15:00:00Z', '2026-04-10T15:00:00Z', 'Mwape', 'Chilufya', '+260 97 5001 001', NULL, 'import', 14, 6, 1982, 0, 'standard', 0.00, 0, 'active'),
  ('h0000005-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000005', '2026-04-11T08:00:00Z', '2026-04-11T08:00:00Z', 'Gift', 'Bwalya', '+260 96 5002 002', 'gift.b@email.co.zm', 'import', 30, 3, 1975, 0, 'standard', 0.00, 0, 'active');

-- ============================================================================
-- KNOWLEDGE BASE
-- ============================================================================

-- Tenant 1 (Lusaka Smile Dental)
INSERT INTO knowledge_base (id, tenant_id, created_at, updated_at, category, title, content, is_active, source) VALUES
  ('i0000001-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', '2025-12-10T08:00:00Z', '2026-03-15T10:00:00Z', 'faq', 'What are your opening hours?', 'We are open Monday to Friday 8:00-17:00, Saturday 8:00-13:00. Closed Sundays and public holidays.', true, 'manual'),
  ('i0000001-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', '2025-12-10T08:05:00Z', '2026-03-15T10:05:00Z', 'faq', 'Do you accept walk-ins?', 'Yes, we accept walk-ins during opening hours, though we recommend booking in advance for shorter wait times. Call +260 97 7000 001.', true, 'manual'),
  ('i0000001-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', '2025-12-12T09:00:00Z', '2026-04-01T14:00:00Z', 'price_list', 'General Services Pricing', 'Dental checkup: K350. Teeth cleaning: K500. Teeth whitening: K2,500. Dental implants: from K8,000. Root canal: from K3,500. Crown: from K4,000. These are starting prices — final cost depends on individual assessment.', true, 'manual'),
  ('i0000001-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z', 'service_description', 'Teeth Whitening Service', 'Our professional teeth whitening uses LED-accelerated whitening gel for results up to 8 shades brighter in a single 60-minute session. Results last 6-12 months with proper care.', true, 'ai_extracted'),
  ('i0000001-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', '2026-02-01T08:00:00Z', '2026-02-01T08:00:00Z', 'policy', 'Cancellation Policy', 'We require 24 hours notice for appointment cancellations. Late cancellations or no-shows may incur a K150 fee. Emergency reschedules are exempt.', true, 'manual'),
  ('i0000001-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', '2026-03-01T11:00:00Z', '2026-03-01T11:00:00Z', 'product', 'Dental Implant Package', 'Titanium dental implant with abutment and porcelain crown. Includes consultation, X-ray, implant placement, and 3-month follow-up. 98% success rate. 10-year warranty on implant body.', true, 'ai_extracted');

-- Tenant 2 (Chewe Eats)
INSERT INTO knowledge_base (id, tenant_id, created_at, updated_at, category, title, content, is_active, source) VALUES
  ('i0000002-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', '2026-01-20T09:00:00Z', '2026-04-01T10:00:00Z', 'faq', 'Where do you find the restaurants you review?', 'We visit restaurants across Lusaka — from Kabwata to Woodlands, Kabulonga to Chilenje. We never accept payment for reviews. All opinions are genuine.', true, 'manual'),
  ('i0000002-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', '2026-02-10T08:00:00Z', '2026-04-01T10:05:00Z', 'custom', 'Brand Collaboration Policy', 'We only collaborate with brands that align with authentic Zambian food culture. No paid reviews. All sponsored content is clearly disclosed.', true, 'manual');

-- ============================================================================
-- INVOICES
-- ============================================================================

INSERT INTO invoices (id, tenant_id, created_at, invoice_date, due_date, amount_zmw, status, paid_at, lenco_transaction_id, grace_period_started_at, suspension_triggered_at) VALUES
  -- Tenant 1 — paid invoices
  ('j0000001-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', '2025-12-28T08:00:00Z', '2025-12-28', '2026-01-28', 750.00, 'paid', '2026-01-15T10:30:00Z', 'LENCO-TXN-001234', NULL, NULL),
  ('j0000001-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', '2026-01-28T08:00:00Z', '2026-01-28', '2026-02-28', 750.00, 'paid', '2026-02-20T14:00:00Z', 'LENCO-TXN-002345', NULL, NULL),
  ('j0000001-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', '2026-02-28T08:00:00Z', '2026-02-28', '2026-03-28', 750.00, 'paid', '2026-03-25T09:15:00Z', 'LENCO-TXN-003456', NULL, NULL),
  ('j0000001-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', '2026-03-28T08:00:00Z', '2026-03-28', '2026-04-28', 750.00, 'unpaid', NULL, NULL, NULL, NULL),

  -- Tenant 2 — paid and current
  ('j0000002-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', '2026-01-28T08:00:00Z', '2026-01-28', '2026-02-28', 1500.00, 'paid', '2026-02-10T11:00:00Z', 'LENCO-TXN-004567', NULL, NULL),
  ('j0000002-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', '2026-02-28T08:00:00Z', '2026-02-28', '2026-03-28', 1500.00, 'paid', '2026-03-15T16:30:00Z', 'LENCO-TXN-005678', NULL, NULL),
  ('j0000002-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', '2026-03-28T08:00:00Z', '2026-03-28', '2026-04-28', 1500.00, 'unpaid', NULL, NULL, NULL, NULL),

  -- Tenant 3 — overdue test case
  ('j0000003-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', '2026-02-01T08:00:00Z', '2026-02-01', '2026-03-01', 500.00, 'paid', '2026-02-25T10:00:00Z', 'LENCO-TXN-006789', NULL, NULL),
  ('j0000003-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', '2026-03-01T08:00:00Z', '2026-03-01', '2026-04-01', 500.00, 'overdue', NULL, NULL, '2026-04-02T00:00:00Z', NULL),

  -- Tenant 4 — enterprise, credits
  ('j0000004-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000004', '2026-03-01T08:00:00Z', '2026-03-01', '2026-04-01', 5000.00, 'paid', '2026-03-20T12:00:00Z', 'LENCO-TXN-007890', NULL, NULL);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- Tenant 1
INSERT INTO notifications (id, tenant_id, created_at, type, title, body, read, read_at, action_url, priority) VALUES
  ('k0000001-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', '2026-04-12T06:00:00Z', 'trend_alert', 'Trending: Dental Health Month', 'April is Oral Health Month — trend score 78. Content ideas have been generated.', true, '2026-04-12T07:00:00Z', '/dashboard/trends', 'high'),
  ('k0000001-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', '2026-04-12T06:15:00Z', 'seo_task', 'SEO Task: Blog Post Due Today', 'Your scheduled blog post "Why Regular Dental Checkups Save You Money" is due for completion today.', false, NULL, '/dashboard/seo', 'normal'),
  ('k0000001-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', '2026-04-12T07:00:00Z', 'customer_birthday', 'Upcoming Birthday: Mwansa Banda', 'Mwansa Banda has a birthday in 3 days. A birthday token has been generated.', false, NULL, '/dashboard/customers/h0000001-0000-4000-8000-000000000001', 'high'),
  ('k0000001-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', '2026-04-11T14:00:00Z', 'post_published', 'Blog Post Published', 'Your blog post "The Ultimate Guide to Dental Implants in Zambia" was published successfully.', true, '2026-04-11T15:00:00Z', '/dashboard/content/g0000001-0000-4000-8000-000000000008', 'normal'),
  ('k0000001-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', '2026-04-11T09:00:00Z', 'invoice_reminder', 'Invoice Due in 16 Days', 'Invoice #4 for K750 is due on 28 April 2026.', false, NULL, '/dashboard/billing', 'normal'),
  ('k0000001-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', '2026-04-10T10:05:00Z', 'post_failed', 'Post Failed to Publish', 'Your Easter post failed to publish on Facebook. Click to retry or review.', true, '2026-04-10T14:00:00Z', '/dashboard/content/g0000001-0000-4000-8000-000000000006', 'urgent'),
  ('k0000001-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000001', '2026-04-08T08:00:00Z', 'indexing', 'New Page Indexed', 'Google confirmed indexing of your blog post "The Ultimate Guide to Dental Implants in Zambia".', true, '2026-04-08T09:00:00Z', '/dashboard/seo', 'low'),
  ('k0000001-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000001', '2026-04-05T06:00:00Z', 'health_score', 'Client Health Score: 72', 'Your client health score improved from 68 to 72 this week. SEO and content scores driving the increase.', true, '2026-04-05T08:00:00Z', '/dashboard', 'normal');

-- Tenant 2
INSERT INTO notifications (id, tenant_id, created_at, type, title, body, read, read_at, action_url, priority) VALUES
  ('k0000002-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', '2026-04-12T07:00:00Z', 'trend_alert', 'Trending: #ZambianFood on TikTok', 'Hashtag #ZambianFood is trending with a score of 85. Great opportunity for new content.', false, NULL, '/dashboard/trends', 'high'),
  ('k0000002-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', '2026-04-11T12:00:00Z', 'post_approval', 'Content Awaiting Approval', 'Your ifisashi teaser post is pending approval before scheduling.', false, NULL, '/dashboard/content/g0000002-0000-4000-8000-000000000004', 'normal'),
  ('k0000002-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', '2026-04-10T18:00:00Z', 'post_published', 'Reel Published', 'Your nshima reel was published on Instagram. 8,920 impressions so far!', true, '2026-04-11T08:00:00Z', '/dashboard/content/g0000002-0000-4000-8000-000000000001', 'normal');

-- Tenant 3
INSERT INTO notifications (id, tenant_id, created_at, type, title, body, read, read_at, action_url, priority) VALUES
  ('k0000003-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', '2026-04-12T06:30:00Z', 'invoice_overdue', 'Invoice Overdue', 'Your March invoice of K500 is overdue. Grace period active — please settle to avoid suspension.', false, NULL, '/dashboard/billing', 'urgent'),
  ('k0000003-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', '2026-04-10T08:00:00Z', 'onboarding', 'Complete Your Profile', 'Your completeness score is 42%. Complete your niche profile and brand settings to unlock all features.', false, NULL, '/dashboard/onboarding', 'high');

-- Tenant 4 (MukaPay)
INSERT INTO notifications (id, tenant_id, created_at, type, title, body, read, read_at, action_url, priority) VALUES
  ('k0000004-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000004', '2026-04-12T08:00:00Z', 'loyalty_milestone', 'Milestone: Austin Phiri Reached 500 Credits', 'Austin Phiri has earned 500 loyalty credits — top-tier VIP customer. Consider a personalized reward.', false, NULL, '/dashboard/customers/h0000004-0000-4000-8000-000000000002', 'high'),
  ('k0000004-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000004', '2026-04-12T07:30:00Z', 'beta_reward', 'Beta Tester Bonus Claimed', 'You received 200 credits for reporting 3 critical bugs during the beta program.', true, '2026-04-12T09:00:00Z', '/dashboard/loyalty', 'normal'),
  ('k0000004-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000004', '2026-04-11T14:00:00Z', 'customer_birthday', 'Upcoming Birthday: Natasha Chanda', 'Natasha Chanda has a birthday in 5 days. A birthday token will be generated automatically.', false, NULL, '/dashboard/customers/h0000004-0000-4000-8000-000000000003', 'normal'),
  ('k0000004-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000004', '2026-04-10T10:00:00Z', 'invoice_reminder', 'Invoice Due in 20 Days', 'Invoice #1 for K5,000 is due on 1 May 2026. Credits balance: 12,800 remaining.', false, NULL, '/dashboard/billing', 'normal'),
  ('k0000004-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000004', '2026-04-09T15:00:00Z', 'referral', 'New Referral Signup', 'Webby Mweetwa referred a new user who signed up via QR bridge. 50 credits awarded.', true, '2026-04-09T16:00:00Z', '/dashboard/customers/h0000004-0000-4000-8000-000000000004', 'low');

-- Tenant 5 (Kitwe Auto Spares)
INSERT INTO notifications (id, tenant_id, created_at, type, title, body, read, read_at, action_url, priority) VALUES
  ('k0000005-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000005', '2026-04-10T14:01:00Z', 'onboarding', 'Welcome to Quantum Nexus!', 'Your account has been created. Complete your business profile to get started with content and SEO tools.', false, NULL, '/dashboard/onboarding', 'urgent'),
  ('k0000005-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000005', '2026-04-10T14:05:00Z', 'approval_pending', 'Account Pending Approval', 'Your account is awaiting admin approval. You will be notified once approved — usually within 24 hours.', false, NULL, '/dashboard', 'high'),
  ('k0000005-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000005', '2026-04-11T08:00:00Z', 'loyalty_milestone', 'Pre-launch Bonus: 10 Credits Earned', 'You earned 10 loyalty credits for importing your contacts during the pre-launch period.', true, '2026-04-11T10:00:00Z', '/dashboard/loyalty', 'normal');
