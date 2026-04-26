-- ============================================================================
-- QUANTUM NEXUS — Seed: Platform-Level Tables
-- Phase: 2 (Mock Data Layer)
-- Terminal: 4 (Database)
--
-- Covers: resellers, tenants, platform_users, niche_profiles, encrypted_keys
-- All UUIDs are fixed for cross-seed referential integrity.
-- ============================================================================

-- ============================================================================
-- RESELLERS
-- ============================================================================

INSERT INTO resellers (id, created_at, brand_name, brand_logo_url, brand_primary_color, brand_secondary_color, status, admin_user_id) VALUES
  ('a0000000-0000-4000-8000-000000000001', '2025-11-01T08:00:00Z', 'Zambia Digital Agency', 'https://r2.quantumnexus.io/logos/zda-logo.png', '#1E40AF', '#3B82F6', 'active', 'a0000000-0000-4000-8000-000000000101');

-- ============================================================================
-- TENANTS
-- ============================================================================

-- Tenant 1: Business owner — Lusaka dental clinic
INSERT INTO tenants (
  id, created_at, updated_at,
  business_name, slug, user_type,
  tier, billing_type, monthly_credit_allowance, credits_used_this_month,
  status, activated_at,
  sprint_mode_active, sprint_mode_ends_at,
  reseller_id,
  completeness_score,
  content_generation_unlocked, publishing_unlocked, analytics_unlocked,
  initial_audit_complete,
  admin_approved_by, admin_approved_at, admin_notes
) VALUES (
  'b0000000-0000-4000-8000-000000000001',
  '2025-12-01T06:00:00Z', '2026-04-10T14:30:00Z',
  'Lusaka Smile Dental Clinic', 'lusaka-smile-dental', 'business',
  'growth', 'paid', 5000, 2340,
  'active', '2025-12-05T10:00:00Z',
  true, '2026-06-01T00:00:00Z',
  'a0000000-0000-4000-8000-000000000001',
  78,
  true, true, true,
  true,
  'a0000000-0000-4000-8000-000000000101', '2025-12-05T10:00:00Z', 'Approved — strong niche, complete profile'
);

-- Tenant 2: UGC Creator — food & lifestyle content
INSERT INTO tenants (
  id, created_at, updated_at,
  business_name, slug, user_type,
  tier, billing_type, monthly_credit_allowance, credits_used_this_month,
  status, activated_at,
  sprint_mode_active, sprint_mode_ends_at,
  reseller_id,
  completeness_score,
  content_generation_unlocked, publishing_unlocked, analytics_unlocked,
  initial_audit_complete,
  admin_approved_by, admin_approved_at, admin_notes
) VALUES (
  'b0000000-0000-4000-8000-000000000002',
  '2026-01-15T09:00:00Z', '2026-04-12T08:15:00Z',
  'Chewe Eats', 'chewe-eats', 'ugc_creator',
  'pro', 'paid', 10000, 6120,
  'active', '2026-01-18T12:00:00Z',
  true, '2026-07-01T00:00:00Z',
  NULL,
  85,
  true, true, true,
  true,
  'a0000000-0000-4000-8000-000000000101', '2026-01-18T12:00:00Z', 'UGC Pro — strong engagement history'
);

-- Tenant 3: Faceless Channel Creator — finance education
INSERT INTO tenants (
  id, created_at, updated_at,
  business_name, slug, user_type,
  tier, billing_type, monthly_credit_allowance, credits_used_this_month,
  status, activated_at,
  sprint_mode_active, sprint_mode_ends_at,
  reseller_id,
  completeness_score,
  content_generation_unlocked, publishing_unlocked, analytics_unlocked,
  initial_audit_complete,
  admin_approved_by, admin_approved_at, admin_notes
) VALUES (
  'b0000000-0000-4000-8000-000000000003',
  '2026-02-01T07:00:00Z', '2026-04-11T20:00:00Z',
  'ZedFinance', 'zedfinance', 'faceless_creator',
  'basic', 'paid', 2000, 890,
  'active', '2026-02-05T11:00:00Z',
  true, '2026-05-01T00:00:00Z',
  NULL,
  42,
  true, false, false,
  false,
  'a0000000-0000-4000-8000-000000000101', '2026-02-05T11:00:00Z', 'New faceless creator — onboarding in progress'
);

