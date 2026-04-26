# QUANTUM NEXUS — INTEGRATIONS.md
# Version: 2.0.0 | Status: LOCKED
# Read CLAUDE.md, ARCHITECTURE.md, and MODULES.md before reading this file.
# Every third-party integration is defined here.
# Build order is defined at the bottom of this file.
# Version 2.0 adds Google Trends integration. All existing integrations unchanged.

---

## INTEGRATION DEFINITION FORMAT

Each integration contains:
- NAME: exact identifier used in code
- PURPOSE: what it does in the system
- AUTH METHOD: how authentication works
- FILE LOCATION: where the real integration lives
- PLACEHOLDER PATTERN: exact mock to use in Phase 1 and 2
- RATE LIMITS: known limits to enforce
- RETRY BEHAVIOUR: how failures are handled
- TOKEN REFRESH: how token expiry is managed
- WORKER: which BullMQ worker handles this integration
- PHASE: when this gets connected with real credentials
- STATUS: placeholder | connected | tested | production

---

## AI INTEGRATIONS

---

### INTEGRATION: vertex-ai-claude
NAME: vertex-ai-claude
PURPOSE: Primary AI brain. Content generation, onboarding interview, niche research, call responses, safety checks, algorithm scoring, bubble database queries, SEO blog generation, entity building, inspiration analysis.
AUTH METHOD: Google Cloud service account JSON credentials (VERTEX_AI_CREDENTIALS env var) + project ID (VERTEX_AI_PROJECT_ID env var)
FILE LOCATION: /src/lib/integrations/ai/vertex-claude.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: VERTEX_AI_CLAUDE — AI content generation
// REAL INTEGRATION: /src/lib/integrations/ai/vertex-claude.ts
// PHASE: 3
const result = MOCK_DATA.ai.generateContent({ prompt, systemPrompt, model });
```
SWITCHABLE CONFIG:
```typescript
const AI_PROVIDER = process.env.AI_PROVIDER; // 'vertex' or 'anthropic'
async function callClaude(params: ClaudeParams) {
  if (AI_PROVIDER === 'vertex') return callVertexClaude(params);
  return callDirectAnthropic(params);
}
```
MODELS AVAILABLE: claude-sonnet-4-6, claude-haiku-4-5, claude-opus-4-6
RATE LIMITS: Vary by model and project quota. Implement exponential backoff on 429 responses.
RETRY BEHAVIOUR: 3 retries with exponential backoff. On final failure, job goes to dead queue.
WORKER: Worker 1 (content generation), inline for API routes (call handling, bubble queries)
PHASE: 3
STATUS: placeholder

---

### INTEGRATION: vertex-ai-gemini
NAME: vertex-ai-gemini
PURPOSE: Long video analysis (Gemini 2.5 Pro), inspiration video analysis (Gemini 2.5 Pro), bulk fast tasks and trend scanning (Gemini 2.0 Flash), image generation (Imagen 3).
AUTH METHOD: Same Google Cloud credentials as vertex-ai-claude
FILE LOCATION: /src/lib/integrations/ai/vertex-gemini.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: VERTEX_AI_GEMINI — Long video analysis / image generation
// REAL INTEGRATION: /src/lib/integrations/ai/vertex-gemini.ts
// PHASE: 3
const result = MOCK_DATA.ai.analyzeVideo({ videoUrl, prompt });
```
MODELS: gemini-2.5-pro, gemini-2.0-flash, imagen-3
WORKER: Worker 1
PHASE: 3
STATUS: placeholder

---

