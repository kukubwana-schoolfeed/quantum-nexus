# QUANTUM NEXUS — MASTER CLAUDE.md
# Version: 2.0.0 | Status: LOCKED
# This file is the single source of truth for all terminals.
# Read this file completely before touching anything else.
# Do not proceed until this file has been fully read.

---

## WHAT THIS SYSTEM IS

Quantum Nexus is a multi-tenant AI-powered business operating system.
It serves five user types: Business Owners, UGC Creators, Faceless Channel Creators, App Developers, and Agencies/Resellers.
The platform automates marketing, SEO, content creation, social media, inbound calls, outbound sales, customer retention, app store optimization, and analytics — across any niche or product type.
The only human input required is the physical delivery of a product, service, or software application.
The platform is built and operated by Quantum Leaf Software, Lusaka, Zambia.

The goal is not visibility. The goal is niche domination for decades.
Every feature compounds. Every post indexes. Every backlink stacks. The system never stops.

---

## CORE PHILOSOPHY

The platform is a shell. The data is the engine.
Code never changes per niche. Only the Niche Profile data changes.
Claude's behaviour per business is controlled entirely by the system prompt constructed from that business's Niche Profile at runtime.
No hardcoded niche logic exists anywhere in the codebase.
Every feature is data-driven. Every output is context-driven.
The platform overqualifies every business it serves. Clients look like category leaders from day one.

---

## TECH STACK — CONFIRMED, DO NOT DEVIATE

### Frontend
- Next.js 14 App Router
- Deployed on Hetzner AX41 via Coolify as Docker container
- Tailwind CSS for styling
- No Vercel for Nexus frontend — Coolify only
- Demo sites for web design niche remain on Vercel free tier (separate project, not part of Nexus)

### Backend
- Next.js 14 API routes for synchronous operations
- BullMQ for all async, scheduled, and queued jobs
- Four worker containers on Hetzner via Coolify (see ARCHITECTURE.md)
- Redis on Hetzner — shared across all four workers

### Database
- Supabase managed instance — Frankfurt region
- PostgreSQL with Row Level Security (RLS)
- Multi-tenant: every table has a tenant_id column
- RLS policies enforce tenant isolation at database level
- Do not self-host Supabase under any circumstances

### Storage
- Cloudflare R2 for all video and media files
- Zero egress fees — all media served via R2 public URLs through Cloudflare CDN
- Do not store video or large media in Supabase storage or Hetzner local disk

### CDN and SSL
- Cloudflare sits in front of everything
- All SSL handled by Cloudflare
- Do not configure SSL at the server level

### Infrastructure
- Hetzner AX41 dedicated server, Germany
- Managed by Coolify
- Businesses never interact with infrastructure directly

---

## AI MODEL STACK — CONFIRMED

| Model | Purpose | Provider |
|---|---|---|
| Claude Sonnet 4.6 | Primary brain — content, calls, onboarding, niche research, safety checks, bubble assistant | Vertex AI (switchable to direct Anthropic) |
| Claude Haiku 4.5 | Routing, classification, simple internal tasks, test output classification | Vertex AI (switchable) |
| Claude Opus 4.6 | App generation, complex enterprise tasks only | Vertex AI (switchable) |
| Gemini 2.5 Pro | Long video analysis, document processing, video inspiration analysis | Vertex AI |
| Gemini 2.0 Flash | Bulk fast tasks, trend scanning | Vertex AI |
| Imagen 3 | Image generation for content | Vertex AI |
| Whisper (self-hosted) | All transcription — UGC, calls, voice bubble, uploaded inspiration videos | Hetzner local |
| ElevenLabs | Voice synthesis for calls and faceless characters | Direct API |
| RunwayML Gen-3 | AI video scene generation — premium tier, AI Scene flag only | Direct API |
| Remotion | Video composition and templates | Library on Worker 1 |

