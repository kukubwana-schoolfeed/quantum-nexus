# QUANTUM NEXUS — ARCHITECTURE.md
# Version: 2.0.0 | Status: LOCKED
# Read CLAUDE.md before reading this file.
# Version 2.0 adds Mission Control dashboard architecture, new Worker 4 jobs for domination modules.
# All existing architecture unchanged.

---

## SYSTEM OVERVIEW

```
                        ┌─────────────────────────────┐
                        │         CLOUDFLARE          │
                        │      CDN + SSL + WAF         │
                        └──────────────┬──────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │      HETZNER AX41           │
                        │     (Coolify Managed)        │
                        │                             │
                        │  ┌─────────────────────┐   │
                        │  │   Next.js 14 App    │   │
                        │  │   (Docker Container) │   │
                        │  └──────────┬──────────┘   │
                        │             │               │
                        │  ┌──────────▼──────────┐   │
                        │  │   Redis Instance     │   │
                        │  │  (Shared BullMQ)     │   │
                        │  └──────────┬──────────┘   │
                        │             │               │
                        │  ┌──────────▼──────────┐   │
                        │  │  Worker 1: Content   │   │
                        │  │  Worker 2: Publish   │   │
                        │  │  Worker 3: AI Scene  │   │
                        │  │  Worker 4: Analytics │   │
                        │  │  (Isolated Containers)│  │
                        │  └─────────────────────┘   │
                        │                             │
                        │  ┌─────────────────────┐   │
                        │  │  Whisper STT        │   │
                        │  │  (Self-hosted)       │   │
                        │  └─────────────────────┘   │
                        └──────────────┬──────────────┘
                                       │
               ┌───────────────────────┼───────────────────────┐
               │                       │                       │
    ┌──────────▼──────────┐ ┌─────────▼──────────┐ ┌─────────▼──────────┐
    │   SUPABASE          │ │  CLOUDFLARE R2     │ │  VERTEX AI         │
    │   Frankfurt         │ │  Media Storage     │ │  (Claude + Gemini  │
    │   PostgreSQL + RLS  │ │  Zero Egress Fees  │ │   + Imagen 3)      │
    │   Auth + Storage    │ └────────────────────┘ └────────────────────┘
    └─────────────────────┘
```

---

## INFRASTRUCTURE DETAILS

### Hetzner AX41 Specifications
- CPU: AMD Ryzen 9 3900 (12 cores, 24 threads)
- RAM: 128GB DDR4
- Storage: 2x 512GB NVMe SSD
- Network: 1 Gbit/s
- Location: Germany (Nuremberg or Falkenstein)
- Monthly cost: €40
- Managed by: Coolify (self-hosted PaaS)

### Docker Containers on Coolify
Each of the following runs as an isolated Docker container:
1. quantum-nexus-app (Next.js 14 frontend + API routes)
2. quantum-nexus-worker-content (Worker 1)
3. quantum-nexus-worker-publish (Worker 2)
4. quantum-nexus-worker-aiscene (Worker 3)
5. quantum-nexus-worker-analytics (Worker 4)
6. quantum-nexus-redis (Redis instance)
7. quantum-nexus-whisper (Whisper STT service)

Container failure isolation: If any worker container crashes, the others continue running unaffected. Redis is the only shared dependency. If Redis goes down, all workers pause gracefully and resume when Redis recovers.

### Supabase Configuration
- Region: Frankfurt (eu-central-1)
- Plan: Pro (required for RLS and adequate connections)
- Connection pooling: PgBouncer enabled
- Realtime: enabled for dashboard live updates and mission control
- Storage: used for small assets only (logos, brand assets under 10MB)
- All video and media: Cloudflare R2 only

### Cloudflare Configuration
- DNS: All domains point to Cloudflare
- Proxy: All traffic proxied through Cloudflare
- SSL: Full strict mode
- R2 bucket: quantum-nexus-media
- R2 custom domain: media.quantumnexus.app
- Cache rules: Static assets cached 30 days, API routes not cached
- WAF: Basic rules enabled — rate limiting, bot protection

---

## BULLMQ WORKER ARCHITECTURE

### Shared Redis Configuration
```typescript
const redisConnection = {
  host: process.env.REDIS_HOST,
  port: 6379,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
};
```