-- Tenant 4: App Developer
INSERT INTO tenants (
  id, created_at, updated_at,
  business_name, slug, user_type,
  tier, billing_type, monthly_credit_allowance, credits_used_this_month,
  status, activated_at,
  sprint_mode_active, sprint_mode_ends_at,
  reseller_id,
  completeness_score,
  content_generation_unlocked, publishing_unlocked, analytics_unlocked,
  initial_audit_complete,
  admin_approved_by, admin_approved_at, admin_notes
) VALUES (
  'b0000000-0000-4000-8000-000000000004',
  '2026-03-01T10:00:00Z', '2026-04-12T06:45:00Z',
  'MukaPay', 'mukapay', 'app_developer',
  'enterprise', 'credits', 50000, 12800,
  'active', '2026-03-03T09:00:00Z',
  false, NULL,
  'a0000000-0000-4000-8000-000000000001',
  91,
  true, true, true,
  true,
  'a0000000-0000-4000-8000-000000000101', '2026-03-03T09:00:00Z', 'Enterprise app dev — fintech niche'
);

-- Tenant 5: Pending approval (tests admin gate)
INSERT INTO tenants (
  id, created_at, updated_at,
  business_name, slug, user_type,
  tier, billing_type,
  status
) VALUES (
  'b0000000-0000-4000-8000-000000000005',
  '2026-04-10T14:00:00Z', '2026-04-10T14:00:00Z',
  'Kitwe Auto Spares', 'kitwe-auto-spares', 'business',
  'basic', 'paid',
  'pending_approval'
);

-- ============================================================================
-- PLATFORM USERS
-- ============================================================================

-- Super admin
INSERT INTO platform_users (id, auth_user_id, tenant_id, reseller_id, role, permissions, created_at, last_seen_at) VALUES
  ('c0000000-0000-4000-8000-000000000001', '11111111-1111-4000-8000-111111111111', NULL, NULL, 'super_admin', '{"all": true}', '2025-10-01T08:00:00Z', '2026-04-12T07:30:00Z');

-- Agency admin for Zambia Digital Agency
INSERT INTO platform_users (id, auth_user_id, tenant_id, reseller_id, role, permissions, created_at, last_seen_at) VALUES
  ('c0000000-0000-4000-8000-000000000002', '22222222-2222-4000-8000-222222222222', NULL, 'a0000000-0000-4000-8000-000000000001', 'agency_admin', '{"manage_clients": true, "billing": true}', '2025-11-01T08:00:00Z', '2026-04-12T06:00:00Z');

-- Business owner — Lusaka Smile Dental
INSERT INTO platform_users (id, auth_user_id, tenant_id, reseller_id, role, permissions, created_at, last_seen_at) VALUES
  ('c0000000-0000-4000-8000-000000000003', '33333333-3333-4000-8000-333333333333', 'b0000000-0000-4000-8000-000000000001', NULL, 'business_owner', '{"content": true, "seo": true, "social": true, "calls": true}', '2025-12-01T06:00:00Z', '2026-04-12T09:15:00Z');

-- Sub-admin — Lusaka Smile Dental (receptionist)
INSERT INTO platform_users (id, auth_user_id, tenant_id, reseller_id, role, permissions, created_at, last_seen_at) VALUES
  ('c0000000-0000-4000-8000-000000000004', '44444444-4444-4000-8000-444444444444', 'b0000000-0000-4000-8000-000000000001', NULL, 'sub_admin', '{"content": true, "customers": true}', '2025-12-15T10:00:00Z', '2026-04-11T16:30:00Z');

-- UGC Creator — Chewe Eats
INSERT INTO platform_users (id, auth_user_id, tenant_id, reseller_id, role, permissions, created_at, last_seen_at) VALUES
  ('c0000000-0000-4000-8000-000000000005', '55555555-5555-4000-8000-555555555555', 'b0000000-0000-4000-8000-000000000002', NULL, 'ugc_creator', '{"ugc": true, "social": true, "analytics": true}', '2026-01-15T09:00:00Z', '2026-04-12T08:45:00Z');

-- Faceless Creator — ZedFinance
INSERT INTO platform_users (id, auth_user_id, tenant_id, reseller_id, role, permissions, created_at, last_seen_at) VALUES
  ('c0000000-0000-4000-8000-000000000006', '66666666-6666-4000-8000-666666666666', 'b0000000-0000-4000-8000-000000000003', NULL, 'faceless_creator', '{"faceless": true, "voice": true, "video": true}', '2026-02-01T07:00:00Z', '2026-04-12T05:10:00Z');

-- App Developer — MukaPay
INSERT INTO platform_users (id, auth_user_id, tenant_id, reseller_id, role, permissions, created_at, last_seen_at) VALUES
  ('c0000000-0000-4000-8000-000000000007', '77777777-7777-4000-8000-777777777777', 'b0000000-0000-4000-8000-000000000004', NULL, 'app_developer', '{"app_store": true, "analytics": true, "content": true}', '2026-03-01T10:00:00Z', '2026-04-12T07:00:00Z');

