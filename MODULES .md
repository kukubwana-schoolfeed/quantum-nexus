# QUANTUM NEXUS — MODULES.md
# Version: 2.0.0 | Status: LOCKED
# Read CLAUDE.md and ARCHITECTURE.md before reading this file.
# Every module in the system is defined here.
# If a module is not listed here, it does not exist yet.
# Version 2.0 adds 8 new domination modules. All existing modules are unchanged.

---

## MODULE DEFINITION FORMAT

Each module entry contains:
- NAME: exact module identifier used in code
- PURPOSE: what it does and why it exists
- OWNER: which terminal owns this module
- OWNS FILES: exact file paths this module creates and owns
- NEVER TOUCHES: files and directories this module must not modify
- INPUTS: what data comes in
- OUTPUTS: what data goes out
- DEPENDENCIES: other modules this module depends on
- PHASE: which build phase implements this module
- STATUS: scaffold | mock | real | complete

---

## PLATFORM CORE MODULES

---

### MODULE: onboarding-engine
PURPOSE: Conducts AI-powered conversational interview with new businesses/creators. Extracts structured Niche Profile from natural conversation. Enforces completeness scoring gates. Does not activate system until mandatory fields complete and admin approves.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/onboarding/interview.ts
- /src/server/onboarding/extractor.ts
- /src/server/onboarding/completeness.ts
- /src/server/onboarding/gates.ts
- /src/app/onboarding/page.tsx
- /src/components/onboarding/InterviewChat.tsx
- /src/components/onboarding/CompletenessBar.tsx
- /src/components/onboarding/GateStatus.tsx
NEVER TOUCHES: any worker file, any integration file, any other business module
INPUTS: User type selection, conversational answers, uploaded brand assets, API key submissions
OUTPUTS: Structured NicheProfile object stored in Supabase, completeness score, gate status flags
DEPENDENCIES: niche-intelligence, api-key-manager, completeness-scoring, admin-approval-gate
PHASE: 1 (scaffold) → 2 (mock interview) → 3 (real Claude interview)
STATUS: scaffold

AI MODEL USED: Claude Sonnet 4.6
INTERVIEW LANGUAGE: English (V1)
COMPLETENESS SCORING:
  - Business name: 10 points
  - Logo uploaded: 10 points
  - Industry/niche confirmed: 10 points
  - Location: 10 points
  - Brand colors: 10 points
  - At least one social account connected: 10 points
  - Phone number verified: 10 points
  - Website URL or explicit "no website": 10 points
  - Target audience description: 10 points
  - First content preference set: 10 points
  TOTAL: 100 points
GATE THRESHOLDS:
  - 40 points: content generation unlocked
  - 70 points: scheduling and publishing unlocked
  - 100 points: analytics and community unlocked

---

### MODULE: niche-intelligence
PURPOSE: Manages the Niche Library (pre-built profiles for common niches) and serves the correct niche data to all other modules at runtime.
OWNER: Terminal 2
OWNS FILES:
- /src/server/niche/library.ts
- /src/server/niche/profiles/hospitality.ts
- /src/server/niche/profiles/retail.ts
- /src/server/niche/profiles/professional-services.ts
- /src/server/niche/profiles/food-beverage.ts
- /src/server/niche/profiles/health-wellness.ts
- /src/server/niche/profiles/education.ts
- /src/server/niche/profiles/automotive.ts
- /src/server/niche/profiles/construction.ts
- /src/server/niche/profiles/fashion.ts
- /src/server/niche/profiles/beauty.ts
- /src/server/niche/resolver.ts
NEVER TOUCHES: any worker file, any UI file, any integration file
INPUTS: niche name string from onboarding
OUTPUTS: NicheProfile object (keywords, content formats, tone, platforms, audience, regulatory flags)
DEPENDENCIES: niche-research (for unknown niches)
PHASE: 1 (scaffold with static profiles) → 2 (mock resolver) → 3 (real resolver)
STATUS: scaffold

---

### MODULE: niche-research
PURPOSE: Automatically researches unknown niches using Claude Sonnet 4.6 + web search. Stores results as new NicheProfile in Supabase. Sends to super admin review queue before activation.
OWNER: Terminal 2
OWNS FILES:
- /src/server/niche/research.ts
- /src/workers/content/jobs/niche-research.job.ts
NEVER TOUCHES: any UI file, any other worker
INPUTS: Unknown niche name string, business location, business description
OUTPUTS: Draft NicheProfile in Supabase with status: 'pending_review'
DEPENDENCIES: niche-intelligence, bullmq-job-registry, super-admin-dashboard
PHASE: 3 (real Claude + web search)
STATUS: scaffold

AI MODEL: Claude Sonnet 4.6 with web search tool
TRIGGERS: On onboarding when niche not found in library + monthly refresh for all active niches
ADMIN REVIEW: New niche profiles cannot activate until super admin approves

---

### MODULE: api-key-manager
PURPOSE: Securely stores, retrieves, and rotates all business-level API keys and OAuth tokens. AES-256 encryption. Keys never exposed to frontend or logged.
OWNER: Terminal 3
OWNS FILES:
- /src/lib/security/encryption.ts
- /src/lib/security/key-manager.ts
- /src/lib/security/oauth-token-manager.ts
NEVER TOUCHES: any UI file, any worker file directly
INPUTS: Raw API keys from business during onboarding/integrations setup
OUTPUTS: Decrypted keys delivered to server-side processes only, never to client
DEPENDENCIES: none
PHASE: 2 (encryption layer) → 3 (full token lifecycle management)
STATUS: scaffold

ENCRYPTION: AES-256-GCM
STORAGE: Supabase encrypted_keys table (see DATA_MODELS.md)
NEVER LOG: API keys, OAuth tokens, or decrypted values in any log file

---

### MODULE: completeness-scoring
PURPOSE: Calculates and tracks onboarding completeness score. Enforces feature unlock gates.
OWNER: Terminal 2
OWNS FILES:
- /src/server/onboarding/completeness.ts
- /src/server/onboarding/gates.ts
INPUTS: Business profile fields from Supabase
OUTPUTS: Score (0-100), gate status (locked/unlocked) per feature group
DEPENDENCIES: none
PHASE: 1
STATUS: scaffold

---

### MODULE: admin-approval-gate
PURPOSE: Blocks system activation until super admin manually approves a business. Handles approval, rejection (with reason), and resubmission flows.
OWNER: Terminal 2
OWNS FILES:
- /src/server/admin/approval.ts
- /src/app/admin/approvals/page.tsx
- /src/components/admin/ApprovalQueue.tsx
INPUTS: Business account in pending_approval status
OUTPUTS: Account status updated to active or rejected_with_reason
DEPENDENCIES: notification-engine, super-admin-dashboard
PHASE: 2
STATUS: scaffold

REJECTION REASONS (four only, objective):
1. Inappropriate logo or branding
2. Business name violates platform terms
3. Color scheme illegible or inaccessible
4. Missing required business information

---

### MODULE: tier-system
PURPOSE: Enforces feature access based on business tier. All feature flags checked against tier at API level.
OWNER: Terminal 2 (logic) + Terminal 3 (enforcement)
OWNS FILES:
- /src/lib/tiers/feature-flags.ts
- /src/lib/tiers/tier-checker.ts
- /src/middleware/tier-guard.ts
INPUTS: Authenticated JWT with tier claim
OUTPUTS: Boolean feature access decisions
DEPENDENCIES: none
PHASE: 2
STATUS: scaffold

TIERS:
- basic: core automation, 3 social accounts, SEO, content machine, English + Nyanja, 60s video
- growth: everything in basic + broadcasts, customer DB, review campaigns, all socials, 5min video
- pro: everything in growth + white-label app, rewards, priority queue, dedicated voice number
- enterprise: everything in pro + 15min animated episodes, white-label reseller capability
- internal: full access, zero billing, your API pool

---

### MODULE: billing-engine
PURPOSE: Manages Lenco integration for platform billing. Generates monthly invoices. Tracks payment status. Triggers grace periods, suspensions, and data deletion.
OWNER: Terminal 2
OWNS FILES:
- /src/server/billing/invoicing.ts
- /src/server/billing/lenco.ts
- /src/server/billing/payment-tracker.ts
- /src/workers/analytics/jobs/payment-check.job.ts
INPUTS: Subscription data, Lenco transaction webhook/log
OUTPUTS: Invoice records, payment status updates, suspension triggers
DEPENDENCIES: notification-engine, soft-delete-archive
PHASE: 3
STATUS: scaffold

PAYMENT FLOW:
- Invoice generated on billing date
- Worker 4 checks Lenco daily for payment confirmation
- Day 7 unpaid: grace period begins, new content generation paused, posting continues
- Day 14 unpaid: account suspended, all automation paused, data retained
- Day 30 after suspension: permanent deletion (soft delete first, hard delete at day 30)

---