### INTEGRATION: elevenlabs
NAME: elevenlabs
PURPOSE: Voice synthesis for inbound call responses and faceless channel character voices.
AUTH METHOD: API key (ELEVENLABS_API_KEY env var)
FILE LOCATION: /src/lib/integrations/voice/elevenlabs.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: ELEVENLABS — Voice synthesis
// REAL INTEGRATION: /src/lib/integrations/voice/elevenlabs.ts
// PHASE: 3
const audioBuffer = MOCK_DATA.voice.synthesize({ text, voiceId });
```
RATE LIMITS: Depends on ElevenLabs plan tier. Implement queue-based throttling.
VOICE MANAGEMENT: Each business gets an assigned voice from your ElevenLabs account. Voice IDs stored per tenant in Supabase.
WORKER: Worker 1 (voice generation), inline for real-time call handling
PHASE: 3
STATUS: placeholder

---

### INTEGRATION: runway-ml
NAME: runway-ml
PURPOSE: AI video scene generation for premium tier only, AI Scene flagged content only.
AUTH METHOD: API key (RUNWAY_API_KEY env var)
FILE LOCATION: /src/lib/integrations/video/runway.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: RUNWAY_ML — AI video scene generation
// REAL INTEGRATION: /src/lib/integrations/video/runway.ts
// PHASE: 4
const videoScene = MOCK_DATA.video.generateScene({ description, duration, style });
```
RATE LIMITS: One job at a time (Worker 3 concurrency: 1). Minimum 30 seconds between job starts.
QUOTA ENFORCEMENT: Monthly quota per tier stored in Supabase. Check before every job. Reject if quota exhausted.
TIER CHECK: Must be premium tier. Reject with clear error message if not.
WORKER: Worker 3 exclusively. Never called from any other worker or API route.
PHASE: 4
STATUS: placeholder

---

### INTEGRATION: whisper-stt
NAME: whisper-stt
PURPOSE: Self-hosted Whisper for all transcription. UGC videos, call transcripts, bubble voice input, uploaded inspiration videos. Zero cost.
AUTH METHOD: Internal HTTP call to local Whisper service on Hetzner (WHISPER_SERVICE_URL env var)
FILE LOCATION: /src/lib/integrations/transcription/whisper.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: WHISPER_STT — Audio/video transcription
// REAL INTEGRATION: /src/lib/integrations/transcription/whisper.ts
// PHASE: 2
const transcript = MOCK_DATA.transcription.transcribe({ fileUrl, language });
```
WORKER: Worker 1
PHASE: 2 (self-hosted, no external API needed)
STATUS: placeholder
NOTE: This is not an external service. It runs on Hetzner. Deploy Whisper as a Docker container via Coolify before Phase 3 begins.

---

## SOCIAL MEDIA INTEGRATIONS

---

### INTEGRATION: meta-graph-api
NAME: meta-graph-api
PURPOSE: Facebook Page posting, Instagram Business posting, comment reading and replying, Instagram DM handling, Facebook Messenger handling, page insights.
AUTH METHOD: OAuth 2.0. Business connects via Facebook OAuth flow. Long-lived Page Access Token stored encrypted in Supabase.
FILE LOCATION: /src/lib/integrations/social/meta.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: META_GRAPH_API — Facebook/Instagram posting and engagement
// REAL INTEGRATION: /src/lib/integrations/social/meta.ts
// PHASE: 3
const result = MOCK_DATA.social.meta.post({ pageId, content, mediaUrl });
```
RATE LIMITS: 200 calls/hour per access token. System never exceeds 150/hour. Queue throttling enforced in Worker 2.
TOKEN REFRESH: Meta long-lived tokens last 60 days. Auto-refresh 10 days before expiry. System handles background refresh.
TOKEN EXPIRY ALERT: 72-hour advance in-app + WhatsApp + email notification if refresh fails.
WORKER: Worker 2
SCOPE REQUIRED: pages_manage_posts, pages_read_engagement, instagram_basic, instagram_content_publish, pages_messaging, instagram_manage_messages
PHASE: 3
STATUS: placeholder

---