### Retry Policy — Applied To All Workers
```typescript
const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 60000, // 1 minute first retry
  },
  // Results in: retry 1 at 1min, retry 2 at 5min, retry 3 at 15min
  removeOnComplete: { count: 1000 },
  removeOnFail: false, // Failed jobs kept in dead queue permanently
};
```

### On Final Failure (All Three Retries Exhausted)
1. Job moved to dead queue
2. In-app notification sent to business: "We couldn't complete [action] — please check your connected accounts"
3. Super admin dead job monitor updated
4. Error logged with full context (tenant_id, job_type, error_message, timestamp)
5. No automatic recovery — human or manual retry required from admin dashboard

---

### Worker 1 — Content Generation Worker
Queue name: content-generation
Responsibilities:
- Claude API calls for content writing (blog posts, captions, scripts, emails)
- ElevenLabs voice generation for call responses and faceless character voices
- Remotion video composition and rendering (standard pipeline)
- Imagen 3 image generation for blog posts, Pinterest pins, thumbnails
- Whisper transcription jobs (routes to local Whisper service)
- Algorithm scoring before content is queued to Worker 2
- Content safety check (mandatory, Claude Haiku, fast classification)
- Sprint mode content generation (elevated frequency for first 30 days)
- Inspiration file analysis (Gemini 2.5 Pro for video, Sonnet 4.6 for image/PDF) — triggered by AI bubble uploads
- Content recycling jobs (repurposing high-performing content across formats)
- Blog post generation for seo-domination-engine (2 per day per tenant)
- Lead magnet PDF generation

Concurrency: 5 (five jobs can run simultaneously)
Priority levels: URGENT (crisis, inbound call response) > HIGH (scheduled posts due within 1 hour) > NORMAL (standard generation) > LOW (batch jobs, analytics reports, blog posts)

### Worker 2 — Publishing Worker
Queue name: social-publishing
Responsibilities:
- All social media posting via official APIs (Meta, TikTok, LinkedIn, YouTube, Pinterest, Reddit)
- OAuth token validation before every single job — token must be valid before attempting post
- OAuth token refresh where platform supports background refresh (Meta, LinkedIn)
- 72-hour expiry alert triggering for platforms requiring manual re-auth (TikTok)
- Held posts management — posts held on token expiry are never deleted, queued for retry
- Google Business Profile post scheduling
- WhatsApp broadcast delivery
- SMS delivery via Twilio
- Email delivery
- Account warm-up logic enforcement (posting frequency limits for new accounts)
- Q&A answer posting to Quora and Reddit (after business owner confirms question is posted)
- Directory submissions for entity-builder
- App review replies (Google Play and App Store)

Concurrency: 10 (ten publishing jobs simultaneously)
Rate limiting: Per-platform rate limits enforced. Meta: max 150 calls/hour per token. TikTok: per their developer limits. System never exceeds 75% of any platform's stated rate limit.

### Worker 3 — AI Scene Worker
Queue name: ai-scene-generation
Responsibilities:
- RunwayML Gen-3 API calls ONLY
- One job at a time — concurrency: 1
- Premium tier clients only — job rejected with error if client is not premium tier
- Monthly quota enforcement — job rejected if client has exhausted their monthly Runway quota
- AI Scene flagged content only — job rejected if content is not flagged AI_SCENE

Concurrency: 1 (strictly one RunwayML job at a time)
Throttle: Minimum 30 seconds between job starts regardless of queue depth

### Worker 4 — Analytics and SEO Worker
Queue name: analytics-seo
Responsibilities:
- Google Search Console API pulls (rankings, indexing status, crawl errors)
- Google Analytics 4 data pulls (traffic, conversions, behaviour)
- DataForSEO competitor rank tracking
- Social platform analytics pulls (engagement, reach, follower growth)
- Google Business Profile insights pulls
- Dashboard data aggregation and caching
- Sitemap submission to GSC (daily, 6am)
- New page indexing requests to GSC (triggered immediately on new content publish)
- Niche research jobs (monthly refresh, Claude + web search)
- Daily report generation (11pm, WhatsApp + email + in-app)
- Lenco payment status checks (daily, automated grace/suspension triggers)
- Business audit jobs (initial audit on activation, monthly refresh)
- Trend scanning (daily — feeds trend-intelligence-engine)
- Trend expiry checks (daily — flags aging trends)
- Reputation velocity score updates (weekly)
- Client health score updates (daily)
- Keyword cannibalisation scans (monthly)
- Entity consistency checks (monthly)
- Content refresh jobs (monthly — refreshes posts older than 6 months)
- Sprint mode end check (daily — disables sprint mode on day 31)
- App revenue sync (daily per app developer tenant)
- ASO rank checks (weekly per app developer tenant)
- App review monitoring (daily per app developer tenant)