### MODULE: payment-tracker
PURPOSE: Automated daily payment status checking via Lenco. Auto-triggers grace, suspension, deletion.
OWNER: Terminal 2
OWNS FILES:
- /src/workers/analytics/jobs/payment-check.job.ts
- /src/server/billing/payment-tracker.ts
INPUTS: Lenco transaction log / webhook
OUTPUTS: Updated payment_status in Supabase, triggers to billing-engine
DEPENDENCIES: billing-engine, notification-engine
PHASE: 3
STATUS: scaffold

---

### MODULE: soft-delete-archive
PURPOSE: Ensures cancelled or suspended business data is archived indefinitely. Supports full reactivation at any time. Hard deletion only after 30 days post-suspension on unpaid accounts.
OWNER: Terminal 2
OWNS FILES:
- /src/server/archive/soft-delete.ts
- /src/server/archive/reactivation.ts
INPUTS: Cancellation/suspension trigger
OUTPUTS: Business status updated to archived, data preserved, reactivation restores all data
DEPENDENCIES: billing-engine
PHASE: 2
STATUS: scaffold

---

### MODULE: sprint-mode-engine
PURPOSE: Activates elevated operating mode for first 30 days after business/creator activation. Auto-disables on day 31 and shifts to sustainable schedule.
OWNER: Terminal 2
OWNS FILES:
- /src/server/sprint/sprint-mode.ts
- /src/workers/analytics/jobs/sprint-check.job.ts
INPUTS: Business activation date, current date
OUTPUTS: Sprint mode config served to all workers, disables on day 31
DEPENDENCIES: bullmq-job-registry
PHASE: 3
STATUS: scaffold

---

## BUSINESS MODULES

---

### MODULE: seo-engine
PURPOSE: Full SEO automation. Crawls business website, connects GSC, builds keyword strategy, generates content calendar, submits sitemap daily, indexes new pages immediately, tracks rankings weekly.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/seo/crawler.ts
- /src/server/seo/gsc.ts
- /src/server/seo/keyword-strategy.ts
- /src/server/seo/content-calendar.ts
- /src/server/seo/backlink-outreach.ts
- /src/server/seo/directory-submission.ts
- /src/workers/analytics/jobs/sitemap-submit.job.ts
- /src/workers/analytics/jobs/rank-track.job.ts
- /src/workers/analytics/jobs/index-request.job.ts
- /src/app/dashboard/seo/page.tsx
- /src/components/seo/KeywordCalendar.tsx
- /src/components/seo/RankTracker.tsx
- /src/components/seo/CrawlReport.tsx
INPUTS: Business website URL, GSC OAuth token, niche profile keywords
OUTPUTS: SEO audit, 90-day content calendar, daily indexing jobs, weekly rank report
DEPENDENCIES: niche-intelligence, google-search-console integration, dataforseo integration
PHASE: 3 (GSC connection) → 4 (full calendar and automation)
STATUS: scaffold

CONTENT CALENDAR:
- System generates, business edits freely
- Permanent keyword blocklist respected on all future generations
- System learns from edits when business changes >50% of calendar

---

### MODULE: content-machine
PURPOSE: Generates all written and visual content. Blog posts, social media captions, email newsletters, ad copy. All content passes algorithm scoring and safety check before queuing to publisher.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/content/generator.ts
- /src/server/content/blog-pipeline.ts
- /src/server/content/caption-generator.ts
- /src/server/content/email-generator.ts
- /src/server/content/image-generator.ts
- /src/workers/content/jobs/blog-post.job.ts
- /src/workers/content/jobs/social-caption.job.ts
- /src/workers/content/jobs/email.job.ts
- /src/app/dashboard/content/page.tsx
- /src/components/content/ContentCalendar.tsx
- /src/components/content/ContentQueue.tsx
INPUTS: Niche profile, SEO content calendar, business knowledge base, brand assets
OUTPUTS: Published blog posts, scheduled social posts, email campaigns
DEPENDENCIES: seo-engine, algorithm-scoring-engine, content-safety-checker, approval-queue, social-media-layer
PHASE: 2 (mock) → 3 (real Claude generation) → 4 (full pipeline)
STATUS: scaffold

---

### MODULE: algorithm-scoring-engine
PURPOSE: Scores every piece of content against target platform's algorithm preferences before publishing. Suggests improvements below threshold. Business can override.
OWNER: Terminal 2
OWNS FILES:
- /src/server/content/algorithm-scorer.ts
- /src/workers/content/jobs/algorithm-score.job.ts
INPUTS: Generated content, target platform, content type
OUTPUTS: Score per platform (0-100), improvement suggestions, pass/fail decision
DEPENDENCIES: content-machine
PHASE: 3
STATUS: scaffold

MINIMUM SCORES: TikTok: 70 | YouTube: 65 | Instagram: 70 | Facebook: 60 | LinkedIn: 65

---

### MODULE: content-safety-checker
PURPOSE: Mandatory AI safety check on every post before publishing. Non-skippable regardless of approval queue settings. Uses Claude Haiku for speed and cost.
OWNER: Terminal 3
OWNS FILES:
- /src/lib/security/content-safety.ts
- /src/middleware/safety-guard.ts
INPUTS: Any content about to be published
OUTPUTS: PASS or FAIL with reason. FAIL holds post and notifies business.
DEPENDENCIES: none
PHASE: 2
STATUS: scaffold

MODEL: Claude Haiku 4.5 (fast, cheap classification)
CHECKS: Harmful content, false claims, legally sensitive content, platform policy violations
CANNOT BE DISABLED: by any business, reseller, or admin. Platform-level enforcement only.

---

### MODULE: social-media-layer
PURPOSE: Manages all social media posting, comment monitoring, comment response, DM handling across all connected platforms via official APIs only.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/social/post-manager.ts
- /src/server/social/comment-handler.ts
- /src/server/social/dm-handler.ts
- /src/server/social/platform-router.ts
- /src/workers/publishing/jobs/post-facebook.job.ts
- /src/workers/publishing/jobs/post-instagram.job.ts
- /src/workers/publishing/jobs/post-tiktok.job.ts
- /src/workers/publishing/jobs/post-linkedin.job.ts
- /src/workers/publishing/jobs/post-youtube.job.ts
- /src/workers/publishing/jobs/post-pinterest.job.ts
- /src/workers/publishing/jobs/post-reddit.job.ts
- /src/workers/publishing/jobs/handle-comments.job.ts
- /src/app/dashboard/social/page.tsx
- /src/components/social/PostScheduler.tsx
- /src/components/social/CommentFeed.tsx
- /src/components/social/PlatformConnector.tsx
INPUTS: Formatted content from content-machine, platform OAuth tokens, niche profile
OUTPUTS: Published posts, comment responses, DM replies, engagement logs
DEPENDENCIES: content-machine, oauth-token-manager, account-warmup-engine, content-safety-checker
PHASE: 3 (one platform per session)
STATUS: scaffold

ALL POSTING VIA OFFICIAL APIs ONLY. No browser automation. No scraping. Ever.
ACCOUNT WARM-UP: New accounts follow warm-up schedule enforced by account-warmup-engine.

---

### MODULE: account-warmup-engine
PURPOSE: Enforces gradual posting frequency increase for new social accounts to avoid algorithmic penalties and bans.
OWNER: Terminal 2
OWNS FILES:
- /src/server/social/warmup.ts
INPUTS: Account creation date, current date, desired posting frequency
OUTPUTS: Maximum allowed posts per day for this account today
DEPENDENCIES: none
PHASE: 3
STATUS: scaffold

WARM-UP SCHEDULE:
- Days 1-7: maximum 1 post per day per platform
- Days 8-14: maximum 2 posts per day per platform
- Days 15-21: maximum 3 posts per day per platform
- Day 22+: full desired schedule
NOTE: Sprint mode does NOT override warm-up limits. Safety first.

---

### MODULE: inbound-call-handler
PURPOSE: Handles all inbound calls via Twilio + ElevenLabs + Claude. Answers questions from price database and knowledge base. Triggers human handoff when needed.
OWNER: Terminal 2
OWNS FILES:
- /src/server/calls/call-handler.ts
- /src/server/calls/voice-synthesizer.ts
- /src/server/calls/call-logger.ts
- /src/app/api/calls/inbound/route.ts
INPUTS: Twilio webhook (inbound call), tenant identified by Twilio number mapping
OUTPUTS: ElevenLabs audio response, call log, human handoff trigger if needed
DEPENDENCIES: call-fallback-handler, knowledge-base-builder, customer-database, notification-engine
PHASE: 3
STATUS: scaffold

CALL FLOW:
1. Twilio receives call → webhook to /api/calls/inbound
2. Identify business by Twilio number → fetch tenant_id
3. Build system prompt from Niche Profile
4. Real-time conversation loop (Twilio ↔ ElevenLabs ↔ Sonnet 4.6)
5. Resolved → log in customer database
6. Cannot resolve → call-fallback-handler

---