### INTEGRATION: tiktok-developer
NAME: tiktok-developer
PURPOSE: Video publishing, comment reading and replying, video analytics, trending sound data for trend-intelligence-engine.
AUTH METHOD: OAuth 2.0. Business connects TikTok Business Account via TikTok OAuth. Access token stored encrypted in Supabase.
FILE LOCATION: /src/lib/integrations/social/tiktok.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: TIKTOK_DEVELOPER — TikTok video posting and engagement
// REAL INTEGRATION: /src/lib/integrations/social/tiktok.ts
// PHASE: 3
const result = MOCK_DATA.social.tiktok.uploadVideo({ videoUrl, caption, hashtags });
```
RATE LIMITS: Per TikTok developer documentation. Implement backoff on 429.
TOKEN REFRESH: TikTok requires manual re-authentication. No background refresh.
TOKEN EXPIRY ALERT: 72-hour advance alert to business with one-click reconnect button.
ELEVATED ACCESS: Content Posting API requires application to TikTok for elevated access. Guide business through this during onboarding.
WORKER: Worker 2
PHASE: 3
STATUS: placeholder

---

### INTEGRATION: linkedin-api
NAME: linkedin-api
PURPOSE: Company Page posting, post analytics, comment management.
AUTH METHOD: OAuth 2.0. Business connects LinkedIn Company Page via OAuth. Access token stored encrypted.
FILE LOCATION: /src/lib/integrations/social/linkedin.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: LINKEDIN_API — LinkedIn Company Page posting
// REAL INTEGRATION: /src/lib/integrations/social/linkedin.ts
// PHASE: 3
const result = MOCK_DATA.social.linkedin.createPost({ organizationId, content, mediaUrl });
```
RATE LIMITS: Per LinkedIn API documentation. Daily application-level limits apply.
TOKEN REFRESH: LinkedIn access tokens last 60 days. Auto-refresh supported.
GATED: Company Pages only. Personal profiles not supported. Business must have existing Company Page.
WORKER: Worker 2
PHASE: 3
STATUS: placeholder

---

### INTEGRATION: reddit-api
NAME: reddit-api
PURPOSE: Community post submission, comment engagement, Q&A answer posting for seo-domination-engine.
AUTH METHOD: OAuth 2.0. Business connects existing Reddit account via OAuth.
FILE LOCATION: /src/lib/integrations/social/reddit.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: REDDIT_API — Reddit community posting
// REAL INTEGRATION: /src/lib/integrations/social/reddit.ts
// PHASE: 3
const result = MOCK_DATA.social.reddit.submitPost({ subreddit, title, content });
```
RATE LIMITS: 60 requests/minute. Conservative posting — value-first, not volume.
GATED: Business must have existing Reddit account. No new account creation by platform.
WORKER: Worker 2
PHASE: 3
STATUS: placeholder

---

### INTEGRATION: youtube-data-api
NAME: youtube-data-api
PURPOSE: Video upload, title/description/tags/chapters management, comment reading and replying, analytics, trending video data for trend-intelligence-engine.
AUTH METHOD: OAuth 2.0 via Google. Business connects YouTube channel.
FILE LOCATION: /src/lib/integrations/social/youtube.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: YOUTUBE_DATA_API — YouTube video upload and management
// REAL INTEGRATION: /src/lib/integrations/social/youtube.ts
// PHASE: 3
const result = MOCK_DATA.social.youtube.uploadVideo({ videoUrl, title, description, tags });
```
TOKEN REFRESH: Google OAuth refresh tokens do not expire if used regularly. Auto-refresh supported.
WORKER: Worker 2
PHASE: 3
STATUS: placeholder

---

### INTEGRATION: pinterest-api
NAME: pinterest-api
PURPOSE: Pin scheduling, board management, analytics.
AUTH METHOD: OAuth 2.0. Business connects Pinterest Business Account.
FILE LOCATION: /src/lib/integrations/social/pinterest.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: PINTEREST_API — Pinterest pin scheduling
// REAL INTEGRATION: /src/lib/integrations/social/pinterest.ts
// PHASE: 3
const result = MOCK_DATA.social.pinterest.createPin({ boardId, imageUrl, title, description, link });
```
WORKER: Worker 2
PHASE: 3
STATUS: placeholder

---

## GOOGLE INTEGRATIONS

---

### INTEGRATION: google-search-console
NAME: google-search-console
PURPOSE: Sitemap submission (daily), new page indexing requests, rank tracking, crawl error detection. Used by both seo-engine and seo-domination-engine.
AUTH METHOD: OAuth 2.0. Business connects GSC via Google OAuth. Service account or user OAuth.
FILE LOCATION: /src/lib/integrations/google/gsc.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: GOOGLE_SEARCH_CONSOLE — Sitemap and indexing management
// REAL INTEGRATION: /src/lib/integrations/google/gsc.ts
// PHASE: 3
const result = MOCK_DATA.seo.gsc.submitSitemap({ siteUrl, sitemapUrl });
```
WORKER: Worker 4
SCHEDULE: Sitemap submission daily at 6am. New page indexing triggered immediately on publish. Indexing count updated in real-time for Mission Control feed.
PHASE: 3
STATUS: placeholder

