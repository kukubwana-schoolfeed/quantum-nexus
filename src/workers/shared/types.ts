/**
 * Shared type definitions for all BullMQ workers.
 * Every job payload must include tenant_id for multi-tenant isolation.
 * Job results follow a standard envelope for consistent dead-queue inspection.
 */

import { Job } from 'bullmq';

// ─── Base Payload ──────────────────────────────────────────────

/** Every job payload must extend this base. tenant_id is always required. */
export interface BaseJobPayload {
  tenant_id: string;
}

/** Standard result envelope for all job completions. */
export interface JobResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  tenant_id: string;
  job_type: string;
  timestamp: string;
}

// ─── Worker 1 — Content Generation Payloads ─────────────────────

export interface ContentWritingPayload extends BaseJobPayload {
  content_type: 'blog_post' | 'caption' | 'script' | 'email';
  target_platform: string;
  niche_profile_id: string;
  keywords?: string[];
  trend_data?: Record<string, unknown>;
}

export interface VoiceGenerationPayload extends BaseJobPayload {
  voice_id: string;
  text: string;
  purpose: 'call_response' | 'faceless_character';
}

export interface VideoCompositionPayload extends BaseJobPayload {
  template_id: string;
  scenes: Array<{ id: string; duration: number }>;
  output_format: '9:16' | '16:9' | '1:1';
}

export interface ImageGenerationPayload extends BaseJobPayload {
  prompt: string;
  size: string;
  purpose: 'blog_post' | 'pinterest_pin' | 'thumbnail';
}

export interface WhisperTranscriptionPayload extends BaseJobPayload {
  media_url: string;
  language?: string;
}

export interface AlgorithmScoringPayload extends BaseJobPayload {
  content_id: string;
  target_platform: 'tiktok' | 'youtube' | 'instagram' | 'facebook' | 'linkedin';
  content_text: string;
}

export interface ContentSafetyCheckPayload extends BaseJobPayload {
  content_id: string;
  content_text: string;
  content_type: string;
}

export interface InspirationAnalysisPayload extends BaseJobPayload {
  file_url: string;
  file_type: 'video' | 'image' | 'pdf';
}

export interface ContentRecyclingPayload extends BaseJobPayload {
  original_content_id: string;
  target_format: string;
  target_platform: string;
}

export interface SeoBlogGenerationPayload extends BaseJobPayload {
  keyword: string;
  niche_profile_id: string;
}

export interface LeadMagnetGenerationPayload extends BaseJobPayload {
  topic: string;
  format: 'pdf' | 'checklist' | 'template';
  niche_profile_id: string;
}

// ─── Worker 2 — Social Publishing Payloads ──────────────────────

export interface SocialPostingPayload extends BaseJobPayload {
  platform: 'meta' | 'tiktok' | 'linkedin' | 'youtube' | 'pinterest' | 'reddit';
  content_id: string;
  post_text: string;
  media_urls?: string[];
  scheduled_for?: string;
}

export interface OAuthTokenValidationPayload extends BaseJobPayload {
  platform: string;
  account_id: string;
}

export interface OAuthTokenRefreshPayload extends BaseJobPayload {
  platform: string;
  account_id: string;
}

export interface TokenExpiryAlertPayload extends BaseJobPayload {
  platform: string;
  account_id: string;
  hours_until_expiry: number;
}

export interface HeldPostsManagementPayload extends BaseJobPayload {
  held_post_id: string;
  action: 'retry' | 'hold' | 'cancel';
}

export interface GbpPostingPayload extends BaseJobPayload {
  location_id: string;
  content_id: string;
  post_text: string;
  media_url?: string;
}

export interface WhatsAppBroadcastPayload extends BaseJobPayload {
  contact_list_id: string;
  message_template_id: string;
}

export interface SmsDeliveryPayload extends BaseJobPayload {
  to: string;
  message: string;
}

export interface EmailDeliveryPayload extends BaseJobPayload {
  to: string;
  subject: string;
  template_id: string;
  template_data?: Record<string, unknown>;
}

export interface AccountWarmupPayload extends BaseJobPayload {
  platform: string;
  account_id: string;
  days_since_connection: number;
}

export interface QaPostingPayload extends BaseJobPayload {
  platform: 'quora' | 'reddit';
  question_id: string;
  answer_text: string;
}

export interface DirectorySubmissionPayload extends BaseJobPayload {
  directory: string;
  business_name: string;
  business_data: Record<string, unknown>;
}