### MODULE: call-fallback-handler
PURPOSE: Handles situations where AI cannot resolve a call. Plays defined fallback message, schedules automated follow-up, notifies business owner simultaneously.
OWNER: Terminal 2
OWNS FILES:
- /src/server/calls/fallback.ts
- /src/workers/content/jobs/call-followup.job.ts
INPUTS: Unresolved call context, full transcript, customer details
OUTPUTS: Fallback message played to customer, business notified (WhatsApp + email + in-app), follow-up job scheduled
DEPENDENCIES: notification-engine, bullmq-job-registry
PHASE: 3
STATUS: scaffold

FALLBACK SCRIPT (default, business can customise):
"Thank you for calling [Business Name]. Our team is currently unavailable but will personally follow up with you within 2 hours. We appreciate your patience."

FOLLOW-UP JOB: If business owner has not responded within 2 hours, system sends automated WhatsApp to customer: "Hi [Name], this is [Business Name] following up on your earlier call. How can we help you today?"

---

### MODULE: outbound-sales-engine
PURPOSE: Manages AI cold calling, demo site linking, WhatsApp outreach sequences, email outreach, social DM campaigns.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/sales/cold-call.ts
- /src/server/sales/demo-site-generator.ts
- /src/server/sales/whatsapp-sequence.ts
- /src/server/sales/email-outreach.ts
- /src/server/sales/lead-tracker.ts
- /src/app/dashboard/sales/page.tsx
- /src/components/sales/LeadPipeline.tsx
- /src/components/sales/OutreachTracker.tsx
INPUTS: Prospect list, niche profile, outreach templates
OUTPUTS: Calls made, demos generated, sequences triggered, leads tracked
DEPENDENCIES: customer-database, notification-engine, twilio integration, elevenlabs integration
PHASE: 4
STATUS: scaffold

DEMO SITES: Generated as static HTML/CSS, deployed to Vercel free tier (separate account), auto-deleted after 30 days.

---

### MODULE: google-business-profile-manager
PURPOSE: Automates all Google Business Profile activity. Weekly posts, review responses, Q&A answers, insights pulling.
OWNER: Terminal 2
OWNS FILES:
- /src/server/gbp/post-manager.ts
- /src/server/gbp/review-responder.ts
- /src/server/gbp/qa-handler.ts
- /src/workers/analytics/jobs/gbp-insights.job.ts
- /src/workers/publishing/jobs/gbp-post.job.ts
INPUTS: GBP OAuth token, business knowledge base, niche profile
OUTPUTS: Weekly posts, review responses, Q&A answers, insights in analytics dashboard
DEPENDENCIES: content-machine, knowledge-base-builder, crisis-detection
PHASE: 3
STATUS: scaffold

---

### MODULE: broadcast-engine
PURPOSE: Manages WhatsApp, SMS, and email broadcast lists. Segment-based targeting. Delivery tracking.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/broadcast/list-manager.ts
- /src/server/broadcast/message-sender.ts
- /src/server/broadcast/delivery-tracker.ts
- /src/workers/publishing/jobs/broadcast-whatsapp.job.ts
- /src/workers/publishing/jobs/broadcast-email.job.ts
- /src/app/dashboard/broadcasts/page.tsx
- /src/components/broadcasts/ListBuilder.tsx
- /src/components/broadcasts/BroadcastComposer.tsx
INPUTS: Customer segments, message content, send schedule
OUTPUTS: Messages delivered, delivery rates, open rates, reply rates
DEPENDENCIES: customer-database, whatsapp-business-api integration
PHASE: 3
STATUS: scaffold

---

### MODULE: customer-database
PURPOSE: Full customer CRM. Profiles, interaction history, order history, lifetime value, segments, priority tiers, loyalty points.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/customers/profile-manager.ts
- /src/server/customers/segment-engine.ts
- /src/server/customers/ltv-calculator.ts
- /src/server/customers/priority-tier.ts
- /src/app/dashboard/customers/page.tsx
- /src/components/customers/CustomerProfile.tsx
- /src/components/customers/CustomerList.tsx
- /src/components/customers/SegmentBuilder.tsx
INPUTS: Customer interactions from all channels, manual additions, QR bridge captures
OUTPUTS: Customer profiles, segments, LTV scores, priority tier assignments
DEPENDENCIES: offline-qr-bridge, loyalty-points-engine, birthday-engine
PHASE: 2 (mock) → 3 (real)
STATUS: scaffold

PRIORITY TIERS: Standard | Priority | VIP
AUTO-UPGRADE RULE: Business sets spend threshold. System upgrades customer tier automatically when threshold is reached.

---

### MODULE: birthday-engine
PURPOSE: Tracks customer birthdays. Notifies business in advance. Manages confirmation flow. Sends midnight birthday message with QR token. Sends morning follow-up. Tracks redemption.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/birthday/birthday-engine.ts
- /src/server/birthday/token-generator.ts
- /src/server/birthday/redemption-tracker.ts
- /src/workers/analytics/jobs/birthday-check.job.ts
- /src/workers/publishing/jobs/birthday-midnight.job.ts
- /src/workers/publishing/jobs/birthday-morning.job.ts
- /src/app/dashboard/birthdays/page.tsx
- /src/components/birthdays/BirthdayCalendar.tsx
- /src/components/birthdays/RedemptionScanner.tsx
INPUTS: Customer DOB, priority tier, business birthday offer config
OUTPUTS: Advance notifications to business, midnight message, morning follow-up, QR token, redemption tracking
DEPENDENCIES: customer-database, notification-engine, whatsapp-business-api integration
PHASE: 3
STATUS: scaffold

PRIORITY TIER BEHAVIOUR:
- Standard: batch notification 3 days before, midnight message
- Priority: individual notification 5 days before, midnight message
- VIP: individual notification 7 days before, escalated offer suggestion, midnight + morning + noon messages

QR TOKEN: Unique per birthday, single-use, expires at 23:59 on birthday date
REDEMPTION: Staff scans via dashboard browser page, auto-marks redeemed, token invalidated

---

### MODULE: review-campaign-manager
PURPOSE: Automates review generation campaigns. Sends review request after completed order. Provides incentive. Detects review via GBP API. Delivers incentive on detection.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/reviews/campaign-manager.ts
- /src/server/reviews/incentive-manager.ts
- /src/server/reviews/review-detector.ts
- /src/workers/publishing/jobs/review-request.job.ts
- /src/app/dashboard/reviews/page.tsx
- /src/components/reviews/CampaignBuilder.tsx
INPUTS: Completed order event, business incentive config, GBP OAuth token
OUTPUTS: Review request message, follow-up message, incentive delivery confirmation
DEPENDENCIES: customer-database, google-business-profile-manager, whatsapp-business-api integration
PHASE: 3
STATUS: scaffold

---

### MODULE: video-testimonial-collector
PURPOSE: After detecting a positive Google review, sends WhatsApp requesting a video testimonial. Processes received video through content pipeline for use as social proof content.
OWNER: Terminal 2
OWNS FILES:
- /src/server/testimonials/collector.ts
- /src/server/testimonials/processor.ts
- /src/workers/content/jobs/testimonial-process.job.ts
INPUTS: Positive review detection event, customer WhatsApp number
OUTPUTS: Video testimonial request sent, received video processed and queued as social content
DEPENDENCIES: review-campaign-manager, content-machine, social-media-layer
PHASE: 4
STATUS: scaffold

---

### MODULE: loyalty-points-engine
PURPOSE: Manages points earning, balances, rewards catalogue, redemption, and milestone detection. Points isolated per business in V1.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/loyalty/points-engine.ts
- /src/server/loyalty/rewards-catalogue.ts
- /src/server/loyalty/redemption-manager.ts
- /src/server/loyalty/milestone-detector.ts
- /src/app/dashboard/loyalty/page.tsx
- /src/components/loyalty/PointsDashboard.tsx
- /src/components/loyalty/RewardsCatalogue.tsx
INPUTS: Purchase events, redemption requests, business reward configuration
OUTPUTS: Points balances, milestone alerts, redemption codes, customer notifications
DEPENDENCIES: customer-database, notification-engine
PHASE: 3
STATUS: scaffold

POINTS: Isolated per business in V1. Universal cross-business currency is V3.
MILESTONE BIRTHDAYS: System detects milestone ages (18, 21, 30, 40, 50) from birth year (if provided) and suggests escalated offers.

---

### MODULE: lead-magnet-builder
PURPOSE: Generates valuable downloadable resources (PDF guides, checklists, templates) for professional services businesses. Captures contact information in exchange. Auto-adds to customer database. Triggers follow-up sequence.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/lead-magnets/generator.ts
- /src/server/lead-magnets/landing-page.ts
- /src/server/lead-magnets/capture-handler.ts
- /src/workers/content/jobs/lead-magnet-generate.job.ts
- /src/app/dashboard/lead-magnets/page.tsx
- /src/components/lead-magnets/MagnetBuilder.tsx
INPUTS: Niche profile, business knowledge base, target audience
OUTPUTS: Generated PDF/document, landing page URL, captured contacts added to customer database
DEPENDENCIES: content-machine, customer-database, knowledge-base-builder
PHASE: 4
STATUS: scaffold