---

### INTEGRATION: google-analytics-4
NAME: google-analytics-4
PURPOSE: Website traffic data, conversion tracking, user behaviour analysis.
AUTH METHOD: OAuth 2.0 via Google.
FILE LOCATION: /src/lib/integrations/google/ga4.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: GOOGLE_ANALYTICS_4 — Traffic and conversion data
// REAL INTEGRATION: /src/lib/integrations/google/ga4.ts
// PHASE: 3
const result = MOCK_DATA.analytics.ga4.getTrafficData({ propertyId, dateRange });
```
WORKER: Worker 4
PHASE: 3
STATUS: placeholder

---

### INTEGRATION: google-business-profile
NAME: google-business-profile
PURPOSE: Weekly post automation, review response, Q&A management, insights pulling. Review detection for review-campaign-manager.
AUTH METHOD: OAuth 2.0 via Google.
FILE LOCATION: /src/lib/integrations/google/gbp.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: GOOGLE_BUSINESS_PROFILE — GBP post and review management
// REAL INTEGRATION: /src/lib/integrations/google/gbp.ts
// PHASE: 3
const result = MOCK_DATA.gbp.createPost({ locationId, summary, mediaUrl });
```
WORKER: Worker 2 (posting), Worker 4 (insights)
PHASE: 3
STATUS: placeholder

---

### INTEGRATION: google-trends
NAME: google-trends
PURPOSE: Rising search query data per niche for trend-intelligence-engine. Identifies keyword spikes before they peak so content can be created while the trend is still climbing.
AUTH METHOD: No OAuth required — Google Trends data accessed via DataForSEO Trends endpoint (uses existing DataForSEO credentials)
FILE LOCATION: /src/lib/integrations/seo/google-trends.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: GOOGLE_TRENDS — Rising keyword trend data
// REAL INTEGRATION: /src/lib/integrations/seo/google-trends.ts
// PHASE: 4
const result = MOCK_DATA.trends.google.getRisingQueries({ niche, location, timeframe });
```
RATE LIMITS: Per DataForSEO API limits. Batched daily — no real-time calls.
WORKER: Worker 4 (daily trend scan job)
PHASE: 4
STATUS: placeholder
NOTE: Google Trends data is pulled via DataForSEO's Trends endpoint — no separate API key needed. Uses existing DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD credentials.

---

## COMMUNICATION INTEGRATIONS

---

### INTEGRATION: twilio
NAME: twilio
PURPOSE: Inbound call receiving, outbound AI cold calling, SMS delivery, caller ID management (one number per business from master account).
AUTH METHOD: API credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN env vars)
FILE LOCATION: /src/lib/integrations/communication/twilio.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: TWILIO — Call and SMS handling
// REAL INTEGRATION: /src/lib/integrations/communication/twilio.ts
// PHASE: 3
const result = MOCK_DATA.communication.twilio.handleInboundCall({ callSid, from, to });
```
NUMBER MANAGEMENT: One Twilio number provisioned per business from master account. Number mapped to tenant_id in Supabase. Business sees their number in dashboard — never sees Twilio credentials.
INBOUND CALLS: Twilio webhook to /api/calls/inbound → identify business by number → build system prompt → ElevenLabs + Claude conversation loop
WORKER: Inline for real-time calls. Worker 2 for scheduled outbound campaigns.
PHASE: 3
STATUS: placeholder

---