Concurrency: 3
Schedule: Most jobs are cron-based. Real-time jobs (new page indexing, trend alerts) are event-triggered.

---

## MISSION CONTROL DASHBOARD ARCHITECTURE

### Purpose
Mission Control is the default landing view for every business owner on the platform.
It shows the full operational picture of the business on one screen without requiring any navigation.
Data is served via Supabase Realtime subscriptions — live updates without page refresh.

### Data Sources Per Panel
```
Mission Control Dashboard
├── Live Post Queue (next 24 hours)
│   └── Source: content_posts table WHERE status = 'scheduled' AND scheduled_for <= now() + 24h
├── SEO Tasks Today
│   └── Source: seo_tasks table WHERE date = today, status = pending/complete
├── Active Trend Alerts
│   └── Source: trends table WHERE status = 'NEW' OR status = 'ACTIVE', ORDER BY score DESC LIMIT 5
├── Content Scheduled (next 3 days)
│   └── Source: content_posts table WHERE scheduled_for BETWEEN now() AND now() + 3 days
├── Customer Activity
│   └── Source: customers table (new entries today), birthday_engine (upcoming birthdays)
├── Revenue Snapshot
│   └── Source: analytics_snapshots table (today, this week, this month aggregates)
├── Worker Health
│   └── Source: BullMQ queue health API — all 4 queues, job counts, error rates
├── Reputation Velocity
│   └── Source: reputation_velocity table (latest weekly score and trend)
├── Client Health Score
│   └── Source: client_health_scores table (latest score, trend direction)
├── AI Bubble
│   └── Always visible — floating component, no data source needed at load
├── Live SEO Indexing Feed
│   └── Source: indexed_pages table (pages confirmed indexed today via GSC)
└── Competitor Gap Snapshot
    └── Source: business_audit table (latest audit, top 3 gap metrics)
```

### Real-Time Updates
Mission Control uses Supabase Realtime channels:
- content_posts channel: updates live post queue as posts are published or rescheduled
- worker_health channel: updates worker status panels every 30 seconds
- trend_alerts channel: pushes new trend alerts as they are detected

### Performance Rule
Mission Control must load in under 2 seconds on first render.
All data displayed on Mission Control must be pre-aggregated and cached by Worker 4.
Worker 4 writes aggregated snapshots to Supabase every 15 minutes.
Mission Control reads from snapshots, not raw data tables.
Exception: Live post queue and worker health are fetched directly (small datasets, fast queries).

---

## MULTI-TENANCY ARCHITECTURE

### Tenant Hierarchy
```
Platform (Quantum Nexus)
└── Reseller/Agency (optional layer)
    └── Organisation
        └── Business Account (tenant)
            ├── Locations (multi-location support)
            ├── Customer Profiles
            ├── Content
            ├── Jobs
            └── Analytics
```

### RLS Enforcement
Every table in Supabase has:
- tenant_id UUID column (NOT NULL)
- RLS policy: SELECT — WHERE tenant_id = auth.jwt()->>'tenant_id'
- RLS policy: INSERT — WITH CHECK tenant_id = auth.jwt()->>'tenant_id'
- RLS policy: UPDATE — USING tenant_id = auth.jwt()->>'tenant_id'
- RLS policy: DELETE — USING tenant_id = auth.jwt()->>'tenant_id'

Application layer also filters by tenant_id on every query.
RLS is the safety net. Application filtering is the first line of defence.

### JWT Claims
Every authenticated session carries:
```json
{
  "sub": "user_id",
  "tenant_id": "business_uuid",
  "role": "business_owner | ugc_creator | faceless_creator | agency_admin | super_admin",
  "tier": "basic | growth | pro | enterprise | internal",
  "reseller_id": "reseller_uuid | null"
}
```

---

## AI ROUTING ARCHITECTURE