---

### MODULE: seasonal-campaign-engine
PURPOSE: Proactively plans and executes seasonal campaigns. Alerts business 30 days before major events. Generates full campaign content on approval. Runs post-campaign performance report.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/seasonal/campaign-planner.ts
- /src/server/seasonal/event-calendar.ts
- /src/server/seasonal/campaign-executor.ts
- /src/workers/analytics/jobs/seasonal-check.job.ts
- /src/app/dashboard/campaigns/page.tsx
- /src/components/campaigns/CampaignPlanner.tsx
INPUTS: Business niche, location (Zambia), business approval
OUTPUTS: Campaign concept, full content schedule, post-campaign report
DEPENDENCIES: content-machine, broadcast-engine, social-media-layer
PHASE: 4
STATUS: scaffold

ZAMBIAN CALENDAR EVENTS INCLUDED: Christmas, New Year, Valentine's Day, Easter, Africa Day, Zambia Independence Day (Oct 24), Back to School periods, Mother's Day, Father's Day, plus niche-specific events.

---

### MODULE: offline-qr-bridge
PURPOSE: Generates unique QR codes for walk-in customer capture. Landing page captures name and phone. Auto-adds to customer database. Triggers welcome sequence.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/qr/qr-generator.ts
- /src/app/join/[business_slug]/page.tsx
- /src/components/qr/QRCodeDisplay.tsx
- /src/components/qr/PrintableQR.tsx
INPUTS: Business slug, customer name and phone submission
OUTPUTS: QR code (printable, multiple sizes), captured customer in database, welcome WhatsApp
DEPENDENCIES: customer-database, loyalty-points-engine, notification-engine
PHASE: 3
STATUS: scaffold

QR SIZES: Receipt-sized, counter-card-sized, A4 poster. All printable from dashboard.

---

### MODULE: competitor-intelligence
PURPOSE: Monitors nominated competitor social accounts and Google rankings. Generates weekly competitor report. Feeds gap data into business-audit-engine.
OWNER: Terminal 2
OWNS FILES:
- /src/server/competitors/monitor.ts
- /src/server/competitors/rank-tracker.ts
- /src/workers/analytics/jobs/competitor-monitor.job.ts
INPUTS: Nominated competitor names/URLs/handles, DataForSEO credentials, platform OAuth tokens
OUTPUTS: Weekly competitor report in analytics dashboard, gap data for business-audit-engine
DEPENDENCIES: dataforseo integration, social platform integrations, business-audit-engine
PHASE: 4
STATUS: scaffold

METHOD: Official APIs and DataForSEO only. No scraping. Ever.

---

### MODULE: reputation-layer
PURPOSE: Manages directory submissions, crisis detection, and overall online reputation.
OWNER: Terminal 2
OWNS FILES:
- /src/server/reputation/directory-submission.ts
- /src/server/reputation/crisis-detection.ts
INPUTS: Business profile, GBP data, social mentions
OUTPUTS: Directory submission records, crisis alerts
DEPENDENCIES: crisis-detection, google-business-profile-manager, notification-engine
PHASE: 4
STATUS: scaffold

---

### MODULE: approval-queue
PURPOSE: Optional per-business queue where generated content waits for human approval before publishing. Business receives WhatsApp notification. Approves or rejects from phone.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/approval/queue-manager.ts
- /src/app/dashboard/approval/page.tsx
- /src/components/approval/ApprovalQueue.tsx
INPUTS: Generated content from content-machine (if approval mode enabled)
OUTPUTS: Approved content queued to Worker 2, rejected content returned with feedback
DEPENDENCIES: content-machine, notification-engine
PHASE: 2
STATUS: scaffold

NOTE: Safety check is mandatory and runs before approval queue. Approval queue is optional on top.

---

### MODULE: knowledge-base-builder
PURPOSE: Central repository of business-specific information. Price lists, service descriptions, FAQs, uploaded documents. Single source of truth for all AI responses.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/knowledge/knowledge-base.ts
- /src/server/knowledge/document-processor.ts
- /src/server/knowledge/price-list.ts
- /src/app/dashboard/knowledge/page.tsx
- /src/components/knowledge/KnowledgeBase.tsx
- /src/components/knowledge/PriceListEditor.tsx
INPUTS: Uploaded PDFs, rate cards, typed FAQs, product descriptions
OUTPUTS: Structured knowledge available to all AI modules via single retrieval function
DEPENDENCIES: none
PHASE: 2 (mock) → 3 (real document processing)
STATUS: scaffold

DOCUMENT PROCESSING: Gemini 2.5 Pro for long document analysis, Sonnet 4.6 for extraction and structuring.

---

### MODULE: community-module
PURPOSE: Optional per-business customer community feed. Customers can post, comment, like. Off by default. Business activates from settings.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/community/feed.ts
- /src/server/community/moderation.ts
- /src/app/dashboard/community/page.tsx
- /src/components/community/CommunityFeed.tsx
INPUTS: Customer posts, comments, likes
OUTPUTS: Moderated community feed per business
DEPENDENCIES: customer-database, content-safety-checker
PHASE: 5
STATUS: scaffold

---

### MODULE: analytics-dashboard
PURPOSE: Per-business analytics. Post performance, website traffic, leads, call volume, revenue, content performance, SEO rankings.
OWNER: Terminal 1 (UI) + Terminal 2 (data)
OWNS FILES:
- /src/server/analytics/aggregator.ts
- /src/app/dashboard/analytics/page.tsx
- /src/components/analytics/PerformanceCharts.tsx
- /src/components/analytics/LeadTracker.tsx
- /src/components/analytics/RevenueTracker.tsx
- /src/components/analytics/SEORankings.tsx
INPUTS: Data from all modules, GA4, GSC, platform APIs, call logs
OUTPUTS: Visual dashboard, downloadable reports
DEPENDENCIES: All data-producing modules
PHASE: 2 (mock data) → 4 (real data)
STATUS: scaffold

---

### MODULE: daily-report-engine
PURPOSE: Generates and delivers daily business summary at 11pm. WhatsApp + email + in-app.
OWNER: Terminal 2
OWNS FILES:
- /src/workers/analytics/jobs/daily-report.job.ts
- /src/server/reports/daily-report.ts
INPUTS: All analytics data for the day
OUTPUTS: Formatted report delivered via WhatsApp, email, in-app notification
DEPENDENCIES: analytics-dashboard, notification-engine
PHASE: 4
STATUS: scaffold

---

### MODULE: crisis-detection
PURPOSE: Monitors for negative sentiment spikes across Google reviews and social media. Flags immediately and triggers human handoff — does NOT auto-respond to crisis.
OWNER: Terminal 2
OWNS FILES:
- /src/server/reputation/crisis-detection.ts
- /src/workers/analytics/jobs/sentiment-monitor.job.ts
INPUTS: Google review stream, social media mentions
OUTPUTS: Crisis alert (WhatsApp + email + in-app simultaneously), human handoff — AI does not auto-respond
DEPENDENCIES: notification-engine, google-business-profile-manager
PHASE: 4
STATUS: scaffold

IMPORTANT: In a detected crisis, the AI holds all automated responses and notifies the business owner immediately. No automated crisis response. Human takes over completely.

---

### MODULE: white-label-app-builder
PURPOSE: Allows Pro/Enterprise businesses to configure and submit a custom-branded mobile app. App published to Play Store and App Store under Quantum Leaf developer accounts.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/app-builder/configurator.ts
- /src/server/app-builder/template-generator.ts
- /src/server/app-builder/submission-handler.ts
- /src/app/dashboard/app-builder/page.tsx
- /src/components/app-builder/AppConfigurator.tsx
- /src/components/app-builder/FeatureSelector.tsx
- /src/components/app-builder/SubmissionStatus.tsx
INPUTS: Business brand assets, feature selections, content preferences
OUTPUTS: App configuration submitted to admin review queue, app built from white-label template
DEPENDENCIES: super-admin-dashboard, loyalty-points-engine, customer-database
PHASE: 6
STATUS: scaffold

APP FEATURES (customer-facing):
- Business branding (logo, colors, name)
- Customer profile with order history
- Product/service browsing (catalogue from Nexus database)
- Loyalty points and rewards
- Push notifications
- Direct chat (routes to AI handler)
- Review prompts
- Birthday reward tracking

PAYMENT ROUTING: "Buy Now" opens business website in browser. No in-app purchases. Bypasses Apple 30% and Google 15-30% fees. Legal — used by Amazon, Spotify, others.

---

## NEW — DOMINATION MODULES (Version 2.0)

---