### INTEGRATION: whatsapp-business-api
NAME: whatsapp-business-api
PURPOSE: Customer messaging, broadcast delivery, business notification delivery, birthday messages, review requests, follow-ups, Q&A task notifications to business owner.
AUTH METHOD: Meta Business API. Business connects their WhatsApp Business Account via Meta OAuth.
FILE LOCATION: /src/lib/integrations/communication/whatsapp.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: WHATSAPP_BUSINESS_API — WhatsApp messaging
// REAL INTEGRATION: /src/lib/integrations/communication/whatsapp.ts
// PHASE: 3
const result = MOCK_DATA.communication.whatsapp.sendMessage({ to, message, templateId });
```
RATE LIMITS: Per Meta WhatsApp Business API documentation. Conversation-based pricing applies.
WORKER: Worker 2
PHASE: 3
STATUS: placeholder

---

## PAYMENT INTEGRATIONS

---

### INTEGRATION: lenco
NAME: lenco
PURPOSE: Platform billing. Monthly invoice generation, payment tracking, refund processing.
AUTH METHOD: Lenco API credentials (LENCO_API_KEY env var)
FILE LOCATION: /src/lib/integrations/payments/lenco.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: LENCO — Platform billing and payment tracking
// REAL INTEGRATION: /src/lib/integrations/payments/lenco.ts
// PHASE: 3
const result = MOCK_DATA.payments.lenco.getTransactions({ accountId, dateRange });
```
WORKER: Worker 4 (daily payment check job)
PHASE: 3
STATUS: placeholder

### INTEGRATION: business-payment-plugin
NAME: business-payment-plugin
PURPOSE: Each business connects their own payment provider for customer-facing payments. System routes payment queries to their configured provider.
AUTH METHOD: Business provides their own credentials during onboarding. Stored encrypted per tenant.
FILE LOCATION: /src/lib/integrations/payments/payment-router.ts
SUPPORTED PROVIDERS: Lenco, MTN MoMo, Airtel Money, Stripe, Flutterwave, PayChangu, Custom (business pastes API credentials)
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: BUSINESS_PAYMENT_PLUGIN — Customer-facing payment routing
// REAL INTEGRATION: /src/lib/integrations/payments/payment-router.ts
// PHASE: 3
const result = MOCK_DATA.payments.getPaymentDetails({ tenantId, provider });
```
WORKER: Inline (Claude references payment details in conversations — no async job needed)
PHASE: 3
STATUS: placeholder

---

## SEO AND ANALYTICS INTEGRATIONS

---

### INTEGRATION: dataforseo
NAME: dataforseo
PURPOSE: Competitor keyword rank tracking, domain authority scores, backlink data for business-audit-engine and seo-domination-engine, Google Trends data via Trends endpoint.
AUTH METHOD: Login/password credentials (DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD env vars)
FILE LOCATION: /src/lib/integrations/seo/dataforseo.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: DATAFORSEO — Competitor rank tracking and domain authority
// REAL INTEGRATION: /src/lib/integrations/seo/dataforseo.ts
// PHASE: 4
const result = MOCK_DATA.seo.dataforseo.getRankings({ domain, keywords, location });
```
WORKER: Worker 4
PHASE: 4
STATUS: placeholder

---

## STORAGE INTEGRATIONS

---

