/**
 * Job Registry — single source of truth for all job names across all workers.
 * Used by:
 * - API routes to validate job names before enqueuing
 * - Admin dashboards to display available job types
 * - Dead job monitor to classify failed jobs
 * - Mission Control worker health panel
 */

export interface JobRegistryEntry {
  name: string;
  queue: string;
  workerId: number;
  description: string;
  schedule?: string; // cron expression if cron-based
  triggerType: 'cron' | 'event' | 'both';
}

export const JOB_REGISTRY: JobRegistryEntry[] = [
  // ─── Worker 1 — Content Generation ───────────────────────
  { name: 'content-writing', queue: 'content-generation', workerId: 1, description: 'Generate written content via Claude Sonnet 4.6 (blog posts, captions, scripts, emails)', triggerType: 'event' },
  { name: 'voice-generation', queue: 'content-generation', workerId: 1, description: 'Synthesise voice audio via ElevenLabs for call responses and faceless characters', triggerType: 'event' },
  { name: 'video-composition', queue: 'content-generation', workerId: 1, description: 'Compose and render video via Remotion with templates, scenes, music, branding', triggerType: 'event' },
  { name: 'image-generation', queue: 'content-generation', workerId: 1, description: 'Generate images via Imagen 3 for blog posts, Pinterest pins, thumbnails', triggerType: 'event' },
  { name: 'whisper-transcription', queue: 'content-generation', workerId: 1, description: 'Transcribe audio/video via self-hosted Whisper STT', triggerType: 'event' },
  { name: 'algorithm-scoring', queue: 'content-generation', workerId: 1, description: 'Score content against target platform algorithm criteria before publishing', triggerType: 'event' },
  { name: 'content-safety-check', queue: 'content-generation', workerId: 1, description: 'Mandatory safety classification via Claude Haiku — non-skippable before any publish', triggerType: 'event' },
  { name: 'inspiration-analysis', queue: 'content-generation', workerId: 1, description: 'Analyse AI Bubble uploads (video → Gemini 2.5 Pro, image/PDF → Sonnet 4.6 vision)', triggerType: 'event' },
  { name: 'content-recycling', queue: 'content-generation', workerId: 1, description: 'Repurpose high-performing content across formats and platforms', triggerType: 'event' },
  { name: 'seo-blog-generation', queue: 'content-generation', workerId: 1, description: 'Generate SEO-optimised blog posts with keyword and trend injection (2/day/tenant)', schedule: '0 6,18 * * *', triggerType: 'cron' },
  { name: 'lead-magnet-generation', queue: 'content-generation', workerId: 1, description: 'Generate lead magnet PDFs, checklists, and templates', triggerType: 'event' },

  // ─── Worker 2 — Social Publishing ────────────────────────
  { name: 'social-posting', queue: 'social-publishing', workerId: 2, description: 'Post content to social platforms via official APIs (Meta, TikTok, LinkedIn, YouTube, Pinterest, Reddit)', triggerType: 'event' },
  { name: 'oauth-token-validation', queue: 'social-publishing', workerId: 2, description: 'Validate OAuth token before every publish attempt', triggerType: 'event' },
  { name: 'oauth-token-refresh', queue: 'social-publishing', workerId: 2, description: 'Refresh OAuth tokens for platforms supporting background refresh (Meta, LinkedIn)', triggerType: 'event' },
  { name: 'token-expiry-alert', queue: 'social-publishing', workerId: 2, description: 'Send 72-hour token expiry alert via in-app + WhatsApp + email', triggerType: 'event' },
  { name: 'held-posts-management', queue: 'social-publishing', workerId: 2, description: 'Manage posts held due to OAuth token expiry (retry/hold/cancel)', triggerType: 'event' },
  { name: 'gbp-posting', queue: 'social-publishing', workerId: 2, description: 'Post to Google Business Profile via GBP API', triggerType: 'event' },
  { name: 'whatsapp-broadcast', queue: 'social-publishing', workerId: 2, description: 'Deliver WhatsApp broadcast messages to contact lists', triggerType: 'event' },
  { name: 'sms-delivery', queue: 'social-publishing', workerId: 2, description: 'Send SMS messages via Twilio', triggerType: 'event' },
  { name: 'email-delivery', queue: 'social-publishing', workerId: 2, description: 'Send emails via email provider', triggerType: 'event' },
  { name: 'account-warmup', queue: 'social-publishing', workerId: 2, description: 'Enforce posting frequency limits for new accounts (first 30 days)', triggerType: 'event' },
  { name: 'qa-posting', queue: 'social-publishing', workerId: 2, description: 'Post Q&A answers to Quora and Reddit after business owner confirmation', triggerType: 'event' },
  { name: 'directory-submission', queue: 'social-publishing', workerId: 2, description: 'Submit business data to online directories (entity-builder)', triggerType: 'event' },
  { name: 'app-review-reply', queue: 'social-publishing', workerId: 2, description: 'Reply to app reviews on Google Play and App Store', triggerType: 'event' },

  // ─── Worker 3 — AI Scene Generation ─────────────────────
  { name: 'runway-video-generation', queue: 'ai-scene-generation', workerId: 3, description: 'Generate AI video scenes via RunwayML Gen-3 (premium tier only, concurrency: 1, 30s throttle)', triggerType: 'event' },

  // ─── Worker 4 — Analytics and SEO ────────────────────────
  { name: 'gsc-api-pull', queue: 'analytics-seo', workerId: 4, description: 'Pull data from Google Search Console (rankings, indexing, crawl errors)', schedule: '0 */6 * * *', triggerType: 'cron' },
  { name: 'ga4-data-pull', queue: 'analytics-seo', workerId: 4, description: 'Pull data from Google Analytics 4 (traffic, conversions, behaviour)', schedule: '0 */6 * * *', triggerType: 'cron' },
  { name: 'competitor-rank-tracking', queue: 'analytics-seo', workerId: 4, description: 'Track competitor rankings via DataForSEO', schedule: '0 7 * * 1', triggerType: 'cron' },
  { name: 'social-analytics-pull', queue: 'analytics-seo', workerId: 4, description: 'Pull social platform analytics (engagement, reach, follower growth)', schedule: '0 */4 * * *', triggerType: 'cron' },
  { name: 'gbp-insights-pull', queue: 'analytics-seo', workerId: 4, description: 'Pull Google Business Profile insights', schedule: '0 8 * * *', triggerType: 'cron' },
  { name: 'dashboard-aggregation', queue: 'analytics-seo', workerId: 4, description: 'Aggregate and cache dashboard data for Mission Control (every 15 min)', schedule: '*/15 * * * *', triggerType: 'both' },
  { name: 'sitemap-submission', queue: 'analytics-seo', workerId: 4, description: 'Submit sitemap to Google Search Console (daily 6am)', schedule: '0 6 * * *', triggerType: 'cron' },
  { name: 'page-indexing-request', queue: 'analytics-seo', workerId: 4, description: 'Request GSC indexing immediately on new content publish', triggerType: 'event' },
  { name: 'niche-research', queue: 'analytics-seo', workerId: 4, description: 'Perform niche research via Claude + web search (monthly refresh)', schedule: '0 3 1 * *', triggerType: 'cron' },
  { name: 'daily-report-generation', queue: 'analytics-seo', workerId: 4, description: 'Generate and deliver daily report via WhatsApp + email + in-app (11pm)', schedule: '0 23 * * *', triggerType: 'cron' },
  { name: 'lenco-payment-check', queue: 'analytics-seo', workerId: 4, description: 'Check Lenco payment status and trigger grace/suspension workflows (daily)', schedule: '0 9 * * *', triggerType: 'cron' },
  { name: 'business-audit', queue: 'analytics-seo', workerId: 4, description: 'Run business audit (initial on activation, monthly refresh)', schedule: '0 2 1 * *', triggerType: 'both' },
  { name: 'trend-scanning', queue: 'analytics-seo', workerId: 4, description: 'Scan for trending topics in tenant niche (daily, feeds trend-intelligence-engine)', schedule: '0 7 * * *', triggerType: 'cron' },
  { name: 'trend-expiry-check', queue: 'analytics-seo', workerId: 4, description: 'Flag aging trends as expired (daily)', schedule: '0 22 * * *', triggerType: 'cron' },
  { name: 'reputation-velocity-update', queue: 'analytics-seo', workerId: 4, description: 'Update reputation velocity score (weekly)', schedule: '0 4 * * 1', triggerType: 'cron' },
  { name: 'client-health-score-update', queue: 'analytics-seo', workerId: 4, description: 'Recalculate client health composite score (daily)', schedule: '0 5 * * *', triggerType: 'cron' },
  { name: 'key-rotation', queue: 'analytics-seo', workerId: 4, description: 'Rotate encryption keys older than 90 days — re-encrypts with fresh IV, deactivates old record (RULE S-2)', schedule: '0 3 1 * *', triggerType: 'cron' },
  { name: 'keyword-cannibalisation-scan', queue: 'analytics-seo', workerId: 4, description: 'Scan for keyword cannibalisation across tracked keywords (monthly)', schedule: '0 3 15 * *', triggerType: 'cron' },
  { name: 'entity-consistency-check', queue: 'analytics-seo', workerId: 4, description: 'Verify entity data consistency across directories (monthly)', schedule: '0 3 20 * *', triggerType: 'cron' },
  { name: 'content-refresh', queue: 'analytics-seo', workerId: 4, description: 'Refresh content posts older than 6 months (monthly)', schedule: '0 4 1 * *', triggerType: 'cron' },
  { name: 'sprint-mode-end-check', queue: 'analytics-seo', workerId: 4, description: 'Check if tenant 30-day sprint should end (daily)', schedule: '0 0 * * *', triggerType: 'cron' },
  { name: 'app-revenue-sync', queue: 'analytics-seo', workerId: 4, description: 'Sync app revenue from Google Play/App Store (daily)', schedule: '0 10 * * *', triggerType: 'cron' },
  { name: 'aso-rank-check', queue: 'analytics-seo', workerId: 4, description: 'Check App Store Optimization rank (weekly)', schedule: '0 6 * * 1', triggerType: 'cron' },
  { name: 'app-review-monitoring', queue: 'analytics-seo', workerId: 4, description: 'Monitor app reviews on Google Play and App Store (daily)', schedule: '0 11 * * *', triggerType: 'cron' },
];

/** Quick lookup: job name → registry entry */
export const JOB_MAP = new Map(JOB_REGISTRY.map((entry) => [entry.name, entry]));

/** Get all jobs for a specific queue */
export function getJobsForQueue(queueName: string): JobRegistryEntry[] {
  return JOB_REGISTRY.filter((entry) => entry.queue === queueName);
}

/** Validate that a job name exists in the registry */
export function isValidJobName(name: string): boolean {
  return JOB_MAP.has(name);
}