### MODULE: business-audit-engine
PURPOSE: Before the platform assumes anything about a business, it audits the current state of the business online. Checks existing backlinks, SEO scores, domain authority, indexed pages, social media presence, Google Business Profile completeness, review count and rating, content posting history, and competitor gap. Platform starts exactly where the business actually is — not from zero.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/audit/business-auditor.ts
- /src/server/audit/backlink-checker.ts
- /src/server/audit/seo-baseline.ts
- /src/server/audit/social-presence-checker.ts
- /src/server/audit/competitor-gap.ts
- /src/workers/analytics/jobs/initial-audit.job.ts
- /src/app/dashboard/audit/page.tsx
- /src/components/audit/AuditReport.tsx
- /src/components/audit/CompetitorGap.tsx
- /src/components/audit/BaselineScore.tsx
NEVER TOUCHES: any other module's data — read only
INPUTS: Business website URL, GSC OAuth token, GBP OAuth token, niche profile, competitor names (up to 3)
OUTPUTS: Full audit report stored in Supabase, baseline scores per category, competitor gap analysis, recommended starting point for all platform modules
DEPENDENCIES: niche-intelligence, dataforseo integration, google-search-console integration, google-business-profile integration
PHASE: 3 (runs automatically at onboarding completion before any module activates)
STATUS: scaffold

AUDIT CHECKS:
- Domain authority score (via DataForSEO)
- Total indexed pages on Google
- Existing backlink count and quality
- GSC impressions and clicks (last 90 days if GSC connected)
- GBP completeness score and review count
- Social media follower counts and posting frequency per platform
- Content posting consistency (last 30 days)
- Top 3 competitor comparison per category above
- Estimated gap to close to reach competitor level

COMPETITOR GAP FORMAT:
For each of the 3 nominated competitors, show:
- Their domain authority vs business domain authority
- Their indexed pages vs business indexed pages
- Their backlink count vs business backlink count
- Their average weekly posts vs business average weekly posts
- Estimated time at current platform pace to close each gap

AUDIT RUNS:
- Once at activation (mandatory, blocks module activation until complete)
- Monthly refresh (automated, Worker 4)
- On-demand from dashboard at any time (business owner button)

---

### MODULE: seo-domination-engine
PURPOSE: Executes the long-term SEO domination strategy. Publishes 2 blog posts daily. Generates and submits indexing requests for every post. Manages Q&A seeding on Quora, Reddit, and niche forums. Builds internal link network automatically. Refreshes content older than 6 months. Detects and fixes keyword cannibalisation. Tracks total indexed pages as a growth metric.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/seo-domination/blog-publisher.ts
- /src/server/seo-domination/qa-seeder.ts
- /src/server/seo-domination/internal-linker.ts
- /src/server/seo-domination/content-refresher.ts
- /src/server/seo-domination/index-tracker.ts
- /src/server/seo-domination/backlink-builder.ts
- /src/workers/analytics/jobs/blog-publish-daily.job.ts
- /src/workers/analytics/jobs/content-refresh.job.ts
- /src/workers/analytics/jobs/qa-seed.job.ts
- /src/workers/analytics/jobs/index-tracker.job.ts
- /src/app/dashboard/seo-domination/page.tsx
- /src/components/seo-domination/IndexGrowthChart.tsx
- /src/components/seo-domination/BlogPublishQueue.tsx
- /src/components/seo-domination/QATaskBoard.tsx
- /src/components/seo-domination/BacklinkTracker.tsx
INPUTS: Niche profile, keyword strategy from seo-engine, trend data from trend-intelligence-engine, GSC OAuth
OUTPUTS: 2 published blog posts daily, Q&A seeds posted, internal links inserted, content refresh jobs, GSC indexing requests, daily index count update
DEPENDENCIES: seo-engine, content-machine, content-safety-checker, google-search-console integration, trend-intelligence-engine, keyword-cannibalisation-detector
PHASE: 4
STATUS: scaffold

BLOG POST SCHEDULE:
- 2 posts per day, every day, indefinitely
- Each post targets a specific keyword from the keyword strategy
- Each post submitted to GSC for indexing immediately after publish
- Each post automatically linked to 3-5 existing related posts (internal linking)
- Posts older than 6 months flagged for refresh — refreshed automatically, resubmitted to GSC

Q&A SEEDING STRATEGY:
- System generates a question relevant to the business niche
- Business owner is shown the question in dashboard with one-click "I posted this" confirmation
- Business owner posts the question manually on Quora, Reddit, or relevant niche forum
- Business owner confirms in dashboard
- System then posts the answer as the business (via API where available, or provides the exact text to paste)
- This method is used because it cannot be automated end-to-end without human posting the question first
- Trustpilot: same model — system generates review request flow, business confirms customer submitted, system responds publicly

INTERNAL LINKING RULE:
- Every new blog post must link to at least 3 existing posts on related topics
- System reads the full post library and selects the most topically relevant posts
- Anchor text is varied — no exact-match over-optimisation
- Internal links are added automatically before publish — no human action required

CONTENT REFRESH RULE:
- Posts older than 6 months are audited monthly by Worker 4
- Refresh adds new information, updates statistics, improves keyword placement
- Refreshed post date is updated, resubmitted to GSC
- This keeps old content ranking instead of decaying

INDEXING TARGET: 10 pages indexed per day (2 new posts + refreshed content + any new pages from other modules)

---

### MODULE: trend-intelligence-engine
PURPOSE: Continuously monitors trending topics, phrases, sounds, hashtags, and formats in the business niche. Feeds trend data into content-machine, seo-domination-engine, and algorithm-scoring-engine. Flags aging trends for phase-out before they hurt content quality.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/trends/trend-monitor.ts
- /src/server/trends/trend-classifier.ts
- /src/server/trends/trend-expiry.ts
- /src/workers/analytics/jobs/trend-scan.job.ts
- /src/workers/analytics/jobs/trend-expiry-check.job.ts
- /src/app/dashboard/trends/page.tsx
- /src/components/trends/TrendAlerts.tsx
- /src/components/trends/TrendCalendar.tsx
INPUTS: Niche profile, social platform trend APIs, Google Trends data, DataForSEO trending keywords
OUTPUTS: Active trend list (keyword, phrase, sound, format), trend score (0-100), expiry flag when trend ages, trend data fed to content-machine and seo-domination-engine
DEPENDENCIES: niche-intelligence, content-machine, seo-domination-engine, dataforseo integration
PHASE: 4
STATUS: scaffold

TREND SOURCES:
- TikTok trending sounds and formats (via TikTok API)
- Instagram Reels trending audio
- Google Trends (rising queries in niche)
- Reddit rising posts in niche subreddits
- DataForSEO trending keyword spikes

TREND LIFECYCLE:
- NEW: trend detected, score assigned, fed into content pipeline immediately
- ACTIVE: trend being used in content generation and SEO posts
- AGING: trend score dropping — system reduces usage frequency automatically
- EXPIRED: trend removed from content pipeline — no more content generated around it
- Platform flags aging and expired trends in dashboard so business owner sees what is being phased out and why

CONTENT INTEGRATION:
- Trending phrases appear in social media captions automatically
- Trending keywords appear in blog post titles and meta descriptions
- Trending sounds flagged in UGC content calendar for creator attention
- Trend data injected into Claude system prompt for all content generation

---

### MODULE: content-recycling-engine
PURPOSE: Every high-performing post, video, or caption is automatically repurposed across formats. A blog post that ranks becomes a LinkedIn post, a TikTok script, a Pinterest pin, and an email. Nothing gets used once.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/recycling/performance-detector.ts
- /src/server/recycling/repurposer.ts
- /src/workers/content/jobs/content-recycle.job.ts
- /src/app/dashboard/content/recycling/page.tsx
- /src/components/content/RecyclingQueue.tsx
INPUTS: Published content performance data from analytics-dashboard, original content from content-machine
OUTPUTS: Repurposed content variants queued to Worker 2 for publishing across all relevant platforms
DEPENDENCIES: content-machine, analytics-dashboard, algorithm-scoring-engine, content-safety-checker, social-media-layer
PHASE: 5
STATUS: scaffold

PERFORMANCE THRESHOLD:
- Blog post: ranks in top 20 for target keyword OR receives 100+ organic visits
- Social post: reaches 2x average engagement rate for that platform
- Video: completion rate above 50% or 500+ views

REPURPOSING MAP:
- Blog post → LinkedIn article, Twitter/X thread, Pinterest pin, email newsletter section, TikTok script
- TikTok video → Instagram Reel, YouTube Short, Facebook video, Pinterest idea pin
- Instagram carousel → LinkedIn carousel, Facebook album, Pinterest board
- Email → WhatsApp broadcast, blog post summary, social captions

SAFETY: All repurposed content passes content-safety-checker before queuing. No repurposed content bypasses this step.

---