### Vertex AI Switchable Config
All Claude and Gemini calls use a single config variable: AI_PROVIDER = "vertex" or "anthropic"
When AI_PROVIDER is "vertex" — use Google Cloud Vertex AI endpoints
When AI_PROVIDER is "anthropic" — use direct Anthropic API endpoints
This switch requires zero code changes beyond the config variable.
Build the abstraction layer from day one. Never hardcode either endpoint.

---

## TERMINAL BOUNDARIES — STRICTLY ENFORCED

### Terminal 1 — Frontend Only
OWNS: /src/app, /src/components, /src/hooks, /src/styles, /src/lib/ui
NEVER TOUCHES: /src/server, /src/workers, /src/lib/api, /src/lib/db, /src/lib/integrations
NEVER TOUCHES: any .env variable that is not NEXT_PUBLIC_
NEVER TOUCHES: any Supabase table directly — always through API routes
RESPONSIBILITY: All pages, all components, all UI flows, all dashboard layouts, mission control dashboard, AI bubble UI, charts, forms, mobile responsiveness

### Terminal 2 — Backend, Database, Workers, Integrations
OWNS: /src/server, /src/workers, /src/lib/api, /src/lib/db, /src/lib/integrations, /supabase
NEVER TOUCHES: /src/app, /src/components, /src/styles
RESPONSIBILITY: All API routes, all BullMQ job definitions, all worker logic, Supabase schema and RLS, all third-party API integrations (placeholder first, real second), all business logic

### Terminal 3 — Security, Auth, Middleware
OWNS: /src/middleware.ts, /src/lib/auth, /src/lib/security, /src/lib/encryption
NEVER TOUCHES: /src/app pages, /src/workers, /src/lib/integrations
ACTIVATES: After Terminal 2 has established all API routes and database schema
RESPONSIBILITY: Supabase Auth configuration, RBAC, API key encryption (AES-256), OAuth token handling, rate limiting, content safety check layer, all middleware

### Shared Read Access (All Terminals)
All terminals may read: /docs, CLAUDE.md, ARCHITECTURE.md, MODULES.md, INTEGRATIONS.md, DATA_MODELS.md, RULES.md
No terminal may modify documentation files — those are human-controlled

---

## BUILD PHASES — CURRENT PHASE MUST BE STATED AT START OF EVERY SESSION

### Phase 1 — Scaffold (Terminal 2 only)
All files created with correct names and locations.
All functions defined with correct signatures and JSDoc comments.
All Supabase tables created with correct schema and RLS.
Zero business logic implemented.
All external calls return MOCK_DATA.
Terminal 1 creates all page files and component shells simultaneously.

### Phase 2 — Mock Data Layer (Terminal 1 + Terminal 2 simultaneously)
Full UI operational with mock data.
All flows navigable end to end.
All dashboard views populated with realistic fake data.
Mission control dashboard operational with mock data from all modules.
No real API calls.
System is fully demo-able at end of Phase 2.
Terminal 3 adds auth and security layer at end of Phase 2.

### Phase 3 — Real Integrations (Terminal 2, one integration per session)
Replace placeholders one at a time.
Each integration tested in isolation before moving to next.
Terminal 3 secures each integration immediately after Terminal 2 connects it.
Order defined in INTEGRATIONS.md.

### Phase 4 — Content Machine, UGC Pipeline, Faceless Studio, SEO Domination Engine (Terminal 1 + Terminal 2)
### Phase 5 — Sales Engine, Birthday Engine, Loyalty, Seasonal, Lead Magnets, QR Bridge, Testimonials, Trend Intelligence (Terminal 1 + Terminal 2)
### Phase 6 — Mobile App Builder, Reseller Dashboard, White-Label Layer (Terminal 1 + Terminal 2)
### Phase 7 — AI Bubble, Warm-Up Logic, Algorithm Scoring, Polish, Testing (All three terminals)

---

## PLACEHOLDER PATTERN — MANDATORY FOR ALL EXTERNAL CALLS