### Request Classification (Haiku — fast and cheap)
Every AI request is first classified by Haiku to determine routing:
```typescript
type AIRequestType =
  | 'content_generation'      // → Sonnet 4.6
  | 'onboarding_interview'    // → Sonnet 4.6
  | 'niche_research'          // → Sonnet 4.6 + web search
  | 'safety_check'            // → Haiku (self-routed)
  | 'routing_classification'  // → Haiku (self-routed)
  | 'call_response'           // → Sonnet 4.6
  | 'app_generation'          // → Opus 4.6
  | 'long_video_analysis'     // → Gemini 2.5 Pro
  | 'inspiration_video'       // → Gemini 2.5 Pro
  | 'inspiration_image_pdf'   // → Sonnet 4.6 (vision)
  | 'bulk_classification'     // → Gemini 2.0 Flash
  | 'trend_scanning'          // → Gemini 2.0 Flash
  | 'image_generation'        // → Imagen 3
  | 'database_query'          // → Sonnet 4.6 (bubble database queries)
  | 'seo_blog_generation'     // → Sonnet 4.6
  | 'entity_building'         // → Sonnet 4.6
```

### System Prompt Construction (Runtime)
Every Claude call constructs a dynamic system prompt:
```typescript
async function buildSystemPrompt(tenantId: string, requestType: string): Promise<string> {
  const profile = await getNicheProfile(tenantId);
  const priceList = await getPriceList(tenantId);
  const brandVoice = await getBrandVoice(tenantId);
  const faqs = await getFAQs(tenantId);
  const blocklist = await getBlocklist(tenantId);

  return `
    You are the AI assistant for ${profile.businessName}, a ${profile.niche} business in ${profile.location}.
    Tone: ${brandVoice.tone}
    Language: ${profile.contentLanguage}
    Services: ${JSON.stringify(profile.services)}
    Current prices: ${JSON.stringify(priceList)}
    Common questions and answers: ${JSON.stringify(faqs)}
    Topics to never mention: ${JSON.stringify(blocklist)}
    Never make up prices or services not listed above.
    If asked something outside your knowledge base, say: "${profile.fallbackMessage}"
  `;
}
```

---

## CONTENT PIPELINE ARCHITECTURE

### Standard Content Pipeline (All Tiers)
```
Content Request Triggered (scheduled or manual)
    ↓
Worker 1: Content Generation
    ├── Build system prompt from Niche Profile
    ├── Inject active trend data from trend-intelligence-engine
    ├── Claude Sonnet 4.6 generates content
    ├── Imagen 3 generates supporting image (if required)
    ├── Algorithm Scoring Engine evaluates content per target platform
    │   ├── Score below threshold → suggest improvements, re-generate or flag
    │   └── Score above threshold → proceed
    ├── Content Safety Check (Haiku — mandatory, non-skippable)
    │   ├── Fail → hold post, notify business, log
    │   └── Pass → proceed
    └── If approval queue enabled → send to approval queue, notify business
        If approval queue disabled → send to Worker 2 queue

Worker 2: Publishing
    ├── Validate OAuth token for target platform
    │   ├── Invalid → refresh if possible, else alert business and hold post
    │   └── Valid → proceed
    ├── Respect account warm-up limits (first 30 days)
    ├── Post via official platform API
    ├── Log result (success/failure) with timestamp
    └── On failure → retry policy (3 attempts with backoff)
              → On final failure → dead queue + business notification
```

### SEO Domination Pipeline (Daily, Automated)
```
Worker 4: Blog schedule triggered (daily, twice)
    ↓
Fetch target keyword from keyword strategy (seo-engine)
Fetch active trends from trend-intelligence-engine
    ↓
Worker 1: Claude Sonnet 4.6 generates blog post with keyword + trends injected
    ↓
Internal linker adds links to 3-5 related existing posts
    ↓
Content safety check (mandatory)
    ↓
Post published to business website
    ↓
GSC indexing request submitted immediately
    ↓
indexed_pages table updated
    ↓
Mission Control live indexing feed updated
```

### Inspiration Upload Pipeline (AI Bubble)
```
Business owner uploads video/image/PDF to AI bubble
    ↓
File stored temporarily in R2 under /[tenant_id]/bubble-uploads/
    ↓
Worker 1: Analysis job triggered
    ├── Video → Gemini 2.5 Pro analyses content, style, format, hooks
    ├── Image → Sonnet 4.6 vision analyses visual style, composition
    └── PDF → Sonnet 4.6 extracts relevant content and strategy
    ↓
Bubble presents analysis to business owner
    ↓
Business owner approves content plan
    ↓
Content jobs queued to Worker 1 (standard content pipeline)
    ↓
Temporary file deleted from R2
```