### MODULE: entity-builder
PURPOSE: Builds a consistent online entity for each business across all directories, social profiles, and web mentions. Consistent name, address, phone, description, category across every platform Google can see. Entity consistency is what turns a business into an authority Google ranks for years.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/entity/entity-profile.ts
- /src/server/entity/directory-submitter.ts
- /src/server/entity/consistency-checker.ts
- /src/workers/analytics/jobs/entity-consistency-check.job.ts
- /src/app/dashboard/entity/page.tsx
- /src/components/entity/EntityConsistencyScore.tsx
- /src/components/entity/DirectorySubmissionTracker.tsx
INPUTS: Business name, address, phone, website, description, category from Niche Profile
OUTPUTS: Submissions to all major directories, consistency score across all platforms, inconsistency alerts
DEPENDENCIES: niche-intelligence, reputation-layer, google-business-profile-manager
PHASE: 4
STATUS: scaffold

DIRECTORIES TARGETED (submitted automatically):
- Google Business Profile
- Bing Places
- Apple Maps Connect
- Yelp
- Facebook Business
- LinkedIn Company Page
- Yellow Pages
- TripAdvisor (hospitality and food niches)
- Zambian-specific: Zambia Yellow Pages, ZambiaOnline Business Directory, Kopala Business Directory
- Niche-specific directories from NicheProfile

CONSISTENCY RULE:
Business name, address, phone number must be identical across every listing — character for character.
Any variation (e.g. "St." vs "Street", "+260" vs "0") is flagged as an inconsistency.
Inconsistencies are shown in the dashboard with exact fix instructions.
Worker 4 checks consistency monthly.

ENTITY SCORE: 0-100 score showing how consistent and complete the business entity is across the web. This score feeds into client-health-score.

---

### MODULE: reputation-velocity-tracker
PURPOSE: Tracks how fast the business's online presence is growing week over week. Single velocity number visible on Mission Control. Business owner sees the domination happening in real time as a number that compounds every week.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/reputation/velocity-tracker.ts
- /src/workers/analytics/jobs/velocity-update.job.ts
- /src/components/dashboard/ReputationVelocity.tsx
INPUTS: Data from GSC (indexed pages, impressions), GBP (reviews, rating), social platforms (followers, engagement), backlink checker (new backlinks)
OUTPUTS: Weekly velocity score, velocity trend chart, breakdown by category
DEPENDENCIES: seo-domination-engine, entity-builder, analytics-dashboard, google-search-console integration
PHASE: 4
STATUS: scaffold

VELOCITY COMPONENTS:
- New backlinks added this week
- New pages indexed this week
- New reviews received this week
- Net new social followers this week (across all platforms)
- GSC impressions growth vs prior week
- Total score is a weighted composite of all five

DISPLAY: Single number on Mission Control (e.g. "+47 this week"). Clicking opens full breakdown.
WEEKLY TREND: Chart showing velocity week by week. Flat or declining velocity triggers a recommendation in the AI bubble.

---

### MODULE: keyword-cannibalisation-detector
PURPOSE: When thousands of blog posts exist, some begin competing against each other for the same keyword. This module detects cannibalisation automatically and recommends consolidation or redirect before rankings are hurt.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/seo-domination/cannibalisation-detector.ts
- /src/workers/analytics/jobs/cannibalisation-scan.job.ts
- /src/app/dashboard/seo-domination/cannibalisation/page.tsx
- /src/components/seo-domination/CannibalisationReport.tsx
INPUTS: Full blog post library with target keywords, GSC ranking data per URL
OUTPUTS: Cannibalisation report (conflicting posts, affected keyword, recommended action — consolidate or 301 redirect)
DEPENDENCIES: seo-domination-engine, seo-engine, google-search-console integration
PHASE: 5
STATUS: scaffold

DETECTION METHOD:
- Two or more posts targeting same primary keyword AND both receiving impressions in GSC
- System identifies the stronger post (higher ranking, more backlinks, more content) and recommends it as the canonical
- Weaker post recommended for either: (1) consolidation into stronger post, or (2) 301 redirect to stronger post
- Business owner approves the action — system never auto-redirects or deletes

SCAN FREQUENCY: Monthly scan by Worker 4. On-demand from dashboard.

---

### MODULE: client-health-score
PURPOSE: Single composite score per business showing overall platform health. Combines SEO growth, content consistency, review velocity, social engagement, and revenue trend. Visible on super admin dashboard for Quantum Leaf oversight. Visible to business owner on Mission Control.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/analytics/client-health-score.ts
- /src/workers/analytics/jobs/health-score-update.job.ts
- /src/components/dashboard/ClientHealthScore.tsx
- /src/components/admin/ClientHealthOverview.tsx
INPUTS: Data from seo-domination-engine, content-machine, review-campaign-manager, social-media-layer, analytics-dashboard, entity-builder
OUTPUTS: Health score (0-100) per tenant, score breakdown by category, trend (improving/stable/declining), alerts for declining scores
DEPENDENCIES: analytics-dashboard, seo-domination-engine, reputation-velocity-tracker, entity-builder
PHASE: 5
STATUS: scaffold

SCORE COMPONENTS (weighted):
- SEO growth (indexed pages, GSC impressions trend): 25 points
- Content consistency (posts published vs scheduled this week): 20 points
- Review velocity (new reviews this month vs prior month): 20 points
- Social engagement (engagement rate trend across platforms): 20 points
- Entity consistency score: 15 points

SUPER ADMIN VIEW:
All client health scores visible on super admin dashboard in a ranked list.
Filter by: declining, stable, improving.
This allows Quantum Leaf to see at a glance which clients need attention before they churn.

BUSINESS OWNER VIEW:
Health score displayed on Mission Control as a single number with a trend arrow.
Clicking opens full breakdown with specific improvement recommendations.

---

## UGC MODULES

---

### MODULE: ugc-video-ingestion
PURPOSE: Accepts raw video via upload or YouTube URL. Stores in Cloudflare R2. Triggers transcription.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/ugc/ingestion.ts
- /src/workers/content/jobs/ugc-ingest.job.ts
- /src/app/dashboard/ugc/upload/page.tsx
- /src/components/ugc/VideoUploader.tsx
INPUTS: Video file upload or YouTube URL
OUTPUTS: Video stored in R2, transcription job triggered
DEPENDENCIES: whisper-transcription, cloudflare-r2 integration
PHASE: 3
STATUS: scaffold

---

### MODULE: ugc-clip-intelligence
PURPOSE: Claude analyses full transcript with creator profile. Identifies best clip candidates with timestamps. Returns thumbnail previews and text descriptions. No full render until creator approves.
OWNER: Terminal 2
OWNS FILES:
- /src/server/ugc/clip-intelligence.ts
- /src/workers/content/jobs/ugc-clip-identify.job.ts
INPUTS: Full transcript, creator niche profile, video metadata
OUTPUTS: List of clip candidates (timestamp, reason, thumbnail image, platform recommendation)
DEPENDENCIES: ugc-video-ingestion, whisper-transcription, algorithm-scoring-engine
PHASE: 3
STATUS: scaffold

AI MODEL: Gemini 2.5 Pro for long videos (>30min), Sonnet 4.6 for shorter content
PREVIEW: Thumbnail image at timestamp + text description. Full render only after approval.

---

### MODULE: ugc-render-pipeline
PURPOSE: FFmpeg cuts approved clips. Remotion renders with captions, zooms, music, branding. Generates platform-optimised exports.
OWNER: Terminal 2
OWNS FILES:
- /src/workers/content/jobs/ugc-render.job.ts
- /src/server/ugc/renderer.ts
- /src/server/ugc/platform-exporter.ts
INPUTS: Approved clip timestamps, creator brand assets, platform targets
OUTPUTS: Rendered clips in R2 (9:16 TikTok, 16:9 YouTube, 1:1 Instagram)
DEPENDENCIES: cloudflare-r2 integration, content-safety-checker, algorithm-scoring-engine
PHASE: 4
STATUS: scaffold

---

### MODULE: ugc-monetisation-intelligence
PURPOSE: Tracks YouTube monetisation thresholds, brand deal readiness, affiliate link management, sponsored content disclosures.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/ugc/monetisation.ts
- /src/app/dashboard/ugc/monetisation/page.tsx
- /src/components/ugc/MonetisationTracker.tsx
INPUTS: Channel analytics (subscribers, watch hours, engagement)
OUTPUTS: Monetisation progress tracker, brand deal readiness score, affiliate link injection in descriptions
DEPENDENCIES: analytics-dashboard, youtube integration
PHASE: 5
STATUS: scaffold

---

### MODULE: ugc-podcast-support
PURPOSE: Audio ingestion, transcription, audiogram generation for social, show notes, podcast SEO.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/ugc/podcast.ts
- /src/workers/content/jobs/podcast-process.job.ts
- /src/app/dashboard/ugc/podcast/page.tsx
INPUTS: Audio file upload
OUTPUTS: Audiogram video for social posting, show notes, episode descriptions, SEO metadata
DEPENDENCIES: whisper-transcription, ugc-render-pipeline, social-media-layer
PHASE: 5
STATUS: scaffold

---

## FACELESS CHANNEL MODULES

---