When an external API is not yet connected, use this exact pattern. No exceptions.

```typescript
// PLACEHOLDER: [SERVICE_NAME] — [WHAT IT DOES]
// REAL INTEGRATION: /src/lib/integrations/[service].ts
// PHASE: [phase number when this gets replaced]
const result = MOCK_DATA.[module].[action]([params]);
```

Example:
```typescript
// PLACEHOLDER: META_GRAPH_API — Post to Facebook Page
// REAL INTEGRATION: /src/lib/integrations/meta.ts
// PHASE: 3
const result = MOCK_DATA.social.postToFacebook({ pageId, content, media });
```

Never call a real external API in Phase 1 or Phase 2.
Never leave a placeholder in place after Phase 3 has reached that integration.

---

## MODULE REGISTRY — EVERY MODULE THAT EXISTS

If a module is not in this list it does not exist yet.
Do not create modules not listed here without explicit human approval.

### Platform Core
- onboarding-engine
- niche-intelligence
- niche-research
- api-key-manager
- completeness-scoring
- admin-approval-gate
- tier-system
- billing-engine
- payment-tracker
- soft-delete-archive
- sprint-mode-engine

### Business Modules
- seo-engine
- content-machine
- social-media-layer
- inbound-call-handler
- outbound-sales-engine
- google-business-profile-manager
- broadcast-engine
- customer-database
- birthday-engine
- review-campaign-manager
- video-testimonial-collector
- loyalty-points-engine
- lead-magnet-builder
- seasonal-campaign-engine
- offline-qr-bridge
- competitor-intelligence
- reputation-layer
- approval-queue
- knowledge-base-builder
- community-module
- analytics-dashboard
- daily-report-engine
- crisis-detection
- call-fallback-handler
- white-label-app-builder
- algorithm-scoring-engine

### NEW — Domination Modules (Version 2.0)
- business-audit-engine
- seo-domination-engine
- trend-intelligence-engine
- content-recycling-engine
- entity-builder
- reputation-velocity-tracker
- keyword-cannibalisation-detector
- client-health-score

### UGC Modules
- ugc-video-ingestion
- ugc-clip-intelligence
- ugc-clip-preview
- ugc-render-pipeline
- ugc-content-calendar
- ugc-trend-monitor
- ugc-performance-feedback
- ugc-monetisation-intelligence
- ugc-podcast-support

### Faceless Channel Modules
- faceless-character-studio
- faceless-storyline-editor
- faceless-series-bible
- faceless-episode-outliner
- faceless-scene-breakdown
- faceless-runway-pipeline
- faceless-voice-pipeline
- faceless-assembly-pipeline
- faceless-thumbnail-generator
- faceless-audience-intelligence
- faceless-episode-tracker

### Shared Modules
- ai-bubble-assistant
- account-warmup-engine
- content-safety-checker
- oauth-token-manager
- bullmq-job-registry
- media-storage-manager
- whisper-transcription
- notification-engine
- warmup-engine

### App Developer Modules
- app-profile-engine
- app-store-optimizer
- app-review-monitor
- app-content-generator
- app-support-inbox
- app-analytics-dashboard
- app-payment-intelligence

### Admin Modules
- super-admin-dashboard
- reseller-dashboard
- dead-job-monitor
- cost-dashboard
- niche-research-review
- app-publishing-pipeline
- platform-health-monitor

---

## MISSION CONTROL DASHBOARD — DEFAULT VIEW

The default dashboard for every business owner is Mission Control.
One screen. No clicking required to see the full picture.

Mission Control shows simultaneously:
- Live post queue (next 24 hours scheduled)
- Today's SEO tasks completed vs pending
- Active trend alerts (trending topics in niche right now)
- Content scheduled for next 3 days
- Customer database activity (new entries, birthdays upcoming)
- Revenue snapshot (today, this week, this month)
- Worker health (all 4 BullMQ workers — green/amber/red)
- Reputation velocity (weekly growth number — backlinks, indexed pages, reviews, followers)
- Client health score (single composite number)
- AI bubble (always visible, always accessible)
- Live SEO indexing feed (pages indexed today)
- Competitor gap snapshot

