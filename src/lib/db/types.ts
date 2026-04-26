/**
 * Database Row Types
 * @module db/types
 * @description TypeScript interfaces representing exact row shapes for all 23
 * database tables. Derived 1:1 from migration SQL schemas.
 * Used as generic parameters on Supabase client .from<T>() calls.
 */

// ─── Platform-level tables (no tenant_id, no RLS) ──────────────────

export interface ResellerRow {
  id: string;
  created_at: string;
  brand_name: string;
  brand_logo_url: string | null;
  brand_primary_color: string | null;
  brand_secondary_color: string | null;
  status: 'active' | 'suspended';
  admin_user_id: string;
}

export interface TenantRow {
  id: string;
  created_at: string;
  updated_at: string;
  business_name: string;
  slug: string;
  user_type: 'business' | 'ugc_creator' | 'faceless_creator' | 'app_developer';
  tier: 'basic' | 'growth' | 'pro' | 'enterprise' | 'internal';
  billing_type: 'paid' | 'internal' | 'credits';
  monthly_credit_allowance: number;
  credits_used_this_month: number;
  credit_granted_by: string | null;
  status: 'pending_approval' | 'active' | 'grace_period' | 'suspended' | 'archived' | 'rejected';
  activated_at: string | null;
  suspended_at: string | null;
  archived_at: string | null;
  rejection_reason: string | null;
  sprint_mode_active: boolean;
  sprint_mode_ends_at: string | null;
  reseller_id: string | null;
  completeness_score: number;
  content_generation_unlocked: boolean;
  publishing_unlocked: boolean;
  analytics_unlocked: boolean;
  initial_audit_complete: boolean;
  admin_approved_by: string | null;
  admin_approved_at: string | null;
  admin_notes: string | null;
}

export interface PlatformUserRow {
  id: string;
  auth_user_id: string;
  tenant_id: string | null;
  reseller_id: string | null;
  role: 'business_owner' | 'ugc_creator' | 'faceless_creator' | 'app_developer' | 'agency_admin' | 'sub_admin' | 'super_admin';
  permissions: Record<string, unknown>;
  created_at: string;
  last_seen_at: string | null;
}

export interface NicheProfileRow {
  id: string;
  created_at: string;
  updated_at: string;
  niche_name: string;
  status: 'pending_review' | 'active' | 'deprecated';
  approved_by: string | null;
  approved_at: string | null;
  primary_keywords: string[];
  content_formats: string[];
  tone: string;
  platforms: string[];
  target_audience: string;
  posting_frequency: Record<string, number>;
  regulatory_flags: string[];
  content_restrictions: string[];
  seo_keyword_clusters: Array<{ cluster: string; keywords: string[] }>;
  competitor_domains: string[];
}

export interface DeadJobRow {
  id: string;
  tenant_id: string | null;
  failed_at: string;
  queue_name: string;
  job_type: string;
  job_data: Record<string, unknown> | null;
  error_message: string;
  attempts: number;
  bullmq_job_id: string;
  reviewed: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_notes: string | null;
}

// ─── Tenant-scoped tables (with RLS) ───────────────────────────────