export interface AppReviewReplyPayload extends BaseJobPayload {
  store: 'google_play' | 'app_store';
  review_id: string;
  reply_text: string;
}

export interface BirthdayTokenGenerationPayload extends BaseJobPayload {
  days_ahead?: number; // Lookahead window in days (default 7)
  channels?: ('sms' | 'whatsapp')[]; // Delivery channels for birthday message
}

export interface LoyaltyTransactionSyncPayload extends BaseJobPayload {
  customer_id?: string; // If omitted, syncs all active customers
  points_delta?: number; // Points to adjust (for manual adjustments)
  reason?: string; // Description for the transaction
}

export interface NotificationDeliveryPayload extends BaseJobPayload {
  notification_id: string; // ID of the notification row to deliver
  channels: ('in_app' | 'sms' | 'whatsapp' | 'email')[];
}

// ─── Worker 3 — AI Scene Generation Payloads ───────────────────

export interface RunwayVideoGenerationPayload extends BaseJobPayload {
  scene_description: string;
  style: string;
  duration_seconds: number;
}

// ─── Worker 4 — Analytics and SEO Payloads ─────────────────────

export interface GscApiPullPayload extends BaseJobPayload {
  site_url: string;
  data_type: 'rankings' | 'indexing_status' | 'crawl_errors';
  date_range: { start: string; end: string };
}

export interface Ga4DataPullPayload extends BaseJobPayload {
  property_id: string;
  metrics: string[];
  date_range: { start: string; end: string };
}

export interface CompetitorRankTrackingPayload extends BaseJobPayload {
  keywords: string[];
  competitor_domains: string[];
}

export interface SocialAnalyticsPullPayload extends BaseJobPayload {
  platform: string;
  account_id: string;
  metrics: string[];
  date_range: { start: string; end: string };
}

export interface GbpInsightsPullPayload extends BaseJobPayload {
  location_id: string;
  date_range: { start: string; end: string };
}

export interface DashboardAggregationPayload extends BaseJobPayload {
  aggregation_type: 'mission_control' | 'daily_snapshot' | 'weekly_snapshot';
}

export interface SitemapSubmissionPayload extends BaseJobPayload {
  sitemap_url: string;
}

export interface PageIndexingRequestPayload extends BaseJobPayload {
  page_url: string;
}

export interface NicheResearchPayload extends BaseJobPayload {
  niche: string;
  location: string;
}

export interface DailyReportGenerationPayload extends BaseJobPayload {
  report_date: string;
  channels: ('in_app' | 'whatsapp' | 'email')[];
}

export interface LencoPaymentCheckPayload extends BaseJobPayload {
  invoice_id: string;
}

export interface BusinessAuditPayload extends BaseJobPayload {
  audit_type: 'initial' | 'monthly_refresh';
}

export interface TrendScanningPayload extends BaseJobPayload {
  niche: string;
}

export interface TrendExpiryCheckPayload extends BaseJobPayload {
  // No extra fields — scans all active trends for tenant
}

export interface ReputationVelocityUpdatePayload extends BaseJobPayload {
  // Weekly update — scans all reputation metrics
}

export interface ClientHealthScoreUpdatePayload extends BaseJobPayload {
  // Daily update — recalculates composite score
}

export interface KeywordCannibalisationScanPayload extends BaseJobPayload {
  // Monthly scan — checks all tracked keywords
}

export interface EntityConsistencyCheckPayload extends BaseJobPayload {
  // Monthly check — verifies entity data consistency
}

export interface ContentRefreshPayload extends BaseJobPayload {
  content_id?: string; // If omitted, refreshes all posts older than 6 months
}

export interface SprintModeEndCheckPayload extends BaseJobPayload {
  // Daily check — disables sprint on day 31
}

export interface AppRevenueSyncPayload extends BaseJobPayload {
  app_id: string;
}

export interface AsoRankCheckPayload extends BaseJobPayload {
  app_id: string;
  store: 'google_play' | 'app_store';
}

export interface AppReviewMonitoringPayload extends BaseJobPayload {
  app_id: string;
}

export interface KeyRotationPayload extends BaseJobPayload {
  // No extra fields — iterates all rotatable keys across all tenants
}

// ─── Job Processor Type ─────────────────────────────────────────

/** Type-safe job processor function signature. */
export type JobProcessor<T extends BaseJobPayload> = (
  job: Job<T>
) => Promise<JobResult<unknown>>;