### INTEGRATION: cloudflare-r2
NAME: cloudflare-r2
PURPOSE: All video and media storage. Zero egress fees. All media served via R2 URLs through Cloudflare CDN. Includes temporary bubble upload storage.
AUTH METHOD: R2 access key and secret (CLOUDFLARE_R2_ACCESS_KEY, CLOUDFLARE_R2_SECRET_KEY env vars). Bucket name (CLOUDFLARE_R2_BUCKET env var).
FILE LOCATION: /src/lib/storage/r2-client.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: CLOUDFLARE_R2 — Media storage
// REAL INTEGRATION: /src/lib/storage/r2-client.ts
// PHASE: 2
const mediaUrl = MOCK_DATA.storage.upload({ fileName, fileBuffer, contentType });
```
R2 SDK: @aws-sdk/client-s3 with custom endpoint (R2 is S3-compatible)
BUCKET STRUCTURE:
  /[tenant_id]/videos/raw/        — original uploaded videos
  /[tenant_id]/videos/renders/    — rendered clips and episodes
  /[tenant_id]/images/            — generated images
  /[tenant_id]/audio/             — ElevenLabs generated audio
  /[tenant_id]/assets/            — brand assets (logo, fonts)
  /[tenant_id]/exports/           — platform-optimised exports ready for posting
  /[tenant_id]/bubble-uploads/    — temporary files uploaded via AI bubble (deleted after analysis)
WORKER: Worker 1 (uploads), Worker 2 (retrieval for posting)
PHASE: 2
STATUS: placeholder

---

## APP DEVELOPER INTEGRATIONS

---

### INTEGRATION: google-play-console
NAME: google-play-console
PURPOSE: Read app listing data, submit listing updates (description, screenshots), read reviews, post review replies, pull download and revenue analytics.
AUTH METHOD: OAuth 2.0. Developer connects their Google Play Console account via Google OAuth. Service account credentials for server-to-server calls where supported.
FILE LOCATION: /src/lib/integrations/app-developer/play-console.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: GOOGLE_PLAY_CONSOLE — App listing management and analytics
// REAL INTEGRATION: /src/lib/integrations/app-developer/play-console.ts
// PHASE: 4
const result = MOCK_DATA.appDeveloper.playConsole.getAppDetails({ packageName });
```
RATE LIMITS: Google Play Developer API — 200,000 requests/day per project. No practical limit for our use case.
TOKEN REFRESH: Google OAuth refresh tokens, auto-refresh supported.
WORKER: Worker 4 (analytics pulls, review monitoring), Worker 2 (review replies, listing updates)
SCOPE REQUIRED: androidpublisher scope
PHASE: 4
STATUS: placeholder

---

### INTEGRATION: apple-app-store-connect
NAME: apple-app-store-connect
PURPOSE: Read app listing data, pull reviews, post review replies, pull download and subscription analytics via App Store Connect API.
AUTH METHOD: Apple API key (JWT-based). Developer generates an API key from App Store Connect and provides: Key ID, Issuer ID, and private key file. Stored encrypted in Supabase per tenant.
FILE LOCATION: /src/lib/integrations/app-developer/app-store-connect.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: APPLE_APP_STORE_CONNECT — iOS app management and analytics
// REAL INTEGRATION: /src/lib/integrations/app-developer/app-store-connect.ts
// PHASE: 4
const result = MOCK_DATA.appDeveloper.appStoreConnect.getAppDetails({ appId });
```
RATE LIMITS: App Store Connect API — rate limits apply per endpoint. Implement backoff on 429.
TOKEN REFRESH: JWT tokens generated fresh per request using stored private key. No refresh needed — JWT is generated on demand.
WORKER: Worker 4 (analytics, review monitoring), Worker 2 (review replies)
PHASE: 4
STATUS: placeholder

NOTE: Apple does not currently support automated listing description updates via API. Description and keyword updates must be submitted through App Store Connect web UI. System generates the optimized copy and presents it to the developer for manual submission with step-by-step instructions.

---

### INTEGRATION: revenuecat
NAME: revenuecat
PURPOSE: Optional unified subscription analytics across iOS and Android. Pulls MRR, churn, conversion rate, ARPU, trial conversion.
AUTH METHOD: RevenueCat API key (public and secret). Developer provides their RevenueCat project credentials. Stored encrypted per tenant.
FILE LOCATION: /src/lib/integrations/app-developer/revenuecat.ts
PLACEHOLDER PATTERN:
```typescript
// PLACEHOLDER: REVENUECAT — Unified subscription analytics
// REAL INTEGRATION: /src/lib/integrations/app-developer/revenuecat.ts
// PHASE: 4
const result = MOCK_DATA.appDeveloper.revenuecat.getMetrics({ projectId, dateRange });
```
OPTIONAL: Yes. Developers without RevenueCat use Google Play Billing and App Store Connect directly.
WORKER: Worker 4
PHASE: 4
STATUS: placeholder

---

## INTEGRATION BUILD ORDER — PHASE 3 AND 4 SEQUENCE

Complete integrations in this exact order. One per session. Test each in isolation before moving to the next.

PHASE 3 INTEGRATIONS:
1. cloudflare-r2 (storage needed by everything else)
2. whisper-stt (transcription needed for UGC and calls)
3. vertex-ai-claude (primary brain — needed by most modules)
4. vertex-ai-gemini (image generation and long video analysis)
5. elevenlabs (voice for calls)
6. supabase-auth (Terminal 3 — auth before any real data flows)
7. whatsapp-business-api (notifications needed before social posting)
8. twilio (call handling)
9. meta-graph-api (highest priority social platform)
10. google-business-profile (local SEO — high impact)
11. google-search-console (SEO foundation — needed by seo-domination-engine)
12. google-analytics-4 (analytics data)
13. tiktok-developer (high priority for UGC and faceless)
14. youtube-data-api (faceless channel publishing)
15. linkedin-api (B2B, professional services niche)
16. pinterest-api (retail and visual niches)
17. reddit-api (community engagement and Q&A seeding)
18. lenco (platform billing)
19. dataforseo (competitor intelligence, domain authority, backlinks, Google Trends data)
20. runway-ml (premium AI video — last, most expensive to test)

PHASE 4 INTEGRATIONS (Domination + App Developer):
21. google-trends (via DataForSEO — trend-intelligence-engine feeds)
22. google-play-console (app listing, reviews, analytics)
23. apple-app-store-connect (iOS app reviews and analytics)
24. revenuecat (optional — only if developer uses it)

---

## ENVIRONMENT VARIABLES — COMPLETE LIST

All environment variables required. None have defaults. System must not start if any required variable is missing.

### Platform Level (Coolify / Railway environment)
```
# AI
AI_PROVIDER=vertex                          # 'vertex' or 'anthropic'
VERTEX_AI_PROJECT_ID=
VERTEX_AI_CREDENTIALS=                      # JSON string of service account
ANTHROPIC_API_KEY=                          # fallback when AI_PROVIDER=anthropic