### AI Scene Pipeline (Premium Tier Only)
```
Content flagged AI_SCENE by business or content machine
    ↓
Check: Is tenant premium tier? No → reject with message
Check: Has tenant exhausted monthly Runway quota? Yes → reject with message
    ↓
Worker 1: Generate script and scene descriptions (Sonnet 4.6)
    ↓
Worker 3: RunwayML Gen-3 generates video scenes (one at a time)
    ↓
Worker 1: Remotion assembles scenes, adds music, titles, subtitles, branding
    ↓
Upload to Cloudflare R2
    ↓
Standard pipeline continues (safety check → approval queue → Worker 2)
```

### Video Processing Pipeline (UGC + Faceless)
```
Raw video uploaded → Cloudflare R2 (original preserved)
    ↓
Worker 1: Whisper transcription (self-hosted, zero cost)
    ↓
Worker 1: Claude Gemini 2.5 Pro analyses transcript + video (for long content)
    ↓
Clip candidates identified → thumbnail previews generated
    ↓
Creator approves clip selection (no full render until approval)
    ↓
Worker 1: FFmpeg cuts clips at approved timestamps
    ↓
Worker 1: Remotion renders with captions, zooms, music, branding
    ↓
Platform-optimised exports generated (9:16, 16:9, 1:1)
    ↓
Upload renders to Cloudflare R2
    ↓
Standard pipeline continues (safety check → scheduling → Worker 2)
```

---

## AUTHENTICATION FLOW

```
User visits platform
    ↓
Supabase Auth (email/password or OAuth)
    ↓
JWT issued with role, tenant_id, tier claims
    ↓
Next.js middleware validates JWT on every request
    ↓
API routes extract tenant_id from JWT — never from request body
    ↓
Supabase queries filtered by tenant_id at application level
    ↓
RLS policies enforce isolation at database level (second layer)
```

---

## NOTIFICATION ARCHITECTURE

### Notification Channels
- In-app (real-time via Supabase Realtime)
- WhatsApp (via WhatsApp Business API)
- Email (via chosen email provider)

### Notification Types and Channels
| Event | In-App | WhatsApp | Email |
|---|---|---|---|
| Post published successfully | ✓ | — | — |
| Post failed (final retry) | ✓ | ✓ | — |
| Token expiring in 72 hours | ✓ | ✓ | ✓ |
| Crisis detected | ✓ | ✓ | ✓ |
| Birthday alert to business | ✓ | ✓ | — |
| Payment overdue | ✓ | ✓ | ✓ |
| Account suspended | ✓ | — | ✓ |
| New lead captured | ✓ | — | — |
| Daily report | ✓ | ✓ | ✓ |
| Inbound call missed (human handoff) | ✓ | ✓ | ✓ |
| Admin approval required | ✓ | ✓ | — |
| New trend detected | ✓ | — | — |
| Trend expired | ✓ | — | — |
| Client health score declining | ✓ | ✓ | — |
| Keyword cannibalisation detected | ✓ | — | — |
| Q&A task ready to post | ✓ | ✓ | — |
| Business audit complete | ✓ | — | — |
| Content recycling opportunity | ✓ | — | — |

---

## BILLING ARCHITECTURE

### Platform Billing (Business pays Quantum Nexus)
- Currency: ZMW (Zambian Kwacha)
- Provider: Lenco API
- Cycle: Monthly manual invoicing (V1)
- Grace period: 7 days after invoice date
- Suspension trigger: 14 days unpaid
- Data retention after suspension: 30 days before permanent deletion
- Automatic payment tracking: Worker 4 checks Lenco webhook/transaction log daily
- Auto-triggers: grace period → suspension → deletion based on payment status

### Tier Pricing (Business configures their own)
Resellers set their own prices for their clients.
Platform enforces feature flags per tier — not per price.
Tier feature flags stored in Supabase, checked at API level.

### Cost Absorption
Your businesses (internal tier): use your platform-level Anthropic key, costs visible in your admin cost dashboard per business
Paying businesses: use their own Anthropic key, billed to their own Anthropic account, not visible to you
ElevenLabs, Twilio, RunwayML: your accounts, costs built into tier pricing
Currency conversion (USD costs vs ZMW revenue): absorbed by you, built into tier pricing

---

## DEMO SITES ARCHITECTURE (Web Design Niche — Separate From Nexus)