export interface EncryptedKeyRow {
  id: string;
  tenant_id: string;
  key_name: string;
  encrypted_value: string;
  iv: string;
  auth_tag: string;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export interface BusinessProfileRow {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  niche: string;
  niche_profile_id: string | null;
  location: string;
  website_url: string | null;
  phone_number: string | null;
  logo_url: string | null;
  brand_primary_color: string | null;
  brand_secondary_color: string | null;
  brand_voice_tone: string;
  content_language: string;
  fallback_message: string;
  keyword_blocklist: string[];
  preferred_formats: string[];
  posting_schedule: Record<string, unknown>;
  twilio_phone_number: string | null;
  birthday_auto_send: boolean | null;
  birthday_days_before: number | null;
  birthday_offer_template: string | null;
  notification_preferences: Record<string, unknown> | null;
  retention_config: Record<string, unknown> | null;
}

export interface ContentPostRow {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  content_type: 'social_post' | 'blog_post' | 'email' | 'whatsapp_broadcast' | 'sms' | 'gbp_post' | 'youtube_video' | 'reel' | 'tiktok' | 'pinterest_pin' | 'reddit_post' | 'linkedin_post';
  platform: string | null;
  caption: string | null;
  media_url: string | null;
  media_type: 'image' | 'video' | 'carousel' | 'document' | null;
  blog_content: string | null;
  email_subject: string | null;
  target_keyword: string | null;
  meta_description: string | null;
  internal_links: string[];
  is_refreshed: boolean;
  original_post_id: string | null;
  recycled_from_id: string | null;
  status: 'draft' | 'pending_safety' | 'pending_approval' | 'approved' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'held' | 'cancelled';
  scheduled_for: string | null;
  published_at: string | null;
  algorithm_score: number | null;
  algorithm_score_breakdown: Record<string, number> | null;
  safety_check_result: 'pass' | 'fail' | null;
  safety_check_reason: string | null;
  impressions: number;
  reach: number;
  engagement: number;
  engagement_rate: number | null;
  clicks: number;
  saves: number;
  shares: number;
  comments: number;
  trend_id: string | null;
  trend_phrase: string | null;
}

export interface CustomerRow {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string | null;
  phone_number: string;
  email: string | null;
  source: 'qr_bridge' | 'manual' | 'call' | 'whatsapp' | 'social' | 'import' | null;
  birth_day: number | null;
  birth_month: number | null;
  birth_year: number | null;
  loyalty_points: number;
  tier: 'standard' | 'priority' | 'vip';
  total_spend: number;
  visit_count: number;
  status: 'active' | 'inactive' | 'blocked';
}

export interface SeoTaskRow {
  id: string;
  tenant_id: string;
  created_at: string;
  task_date: string;
  task_type: 'blog_post' | 'qa_seed' | 'directory_submission' | 'content_refresh' | 'indexing_request' | 'backlink_outreach';
  status: 'pending' | 'in_progress' | 'awaiting_confirmation' | 'complete' | 'skipped';
  question_text: string | null;
  answer_text: string | null;
  platform: string | null;
  question_posted_at: string | null;
  answer_posted_at: string | null;
  content_post_id: string | null;
  target_keyword: string | null;
  completed_at: string | null;
}

export interface IndexedPageRow {
  id: string;
  tenant_id: string;
  indexed_at: string;
  page_url: string;
  page_type: 'blog_post' | 'landing_page' | 'product_page' | 'qa_answer' | 'other' | null;
  target_keyword: string | null;
  gsc_confirmed: boolean;
}

export interface TrendRow {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  trend_type: 'keyword' | 'phrase' | 'hashtag' | 'sound' | 'format' | 'topic';
  trend_text: string;
  platform: string | null;
  score: number;
  status: 'NEW' | 'ACTIVE' | 'AGING' | 'EXPIRED';
  detected_at: string;
  expired_at: string | null;
  expiry_reason: string | null;
  times_used_in_content: number;
  last_used_at: string | null;
}

export interface BusinessAuditRow {
  id: string;
  tenant_id: string;
  created_at: string;
  audit_type: 'initial' | 'monthly_refresh' | 'on_demand';
  domain_authority: number | null;
  total_indexed_pages: number | null;
  backlink_count: number | null;
  gsc_impressions_90d: number | null;
  gsc_clicks_90d: number | null;
  gbp_completeness: number | null;
  review_count: number | null;
  average_rating: number | null;
  social_presence: Record<string, unknown>;
  competitor_data: Array<Record<string, unknown>>;
  recommended_priority: string[] | null;
  summary: string | null;
}

export interface ReputationVelocityRow {
  id: string;
  tenant_id: string;
  week_start: string;
  new_backlinks: number;
  new_indexed_pages: number;
  new_reviews: number;
  net_new_followers: number;
  gsc_impressions_growth: number;
  velocity_score: number;
  velocity_trend: 'improving' | 'stable' | 'declining' | null;
  created_at: string;
}

export interface ClientHealthScoreRow {
  id: string;
  tenant_id: string;
  score_date: string;
  seo_score: number;
  content_score: number;
  review_score: number;
  social_score: number;
  entity_score: number;
  retention_score: number;
  total_score: number;
  trend: 'improving' | 'stable' | 'declining' | null;
  top_recommendations: string[];
  created_at: string;
}

export interface EntityListingRow {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  directory_name: string;
  directory_url: string | null;
  listing_url: string | null;
  status: 'pending' | 'submitted' | 'live' | 'inconsistent' | 'rejected';
  submitted_name: string;
  submitted_address: string | null;
  submitted_phone: string | null;
  submitted_website: string | null;
  last_checked_at: string | null;
  is_consistent: boolean | null;
  inconsistency_notes: string | null;
}

export interface CannibalisationReportRow {
  id: string;
  tenant_id: string;
  detected_at: string;
  conflicting_keyword: string;
  strong_post_id: string | null;
  weak_post_id: string | null;
  strong_post_url: string | null;
  weak_post_url: string | null;
  recommended_action: 'consolidate' | 'redirect';
  status: 'pending' | 'approved' | 'dismissed';
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface AnalyticsSnapshotRow {
  id: string;
  tenant_id: string;
  snapshot_at: string;
  revenue_today: number;
  revenue_this_week: number;
  revenue_this_month: number;
  posts_published_today: number;
  posts_scheduled_24h: number;
  total_indexed_pages: number;
  pages_indexed_today: number;
  new_customers_today: number;
  upcoming_birthdays_7d: number;
  tasks_today_total: number;
  tasks_today_complete: number;
  latest_health_score: number;
  health_trend: string | null;
  latest_velocity_score: number;
}

export interface InvoiceRow {
  id: string;
  tenant_id: string;
  created_at: string;
  invoice_date: string;
  due_date: string;
  amount_zmw: number;
  status: 'unpaid' | 'paid' | 'grace_period' | 'overdue' | 'written_off';
  paid_at: string | null;
  lenco_transaction_id: string | null;
  grace_period_started_at: string | null;
  suspension_triggered_at: string | null;
}

export interface NotificationRow {
  id: string;
  tenant_id: string;
  created_at: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  read_at: string | null;
  action_url: string | null;
  priority: 'urgent' | 'high' | 'normal' | 'low';
}

export interface LoyaltyTransactionRow {
  id: string;
  tenant_id: string;
  customer_id: string;
  created_at: string;
  type: 'earn' | 'redeem' | 'expire' | 'adjustment';
  points: number;
  balance_after: number;
  description: string | null;
  reference_id: string | null;
}

export interface BirthdayTokenRow {
  id: string;
  tenant_id: string;
  customer_id: string;
  created_at: string;
  token: string;
  birth_year_this_run: number;
  offer_description: string;
  expires_at: string;
  redeemed: boolean;
  redeemed_at: string | null;
  redeemed_by_staff: string | null;
}

export interface KnowledgeBaseRow {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  category: 'faq' | 'price_list' | 'service_description' | 'product' | 'policy' | 'custom';
  title: string;
  content: string;
  is_active: boolean;
  source: 'manual' | 'document_upload' | 'ai_extracted' | null;
}
