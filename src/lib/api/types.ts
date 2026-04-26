/**
 * Shared API Types
 * @module api/types
 * @description Type definitions used across all API routes and server modules.
 */

/** Standard API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  meta?: ApiMeta;
}

/** Pagination metadata */
export interface ApiMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/** Paginated API response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ApiMeta;
}

/** JWT session claims extracted from authenticated request */
export interface SessionClaims {
  sub: string;
  tenant_id: string;
  role: UserRole;
  tier: Tier;
  reseller_id: string | null;
}

/** User roles in the platform */
export type UserRole =
  | 'business_owner'
  | 'ugc_creator'
  | 'faceless_creator'
  | 'app_developer'
  | 'agency_admin'
  | 'sub_admin'
  | 'super_admin';

/** Subscription tiers */
export type Tier = 'basic' | 'growth' | 'pro' | 'enterprise' | 'internal';

/** Tenant status lifecycle */
export type TenantStatus =
  | 'pending_approval'
  | 'active'
  | 'grace_period'
  | 'suspended'
  | 'archived'
  | 'rejected';

/** Content post status */
export type ContentPostStatus =
  | 'draft'
  | 'pending_safety'
  | 'pending_approval'
  | 'approved'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'held'
  | 'cancelled';

/** Content types */
export type ContentType =
  | 'social_post'
  | 'blog_post'
  | 'email'
  | 'whatsapp_broadcast'
  | 'sms'
  | 'gbp_post'
  | 'youtube_video'
  | 'reel'
  | 'tiktok'
  | 'pinterest_pin'
  | 'reddit_post'
  | 'linkedin_post';

/** Media types */
export type MediaType = 'image' | 'video' | 'carousel' | 'document';

/** Social platforms */
export type SocialPlatform =
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'linkedin'
  | 'pinterest'
  | 'reddit'
  | 'whatsapp';

/** AI request types for routing classification */
export type AIRequestType =
  | 'content_generation'
  | 'onboarding_interview'
  | 'niche_research'
  | 'safety_check'
  | 'routing_classification'
  | 'call_response'
  | 'app_generation'
  | 'long_video_analysis'
  | 'inspiration_video'
  | 'inspiration_image_pdf'
  | 'bulk_classification'
  | 'trend_scanning'
  | 'image_generation'
  | 'database_query'
  | 'seo_blog_generation'
  | 'entity_building';

/** BullMQ queue names */
export type QueueName =
  | 'content-generation'
  | 'social-publishing'
  | 'ai-scene-generation'
  | 'analytics-seo';

/** Job priority levels */
export type JobPriority = 'urgent' | 'high' | 'normal' | 'low';

/** Trend status */
export type TrendStatus = 'NEW' | 'ACTIVE' | 'AGING' | 'EXPIRED';

/** Trend types */
export type TrendType = 'keyword' | 'phrase' | 'hashtag' | 'sound' | 'format' | 'topic';

/** SEO task types */
export type SeoTaskType =
  | 'blog_post'
  | 'qa_seed'
  | 'directory_submission'
  | 'content_refresh'
  | 'indexing_request'
  | 'backlink_outreach';

/** Audit types */
export type AuditType = 'initial' | 'monthly_refresh' | 'on_demand';

/** Notification priority */
export type NotificationPriority = 'urgent' | 'high' | 'normal' | 'low';

/** Sort direction for list queries */
export type SortDirection = 'asc' | 'desc';

/** Standard list query parameters */
export interface ListQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
  search?: string;
}