Demo sites are completely separate from Quantum Nexus.
They live on Vercel free tier under a separate Vercel account.
Claude Code generates personalised HTML/CSS demo for a prospect business.
Auto-deployed to Vercel via Vercel CLI or GitHub integration.
Demo URL sent to prospect via WhatsApp.
Demos auto-expire and are deleted after 30 days.
No Nexus backend involved — standalone static sites only.

---

## DATA FLOW DIAGRAM — INBOUND CALL

```
Customer calls business phone number (Twilio number)
    ↓
Twilio receives call → webhook to Nexus API route
    ↓
API route identifies business by Twilio number → fetches tenant_id
    ↓
Niche Profile loaded from Supabase
    ↓
System prompt constructed (business name, services, prices, FAQs, tone)
    ↓
ElevenLabs streams audio response (assigned business voice)
    ↓
Real-time conversation loop (Twilio ↔ ElevenLabs ↔ Claude Sonnet)
    ↓
Call classified:
├── Resolved → log interaction in customer database
├── Complex → trigger human handoff protocol:
│   ├── ElevenLabs: "Our team will follow up within 2 hours"
│   ├── BullMQ: schedule follow-up message at +2 hours if no human response
│   ├── Notify business owner: WhatsApp + email + in-app simultaneously
│   └── Provide full call transcript and context
└── Pricing query → answer from live price database, log interaction
```

---

## SPRINT MODE ARCHITECTURE

### What Sprint Mode Is
An elevated operating mode active for the first 30 days after a business or creator activates.
After day 31, system automatically drops to the sustainable long-term schedule.
Sprint mode is a BullMQ configuration — same jobs, different parameters and frequencies.

### Sprint Mode Parameters
```typescript
const sprintModeConfig = {
  active: true, // set to false on day 31 automatically
  postingMultiplier: 2.5, // 2.5x normal posting frequency
  clipExtractionMode: 'maximum', // extract maximum clips from every long-form video
  commentResponseSpeed: 'every', // reply to every single comment
  trendCheckFrequency: 'daily', // check trending sounds/formats daily
  warmupOverride: false, // warm-up limits still enforced even in sprint mode
};
```

### Sprint Mode End
Worker 4 checks days_since_activation daily.
On day 31: updates business config in Supabase, sprint mode disabled, sustainable schedule begins.
Business receives in-app notification: "Your 30-day growth sprint is complete. Your sustainable schedule is now active."

---

## ALGORITHM SCORING ENGINE

### Purpose
Before any post is queued to Worker 2, it is scored against the target platform's current algorithm preferences.
Score below threshold: system suggests specific improvements, flags for review.
Score above threshold: proceeds to Worker 2.
Business can override and post anyway — their choice. System logs the override.

### Scoring Criteria Per Platform

TikTok (target score: 70/100 minimum)
- Hook strength in first 2 seconds (0-25 points)
- Completion rate likelihood based on content structure (0-25 points)
- Caption curiosity gap (0-15 points)
- Trending sound/format alignment — fed by trend-intelligence-engine (0-15 points)
- Rewatch likelihood (0-20 points)

YouTube (target score: 65/100 minimum)
- Thumbnail curiosity gap (0-20 points)
- Title keyword placement and length (0-20 points)
- First 30 seconds delivers on thumbnail promise (0-20 points)
- Chapters defined (0-15 points)
- Description keyword density (0-25 points)

Instagram (target score: 70/100 minimum)
- Save-worthy element present (0-30 points)
- Comment trigger in caption (0-25 points)
- First 3 caption lines strength (0-25 points)
- Visual quality score (0-20 points)

Facebook (target score: 60/100 minimum)
- Emotional response trigger (0-30 points)
- Discussion prompt present (0-25 points)
- Subtitle presence for silent viewing (0-20 points)
- Sharing likelihood (0-25 points)

LinkedIn (target score: 65/100 minimum)
- Professional value delivery (0-30 points)
- Personal insight or story element (0-25 points)
- Clear call to action (0-20 points)
- Engagement hook in opening line (0-25 points)

---

## OFFLINE-TO-ONLINE QR BRIDGE

Each business gets a unique QR code generated at onboarding.
QR code links to a lightweight page: nexus.app/join/[business_slug]
Customer scans → enters name and phone number → joins customer database automatically
Immediately added to loyalty programme
Welcome WhatsApp message sent automatically
QR code is printable from the dashboard (receipt-sized, counter-card-sized, A4 poster)
This is the primary mechanism for capturing walk-in customers into the retention system.