-- ============================================================================
-- NICHE PROFILES
-- ============================================================================

INSERT INTO niche_profiles (id, created_at, updated_at, niche_name, status, approved_by, approved_at, primary_keywords, content_formats, tone, platforms, target_audience, posting_frequency, regulatory_flags, content_restrictions, seo_keyword_clusters, competitor_domains) VALUES
  (
    'd0000000-0000-4000-8000-000000000001',
    '2025-11-15T08:00:00Z', '2026-03-20T12:00:00Z',
    'dental_care_zambia', 'active',
    'c0000000-0000-4000-8000-000000000001', '2025-11-16T09:00:00Z',
    '{"dental clinic lusaka", "teeth whitening zambia", "dentist near me lusaka", "dental implants zambia", "root canal lusaka"}',
    '{"blog_post", "social_post", "gbp_post", "qa_answer"}',
    'professional yet warm',
    '{"facebook", "instagram", "google_business"}',
    'Adults 25-55 in Lusaka seeking dental services, parents looking for paediatric dental care',
    '{"blog": "3_per_week", "social": "5_per_week", "gbp": "1_per_week", "qa": "2_per_week"}',
    '{"medical_disclaimer_required"}',
    '{"no_price_guarantees", "no_before_after_photos_without_consent"}',
    '[{"cluster": "general_dentistry", "keywords": ["dentist lusaka", "dental checkup zambia"]}, {"cluster": "cosmetic_dentistry", "keywords": ["teeth whitening lusaka", "veneers zambia"]}, {"cluster": "emergency_dental", "keywords": ["emergency dentist lusaka", "toothache relief zambia"]}]',
    '{"lusakadental.com", "zambiasmile.co.zm", "dentalcarezambia.com"}'
  ),
  (
    'd0000000-0000-4000-8000-000000000002',
    '2026-01-10T10:00:00Z', '2026-04-01T15:00:00Z',
    'food_lifestyle_zambia', 'active',
    'c0000000-0000-4000-8000-000000000001', '2026-01-11T08:00:00Z',
    '{"zambian food", "lusaka restaurants", "local cuisine zambia", "food review lusaka", "zambian recipes"}',
    '{"reel", "tiktok", "social_post", "blog_post"}',
    'energetic and relatable',
    '{"instagram", "tiktok", "youtube", "facebook"}',
    'Young adults 18-35 in Lusaka interested in food culture and local dining',
    '{"reel": "4_per_week", "tiktok": "5_per_week", "social": "3_per_week", "blog": "1_per_week"}',
    '{"food_safety_disclaimer"}',
    '{"no_unverified_health_claims"}',
    '[{"cluster": "local_restaurants", "keywords": ["lusaka restaurants", "best food lusaka"]}, {"cluster": "zambian_recipes", "keywords": ["zambian dishes", "nshima recipe", "ifisashi"]}]',
    '{"zambianfoodie.co.zm", "lusakaeats.com"}'
  ),
  (
    'd0000000-0000-4000-8000-000000000003',
    '2026-02-01T08:00:00Z', '2026-03-15T11:00:00Z',
    'personal_finance_zambia', 'active',
    'c0000000-0000-4000-8000-000000000001', '2026-02-02T09:00:00Z',
    '{"personal finance zambia", "saving tips zambia", "investing in zambia", "financial literacy lusaka"}',
    '{"youtube_video", "tiktok", "blog_post", "social_post"}',
    'calm and educational',
    '{"youtube", "tiktok", "instagram", "facebook"}',
    'Young professionals 22-40 across Zambia seeking financial education',
    '{"youtube": "2_per_week", "tiktok": "3_per_week", "blog": "2_per_week", "social": "4_per_week"}',
    '{"financial_disclaimer_required"}',
    '{"no_specific_investment_recommendations", "no_guaranteed_returns"}',
    '[{"cluster": "savings_basics", "keywords": ["saving money zambia", "budget tips"]}, {"cluster": "investing", "keywords": ["investing zambia", "stock market lusaka"]}]',
    '{"zambianfinance.co.zm", "moneytalkszambia.com"}'
  ),
  (
    'd0000000-0000-4000-8000-000000000004',
    '2026-02-20T09:00:00Z', '2026-04-08T13:00:00Z',
    'fintech_app_zambia', 'active',
    'c0000000-0000-4000-8000-000000000001', '2026-02-21T10:00:00Z',
    '{"mobile money zambia", "fintech app lusaka", "digital payments zambia", "mobile banking zambia", "send money zambia"}',
    '{"blog_post", "social_post", "app_store_listing", "email"}',
    'modern and trustworthy',
    '{"facebook", "instagram", "linkedin", "google_play"}',
    'Tech-savvy professionals 22-45 across Zambia seeking digital payment solutions and financial tools',
    '{"blog": "2_per_week", "social": "4_per_week", "email": "1_per_week", "app_store": "1_per_month"}',
    '{"financial_disclaimer_required", "bank_of_zambia_compliance"}',
    '{"no_interest_rate_claims", "no_guaranteed_transaction_speeds", "no_comparison_to_specific_banks"}',
    '[{"cluster": "mobile_payments", "keywords": ["mobile money zambia", "digital wallet lusaka", "cashless payments zambia"], "difficulty": 62, "volume": 3400}, {"cluster": "app_marketing", "keywords": ["fintech app zambia", "payment app lusaka", "best money app zambia"], "difficulty": 48, "volume": 2100}, {"cluster": "financial_tools", "keywords": ["budget app zambia", "expense tracker lusaka", "savings calculator zambia"], "difficulty": 35, "volume": 1200}]',
    '{"zamswitch.co.zm", "cellulant.co.zm", "kazang.com"}'
  ),
  (
    'd0000000-0000-4000-8000-000000000005',
    '2026-04-11T08:00:00Z', '2026-04-11T08:00:00Z',
    'auto_parts_copperbelt', 'pending_review',
    NULL, NULL,
    '{"auto spares kitwe", "car parts zambia", "toyota parts copperbelt", "engine parts lusaka", "second hand spares zambia"}',
    '{"social_post", "gbp_post", "blog_post"}',
    'helpful and straightforward',
    '{"facebook", "google_business", "whatsapp"}',
    'Vehicle owners and mechanics 25-60 on the Copperbelt and Lusaka seeking affordable auto parts',
    '{"social": "3_per_week", "gbp": "1_per_week", "blog": "1_per_week"}',
    '{"product_warranty_disclaimer"}',
    '{"no_fitting_guarantees", "no_safety_critical_claims"}',
    '[{"cluster": "toyota_parts", "keywords": ["toyota parts zambia", "corolla spares kitwe", "hilux parts copperbelt"], "difficulty": 41, "volume": 1800}, {"cluster": "general_spares", "keywords": ["auto spares kitwe", "car parts zambia", "engine parts lusaka"], "difficulty": 55, "volume": 2900}, {"cluster": "brakes_suspension", "keywords": ["brake pads zambia", "shock absorbers kitwe", "suspension parts copperbelt"], "difficulty": 38, "volume": 950}]',
    '{"autoworldzambia.com", "spareparts.co.zm", "japancarszambia.com"}'
  );