# Voice and Video
ELEVENLABS_API_KEY=
RUNWAY_API_KEY=

# Communication
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_POOL=                          # comma-separated list of provisioned numbers

# Storage
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_R2_ENDPOINT=                     # https://[account_id].r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=                   # https://media.quantumnexus.app

# Database
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=                  # server-side only, never exposed to client
NEXT_PUBLIC_SUPABASE_URL=                   # client-safe
NEXT_PUBLIC_SUPABASE_ANON_KEY=              # client-safe

# Queue
REDIS_URL=                                  # redis://[hetzner_ip]:6379

# Transcription
WHISPER_SERVICE_URL=                        # http://localhost:[port] or internal Docker URL

# SEO
DATAFORSEO_LOGIN=
DATAFORSEO_PASSWORD=

# Payments
LENCO_API_KEY=

# Security
ENCRYPTION_KEY=                             # AES-256 key for API key encryption
JWT_SECRET=                                 # Next.js API route JWT validation

# Platform
NEXT_PUBLIC_PLATFORM_URL=                   # https://app.quantumnexus.app
PLATFORM_ENV=development | staging | production
```

### Business Level (stored encrypted in Supabase per tenant — never in env vars)
```
# All user types
anthropic_api_key                           # business's own Anthropic key
meta_page_access_token
meta_instagram_access_token
tiktok_access_token
tiktok_refresh_token
linkedin_access_token
linkedin_organization_id
reddit_access_token
youtube_access_token
youtube_channel_id
pinterest_access_token
gsc_access_token
ga4_property_id
ga4_access_token
gbp_location_id
gbp_access_token
whatsapp_phone_number_id
whatsapp_access_token
payment_provider                            # 'lenco' | 'momo' | 'airtel' | 'stripe' | 'flutterwave' | 'paychangu' | 'custom'
payment_credentials                         # provider-specific, encrypted

# App Developer only (additional keys)
play_console_oauth_token                    # Google Play Console OAuth
play_console_package_name                   # app bundle ID e.g. com.example.app
app_store_connect_key_id                    # Apple API key ID
app_store_connect_issuer_id                 # Apple Issuer ID
app_store_connect_private_key               # Apple private key (.p8 file contents)
app_store_app_id                            # Apple App ID
revenuecat_api_key                          # optional — RevenueCat secret key
app_support_webhook_secret                  # generated by Nexus, used to verify webhook calls from developer's app
```