### MODULE: faceless-character-studio
PURPOSE: Business describes characters in plain language. System builds structured profile. ElevenLabs voice assigned and auditioned.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/faceless/character-studio.ts
- /src/app/dashboard/faceless/characters/page.tsx
- /src/components/faceless/CharacterBuilder.tsx
- /src/components/faceless/VoiceAudition.tsx
INPUTS: Plain language character descriptions, voice preferences
OUTPUTS: Structured character profiles in Supabase, ElevenLabs voice ID assigned
DEPENDENCIES: elevenlabs integration
PHASE: 4
STATUS: scaffold

---

### MODULE: faceless-storyline-editor
PURPOSE: Collaborative story development. Claude proposes, human directs. Series bible, episode outlines, iterative feedback.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/faceless/storyline-editor.ts
- /src/app/dashboard/faceless/storyline/page.tsx
- /src/components/faceless/StorylineEditor.tsx
- /src/components/faceless/EpisodeOutliner.tsx
INPUTS: Series premise, genre, episode length format, locked plot points
OUTPUTS: Series bible, episode outlines (10-12 per season), scene breakdowns
DEPENDENCIES: faceless-series-bible, faceless-episode-outliner, faceless-audience-intelligence
PHASE: 4
STATUS: scaffold

AI MODEL: Sonnet 4.6 for story generation, Opus 4.6 for complex multi-episode arc planning
AUDIENCE INTELLIGENCE: After each episode posts, comment analysis feeds back into storyline suggestions

---

### MODULE: faceless-runway-pipeline
PURPOSE: Submits scene descriptions to RunwayML Gen-3. Receives generated video scenes. Premium tier only, AI Scene flag required, monthly quota enforced.
OWNER: Terminal 2
OWNS FILES:
- /src/workers/ai-scene/jobs/runway-generate.job.ts
- /src/server/faceless/runway-pipeline.ts
INPUTS: Scene descriptions from faceless-scene-breakdown, RunwayML credentials
OUTPUTS: Generated video scene files in R2
DEPENDENCIES: runway integration (Worker 3 only), cloudflare-r2 integration
PHASE: 4
STATUS: scaffold

---

### MODULE: faceless-thumbnail-generator
PURPOSE: Generates episode thumbnails. Claude creates concept, Imagen 3 generates image, Remotion composites text overlay and branding. A/B testing tracked over time.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/faceless/thumbnail-generator.ts
- /src/workers/content/jobs/thumbnail-generate.job.ts
- /src/components/faceless/ThumbnailPreview.tsx
INPUTS: Episode content description, brand assets, previous thumbnail performance data
OUTPUTS: Two thumbnail variants, A/B test tracking, winner identified from click-through data
DEPENDENCIES: imagen-3 integration, remotion, analytics-dashboard
PHASE: 4
STATUS: scaffold

---

## APP DEVELOPER MODULES

---

### MODULE: app-profile-engine
PURPOSE: Ingests a developer's application via App Store URL and developer account connection. Extracts app name, category, description, keywords, screenshots, color palette, reviews, rating, and competitor landscape. Builds a structured App Profile used by all other app modules.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/app-developer/app-profile-engine.ts
- /src/server/app-developer/app-store-crawler.ts
- /src/server/app-developer/color-extractor.ts
- /src/server/app-developer/competitor-analyzer.ts
- /src/app/dashboard/app-developer/profile/page.tsx
- /src/components/app-developer/AppProfileSetup.tsx
- /src/components/app-developer/AppPreview.tsx
NEVER TOUCHES: any worker file, any other user type module
INPUTS: Google Play Store URL, Apple App Store URL, developer account OAuth tokens, plain language app description from onboarding interview
OUTPUTS: Structured AppProfile stored in Supabase
DEPENDENCIES: google-play-console integration, apple-app-store-connect integration, niche-intelligence, onboarding-engine
PHASE: 3
STATUS: scaffold

---

### MODULE: app-store-optimizer
PURPOSE: Full App Store Optimization (ASO) automation. Rewrites title, subtitle, description, and keyword fields with optimized copy. Generates new screenshot overlays. Monitors keyword rankings weekly. A/B tests descriptions. Submits updates via developer account API.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/app-developer/aso-optimizer.ts
- /src/server/app-developer/keyword-researcher.ts
- /src/server/app-developer/screenshot-generator.ts
- /src/server/app-developer/aso-ab-tester.ts
- /src/workers/analytics/jobs/aso-rank-check.job.ts
- /src/workers/content/jobs/aso-update.job.ts
- /src/app/dashboard/app-developer/aso/page.tsx
- /src/components/app-developer/ASODashboard.tsx
- /src/components/app-developer/KeywordTracker.tsx
- /src/components/app-developer/ScreenshotEditor.tsx
INPUTS: AppProfile, current store listing data, competitor keyword data
OUTPUTS: Optimized listing copy submitted to stores, keyword ranking reports, A/B test results
DEPENDENCIES: app-profile-engine, google-play-console integration, apple-app-store-connect integration, vertex-ai-claude, imagen-3
PHASE: 4
STATUS: scaffold

---

### MODULE: app-review-monitor
PURPOSE: Monitors new reviews on both stores via official APIs. Drafts and posts replies.
OWNER: Terminal 2
OWNS FILES:
- /src/server/app-developer/review-monitor.ts
- /src/server/app-developer/review-responder.ts
- /src/workers/analytics/jobs/app-review-check.job.ts
- /src/workers/publishing/jobs/app-review-reply.job.ts
- /src/app/dashboard/app-developer/reviews/page.tsx
- /src/components/app-developer/ReviewFeed.tsx
INPUTS: New reviews from Play Console API and App Store Connect API
OUTPUTS: Drafted replies posted via official APIs, review sentiment logged
DEPENDENCIES: app-profile-engine, google-play-console integration, apple-app-store-connect integration, content-safety-checker, approval-queue
PHASE: 4
STATUS: scaffold

---

### MODULE: app-content-generator
PURPOSE: Generates all promotional content for the app across all platforms.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/app-developer/app-content-generator.ts
- /src/server/app-developer/poster-generator.ts
- /src/server/app-developer/app-short-generator.ts
- /src/server/app-developer/app-tutorial-generator.ts
- /src/workers/content/jobs/app-poster.job.ts
- /src/workers/content/jobs/app-short.job.ts
- /src/workers/content/jobs/app-tutorial.job.ts
- /src/app/dashboard/app-developer/content/page.tsx
- /src/components/app-developer/AppContentCalendar.tsx
- /src/components/app-developer/AppContentQueue.tsx
INPUTS: AppProfile, app screenshots, color palette, monetisation model, feature list
OUTPUTS: Promotional posters, YouTube Shorts, TikTok videos, Instagram carousels, blog posts, Pinterest pins
DEPENDENCIES: app-profile-engine, content-machine, algorithm-scoring-engine, content-safety-checker, social-media-layer
PHASE: 4
STATUS: scaffold

---

### MODULE: app-support-inbox
PURPOSE: Unified support inbox for the developer's app users across all channels.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/app-developer/support-inbox.ts
- /src/server/app-developer/support-knowledge-base.ts
- /src/server/app-developer/webhook-receiver.ts
- /src/app/api/app-support/webhook/route.ts
- /src/app/dashboard/app-developer/support/page.tsx
- /src/components/app-developer/SupportInbox.tsx
- /src/components/app-developer/SupportKnowledgeBase.tsx
INPUTS: Support tickets from in-app webhook, WhatsApp messages, email
OUTPUTS: AI responses to app users, tickets logged, unresolved tickets flagged to developer
DEPENDENCIES: knowledge-base-builder, notification-engine, content-safety-checker
PHASE: 4
STATUS: scaffold

---

### MODULE: app-payment-intelligence
PURPOSE: Connects developer's app payment infrastructure. Pulls revenue analytics. Monitors conversion rates.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/app-developer/payment-intelligence.ts
- /src/server/app-developer/revenue-tracker.ts
- /src/workers/analytics/jobs/app-revenue-sync.job.ts
- /src/app/dashboard/app-developer/revenue/page.tsx
- /src/components/app-developer/RevenueAnalytics.tsx
INPUTS: Payment provider credentials (Google Play Billing, RevenueCat, or custom backend API)
OUTPUTS: Revenue dashboard, pricing data fed into all AI content generation
DEPENDENCIES: app-profile-engine, app-analytics-dashboard
PHASE: 4
STATUS: scaffold

---

### MODULE: app-analytics-dashboard
PURPOSE: Unified analytics view for app developers combining all data sources.
OWNER: Terminal 1 (UI) + Terminal 2 (data)
OWNS FILES:
- /src/app/dashboard/app-developer/analytics/page.tsx
- /src/components/app-developer/AppAnalyticsDashboard.tsx
- /src/components/app-developer/DownloadTrends.tsx
- /src/components/app-developer/ASOPerformance.tsx
- /src/components/app-developer/RevenueChart.tsx
- /src/components/app-developer/ContentPerformance.tsx
INPUTS: Data from all app developer modules, store APIs, social platform analytics
OUTPUTS: Unified visual dashboard, weekly performance report
DEPENDENCIES: app-profile-engine, app-store-optimizer, app-review-monitor, app-content-generator, app-payment-intelligence
PHASE: 5
STATUS: scaffold