-- ============================================================================
-- ENCRYPTED KEYS
-- ============================================================================

-- Mock encrypted keys — values are placeholder hex strings, not real credentials
INSERT INTO encrypted_keys (id, tenant_id, key_name, key_type, encrypted_value, iv, auth_tag, created_at, updated_at, expires_at) VALUES
  ('e0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'meta_access_token', 'oauth_token', 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', '0123456789abcdef01234567', 'f1e2d3c4b5a6f1e2d3c4b5a6', '2025-12-10T08:00:00Z', '2026-04-10T08:00:00Z', '2026-07-10T08:00:00Z'),
  ('e0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'google_search_console_token', 'oauth_token', 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3', '123456789abcdef0123456789', 'e2d3c4b5a6f1e2d3c4b5a6f1', '2025-12-10T08:05:00Z', '2026-04-10T08:05:00Z', '2026-07-10T08:05:00Z'),
  ('e0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'twilio_auth_token', 'api_key', 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', '23456789abcdef01234567890', 'd3c4b5a6f1e2d3c4b5a6f1e2', '2025-12-12T10:00:00Z', '2026-04-10T10:00:00Z', NULL),
  ('e0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000002', 'meta_access_token', 'oauth_token', 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5', '3456789abcdef012345678901', 'c4b5a6f1e2d3c4b5a6f1e2d3', '2026-01-20T09:00:00Z', '2026-04-10T09:00:00Z', '2026-07-20T09:00:00Z'),
  ('e0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000002', 'tiktok_access_token', 'oauth_token', 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6', '456789abcdef0123456789012', 'b5a6f1e2d3c4b5a6f1e2d3c4', '2026-01-20T09:05:00Z', '2026-04-10T09:05:00Z', '2026-07-20T09:05:00Z'),
  ('e0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000004', 'google_play_developer_key', 'api_key', 'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1', '56789abcdef01234567890123', 'a6f1e2d3c4b5a6f1e2d3c4b5', '2026-03-05T11:00:00Z', '2026-04-10T11:00:00Z', NULL);