Business owner wakes up, opens dashboard, knows exactly what happened overnight and what is running today.
All other dashboard sections remain accessible via navigation — Mission Control is the landing view only.
Mission Control is built in Phase 2 with mock data and goes live with real data in Phase 4.

---

## SESSION START PROTOCOL — MANDATORY FOR EVERY SESSION

Every Claude Code session must begin with these exact steps:

1. State which terminal this is (Terminal 1, 2, or 3)
2. State the current build phase (Phase 1 through 7)
3. State the exact module being worked on this session
4. Read CLAUDE.md completely
5. Read the relevant section of MODULES.md for the target module
6. Read the relevant section of INTEGRATIONS.md if connecting an external service
7. Confirm understanding before writing any code
8. Work only on the stated module
9. Stop when the module is complete — do not drift into adjacent modules

Session start prompt template (paste this at the start of every session):
"Read CLAUDE.md before doing anything. You are Terminal [1/2/3]. Current build phase is Phase [number]. You are working on [MODULE NAME] only. Do not touch any other module or any file outside your terminal's ownership boundaries."

---

## MULTI-TENANCY — ENFORCED EVERYWHERE

Every database query must include tenant_id filtering.
Every API route must extract tenant_id from the authenticated session.
Never return data without tenant_id in the WHERE clause.
RLS policies are the safety net — but application-level filtering is also required.
No exceptions to this rule anywhere in the codebase.

---

## API KEY ARCHITECTURE

### Platform-Level Keys (stored in Railway/Coolify environment variables — never in code)
- ANTHROPIC_API_KEY (your key — powers your own businesses)
- VERTEX_AI_PROJECT_ID
- VERTEX_AI_CREDENTIALS
- ELEVENLABS_API_KEY
- RUNWAY_API_KEY
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- CLOUDFLARE_R2_ACCESS_KEY
- CLOUDFLARE_R2_SECRET_KEY
- CLOUDFLARE_R2_BUCKET
- DATAFORSEO_LOGIN
- DATAFORSEO_PASSWORD
- REDIS_URL
- SUPABASE_SERVICE_ROLE_KEY

### Business-Level Keys (stored encrypted in Supabase — AES-256)
Each business provides their own:
- Anthropic API key (their billing, separate from yours)
- All social platform OAuth tokens
- Google Search Console OAuth
- Google Analytics 4 OAuth
- Google Business Profile OAuth
- Payment provider credentials

### Key Retrieval Pattern
```typescript
// Always retrieve business API keys like this — never cache unencrypted
const businessKeys = await getBusinessKeys(tenantId); // decrypts on retrieval
// Use immediately, never store in memory beyond the request
```

---

## LANGUAGE SUPPORT — V1 SCOPE

Platform UI: English only
AI-generated content: English and Nyanja
Call handling: English only
V2 additions: Bemba, Tonga

---

## WHAT CLAUDE CODE MUST NEVER DO

See RULES.md for the complete list.
The most critical rules repeated here for emphasis:

1. Never create a file outside your terminal's ownership boundaries
2. Never call a real external API in Phase 1 or Phase 2
3. Never hardcode a tenant_id — always derive from authenticated session
4. Never store an API key unencrypted
5. Never skip the content safety check before any post is published
6. Never assume a module exists — check the module registry first
7. Never rename an existing function or file without explicit instruction
8. Never install a package not in the approved list (see RULES.md)
9. Never modify CLAUDE.md, ARCHITECTURE.md, MODULES.md, INTEGRATIONS.md, DATA_MODELS.md, or RULES.md
10. If unsure about anything — stop and ask. Do not guess.