---

## SHARED MODULES

---

### MODULE: ai-bubble-assistant
PURPOSE: Floating AI assistant present on all dashboard types. Accepts voice input (Whisper transcription), text input, uploaded videos, images, and PDFs. Can pull live stats from the full business database, execute approved actions, generate content on demand, schedule content based on uploaded inspiration, and answer questions about business revenue, expenses, projections, and customer data. Never executes irreversible actions without confirmation.
OWNER: Terminal 1 (UI) + Terminal 2 (action handler)
OWNS FILES:
- /src/components/shared/AIBubble.tsx
- /src/components/shared/AIBubbleChat.tsx
- /src/components/shared/AIBubbleUpload.tsx
- /src/server/bubble/action-handler.ts
- /src/server/bubble/stat-retriever.ts
- /src/server/bubble/inspiration-analyser.ts
- /src/server/bubble/database-query-handler.ts
- /src/app/api/bubble/chat/route.ts
- /src/app/api/bubble/upload/route.ts
INPUTS: Voice or text input, uploaded video/image/PDF inspiration files, full dashboard context injected, full business database access (read-only for queries)
OUTPUTS: Stats, generated content, scheduled content from inspiration, executed actions (with confirmation for irreversible ones), conversational responses including revenue projections, sales summaries, daily performance reports
DEPENDENCIES: whisper-transcription, all data modules, all action modules, cloudflare-r2 integration
PHASE: 7 (built last — needs all other modules to exist first)
STATUS: scaffold

AI MODEL: Sonnet 4.6
VIDEO INSPIRATION ANALYSIS: Gemini 2.5 Pro (handles long video analysis)
IMAGE/PDF ANALYSIS: Sonnet 4.6 with vision
SESSION MEMORY: Remembers conversation context within the same session only
IRREVERSIBLE ACTIONS REQUIRING CONFIRMATION: Delete content, disconnect account, cancel subscription, bulk operations

INSPIRATION UPLOAD FLOW:
1. Business owner uploads a video, image, or PDF to the bubble
2. System analyses the content (Gemini 2.5 Pro for video, Sonnet 4.6 for image/PDF)
3. Bubble presents analysis: "This video uses [format/style/hook]. Here is how we can replicate this for your [niche] business."
4. Business owner can say: "Schedule my next 3 days of content based on this style"
5. System generates content plan, shows it to business owner for approval
6. On approval, content is queued to Worker 2 for publishing at scheduled times
7. All generated content still passes safety check and algorithm scoring before queuing

DATABASE QUERY CAPABILITY:
The bubble can answer any question about the business using live data:
- "What was my revenue this week?"
- "How many new customers did I get this month?"
- "What is my best performing post this year?"
- "Project my revenue for next quarter based on current trend"
- "Give me a sales summary for today"
- "Which platform is bringing me the most leads?"
All answers come from live Supabase data for that tenant. No data from other tenants is ever accessible.

---

### MODULE: oauth-token-manager
PURPOSE: Manages lifecycle of all OAuth tokens. Validation before every use. Auto-refresh where possible. 72-hour expiry alerts for manual refresh platforms. Held posts preserved on expiry.
OWNER: Terminal 3
OWNS FILES:
- /src/lib/security/oauth-token-manager.ts
- /src/workers/publishing/jobs/token-refresh.job.ts
INPUTS: OAuth tokens from api-key-manager, platform refresh endpoints
OUTPUTS: Valid tokens delivered to publishing worker, expiry alerts, held posts on expiry
DEPENDENCIES: api-key-manager, notification-engine
PHASE: 3
STATUS: scaffold

AUTO-REFRESH PLATFORMS: Meta (Facebook, Instagram), LinkedIn
MANUAL REFRESH PLATFORMS: TikTok (72-hour advance alert with one-click reconnect)
HELD POSTS: Never deleted on token expiry. Queued for retry when token is refreshed.

---

### MODULE: notification-engine
PURPOSE: Delivers all notifications across in-app, WhatsApp, and email channels. Routes correct channels per notification type.
OWNER: Terminal 2
OWNS FILES:
- /src/server/notifications/notification-engine.ts
- /src/server/notifications/whatsapp-notifier.ts
- /src/server/notifications/email-notifier.ts
- /src/server/notifications/inapp-notifier.ts
INPUTS: Notification event, type, tenant_id, message content
OUTPUTS: Delivered notifications across configured channels
DEPENDENCIES: whatsapp-business-api integration, supabase realtime
PHASE: 3
STATUS: scaffold

---

### MODULE: whisper-transcription
PURPOSE: Self-hosted Whisper on Hetzner. Handles all transcription. UGC videos, faceless scripts, voice bubble input, call transcripts, uploaded inspiration videos.
OWNER: Terminal 2
OWNS FILES:
- /src/server/transcription/whisper-client.ts
- /src/workers/content/jobs/transcribe.job.ts
INPUTS: Audio or video file path in R2 or local
OUTPUTS: Full transcript text with timestamps
DEPENDENCIES: none (self-contained service)
PHASE: 2
STATUS: scaffold

COST: Zero. Self-hosted. No API fees.

---

### MODULE: bullmq-job-registry
PURPOSE: Central registry of all BullMQ job types, their queues, their retry policies, their priority levels.
OWNER: Terminal 2
OWNS FILES:
- /src/lib/queue/job-registry.ts
- /src/lib/queue/queue-factory.ts
- /src/lib/queue/priority-levels.ts
INPUTS: Job type requests from all modules
OUTPUTS: Properly configured BullMQ jobs added to correct queues with correct priorities
DEPENDENCIES: none
PHASE: 1
STATUS: scaffold

---

### MODULE: media-storage-manager
PURPOSE: All interactions with Cloudflare R2. Upload, retrieve, delete, generate signed URLs. Never stores media elsewhere.
OWNER: Terminal 2
OWNS FILES:
- /src/lib/storage/r2-client.ts
- /src/lib/storage/media-manager.ts
INPUTS: File buffers, file paths, retrieval requests
OUTPUTS: R2 public URLs, signed URLs for private content, deletion confirmations
DEPENDENCIES: none
PHASE: 2
STATUS: scaffold

---

## ADMIN MODULES

---

### MODULE: super-admin-dashboard
PURPOSE: Full platform control. Business approval/suspension/refund. Niche research review. App publishing pipeline. Platform health. Per-client cost breakdown. Dead job monitor. Client health scores overview.
OWNER: Terminal 1 (UI) + Terminal 2 (data + actions)
OWNS FILES:
- /src/app/admin/page.tsx
- /src/app/admin/businesses/page.tsx
- /src/app/admin/approvals/page.tsx
- /src/app/admin/niches/page.tsx
- /src/app/admin/apps/page.tsx
- /src/app/admin/health/page.tsx
- /src/app/admin/costs/page.tsx
- /src/app/admin/dead-jobs/page.tsx
- /src/components/admin/BusinessManager.tsx
- /src/components/admin/CostBreakdown.tsx
- /src/components/admin/DeadJobMonitor.tsx
- /src/components/admin/PlatformHealth.tsx
- /src/components/admin/ClientHealthOverview.tsx
INPUTS: All platform data across all tenants
OUTPUTS: Administrative actions (approve, suspend, refund, credit grant, niche approval, app publishing)
DEPENDENCIES: All modules
PHASE: 2 (mock) → 3 (real)
STATUS: scaffold

---

### MODULE: reseller-dashboard
PURPOSE: Agency/reseller view. Own branding, own client list, own pricing. Cannot see other resellers' clients. Cannot change core platform features.
OWNER: Terminal 1 (UI) + Terminal 2 (data)
OWNS FILES:
- /src/app/reseller/page.tsx
- /src/app/reseller/clients/page.tsx
- /src/app/reseller/pricing/page.tsx
- /src/components/reseller/ClientOverview.tsx
- /src/components/reseller/PricingManager.tsx
INPUTS: Reseller's client accounts data
OUTPUTS: Client performance overview, pricing configuration, branding settings
DEPENDENCIES: super-admin-dashboard, tier-system
PHASE: 6
STATUS: scaffold

---

### MODULE: platform-health-monitor
PURPOSE: Real-time monitoring of all worker containers, Redis, Supabase connection, API response times. Dead job count. Error rates per tenant.
OWNER: Terminal 2 (logic) + Terminal 1 (UI)
OWNS FILES:
- /src/server/monitoring/health-checker.ts
- /src/app/admin/health/page.tsx
- /src/components/admin/PlatformHealth.tsx
INPUTS: Worker container health, Redis ping, Supabase connection, BullMQ queue depths
OUTPUTS: Health status dashboard, alerts on anomalies
DEPENDENCIES: bullmq-job-registry
PHASE: 3
STATUS: scaffold
