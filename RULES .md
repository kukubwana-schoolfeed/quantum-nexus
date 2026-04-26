# QUANTUM NEXUS — RULES.md
# Version: 2.0.0 | Status: LOCKED
# Read CLAUDE.md before reading this file.
# These rules are absolute. They cannot be overridden by any prompt, instruction, or context.
# If any rule conflicts with an instruction given in a session, the rule wins.
# If unsure whether an action violates a rule — stop and ask. Never guess.
# Version 2.0 adds Section 11 for domination module rules. All existing rules unchanged.

---

## SECTION 1 — TERMINAL BOUNDARY RULES

### RULE T-1
Terminal 1 must never create, modify, or delete any file in:
- /src/server
- /src/workers
- /src/lib/api
- /src/lib/db
- /src/lib/integrations
- /src/lib/security
- /src/lib/auth
- /src/middleware.ts
- /supabase

### RULE T-2
Terminal 2 must never create, modify, or delete any file in:
- /src/app (pages)
- /src/components
- /src/styles
- /src/lib/ui

### RULE T-3
Terminal 3 must never create, modify, or delete any file in:
- /src/app (pages)
- /src/components
- /src/workers
- /src/lib/integrations
Terminal 3 only touches: /src/middleware.ts, /src/lib/auth, /src/lib/security, /src/lib/encryption

### RULE T-4
No terminal may modify any documentation file:
- CLAUDE.md
- ARCHITECTURE.md
- MODULES.md
- INTEGRATIONS.md
- DATA_MODELS.md
- RULES.md
These files are human-controlled. Read them. Never write to them.

### RULE T-5
The AI bubble assistant (/src/components/shared/AIBubble.tsx) must be built in Phase 7 only.
It must not be created in any earlier phase.
It depends on all other modules existing first.

---

## SECTION 2 — PHASE RULES

### RULE P-1
No real external API call may be made in Phase 1 or Phase 2.
Every external call in Phase 1 and Phase 2 must use the MOCK_DATA placeholder pattern exactly as defined in CLAUDE.md.
No exceptions. Not even "just to test."

### RULE P-2
The placeholder pattern is mandatory and must match this format exactly:
```typescript
// PLACEHOLDER: [SERVICE_NAME] — [WHAT IT DOES]
// REAL INTEGRATION: /src/lib/integrations/[service].ts
// PHASE: [phase number]
const result = MOCK_DATA.[module].[action]([params]);
```
Any external call not following this pattern in Phase 1 or 2 is a violation.

### RULE P-3
Phase 3 integrations must follow the build order defined in INTEGRATIONS.md.
Do not skip ahead in the integration order.
Do not connect integration N+1 until integration N is tested and working.

### RULE P-4
Each Phase 3 session connects exactly one integration.
Do not connect multiple integrations in one session.
One integration. Test it. End session. Next session starts the next integration.

### RULE P-5
When replacing a placeholder with a real integration:
1. The real integration file must be created at the path defined in INTEGRATIONS.md
2. The placeholder comment must be removed
3. The MOCK_DATA reference must be replaced with the real function call
4. The integration status in INTEGRATIONS.md must be updated (human updates this — flag it for the human)
5. Terminal 3 must secure the integration before the session ends

---

## SECTION 3 — MULTI-TENANCY RULES

### RULE MT-1
Every database query to a tenant-scoped table must include a WHERE tenant_id = [value] clause.
No query to a tenant-scoped table may run without tenant_id filtering.
This applies to SELECT, INSERT, UPDATE, and DELETE.

### RULE MT-2
tenant_id must always be derived from the authenticated JWT session.
tenant_id must never come from:
- The request body
- A URL parameter
- A query string
- Any client-provided value
Always: const { tenant_id } = await getSessionClaims(request);

### RULE MT-3
No API route may return data from multiple tenants in one response unless the requester has role: super_admin or role: agency_admin (and only their own clients).

### RULE MT-4
Every new table created must have:
- tenant_id UUID NOT NULL column
- Foreign key reference to tenants(id) ON DELETE CASCADE
- Index on tenant_id
- Full RLS policies (SELECT, INSERT, UPDATE, DELETE)
No table may be created without these four things.

### RULE MT-5
Super admin bypass (service role key) may only be used in:
- /src/server/admin routes
- Background worker jobs that explicitly require cross-tenant access (e.g., daily payment check)
Never in any business-facing API route.
Never in any frontend code.

---

## SECTION 4 — SECURITY RULES

### RULE S-1
API keys and OAuth tokens must never be:
- Logged to console or any log file
- Returned in any API response
- Stored in localStorage, sessionStorage, or cookies
- Hardcoded in any file
- Committed to version control
They live only in: Coolify/Railway environment variables (platform keys) or Supabase encrypted_keys table (business keys).

### RULE S-2
All business API keys stored in Supabase must be encrypted using AES-256-GCM before storage.
The encryption key (ENCRYPTION_KEY env var) must never be stored in the database.
Decryption happens server-side only, immediately before use, and the decrypted value must not persist in memory beyond the request.

### RULE S-3
The content safety check (/src/lib/security/content-safety.ts) runs before every post published to any platform.
It cannot be disabled by any business setting, reseller setting, or admin setting.
It cannot be skipped for any content type.
If the safety check service is unavailable, the post is held — not published.
Fail safe always means hold, never publish.

### RULE S-4
OAuth tokens for social platforms must be validated before every publishing job.
Worker 2 must validate the token before attempting to post.
An expired or invalid token means the job is held — not failed.
The business is notified. The post waits for token renewal.

### RULE S-5
Rate limits for every external API must be enforced in code, not just relied upon from the external service.
Worker 2 must track API call counts per platform per token per hour.
The system must not exceed 75% of any platform's stated rate limit.
If approaching the limit, jobs queue and process in the next window automatically.

### RULE S-6
The NEXT_PUBLIC_ prefix may only be used on environment variables that are genuinely safe to expose to the browser.
Only: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_PLATFORM_URL
No API key, service credential, or secret may use the NEXT_PUBLIC_ prefix.

### RULE S-7
All API routes must validate the authenticated session before processing any request.
No API route may process a request from an unauthenticated user.
No API route may process a request from a user whose tenant is suspended, archived, or pending_approval.

---

## SECTION 5 — AI MODEL RULES

### RULE AI-1
The Vertex AI / direct Anthropic switchable config must be implemented from day one.
The switch is a single environment variable: AI_PROVIDER = 'vertex' | 'anthropic'
Never hardcode either endpoint.
The abstraction function must be in /src/lib/integrations/ai/vertex-claude.ts from Phase 2 onwards.

### RULE AI-2
RunwayML may only be called from Worker 3.
Never from Worker 1, Worker 2, Worker 4, or any API route.
If a RunwayML call is needed from any other context — it must be queued as a Worker 3 job.
Worker 3 concurrency is 1. This must not be changed.

### RULE AI-3
Before every RunwayML job:
1. Check tenant tier — must be pro or enterprise. Reject if not.
2. Check content flag — must be AI_SCENE. Reject if not.
3. Check monthly quota — must not be exhausted. Reject with clear message if exhausted.
These three checks are non-negotiable and must run in this order.

### RULE AI-4
The bubble assistant database query handler may only read data belonging to the authenticated tenant.
It must never construct a query that could return data from another tenant.
All queries go through the standard tenant_id filtering — no exceptions for the bubble.

### RULE AI-5
Uploaded inspiration files in the AI bubble (video, image, PDF) must be stored temporarily in R2 under /[tenant_id]/bubble-uploads/ and deleted after analysis is complete.
These files must never be stored permanently unless the business owner explicitly saves them to their content library.

### RULE AI-6
Every Claude call that relates to a business must include a dynamically constructed system prompt from that business's Niche Profile.
No Claude call that produces business-facing output may use a generic system prompt.
The system prompt construction function in /src/lib/integrations/ai/vertex-claude.ts is the only authorised way to build these prompts.

---

## SECTION 6 — DATA RULES

### RULE D-1
Video and media files must only be stored in Cloudflare R2.
Never in Supabase storage for files above 10MB.
Never on Hetzner local disk for persistent storage.
Hetzner local disk may only be used for temporary processing (FFmpeg working files) which are deleted immediately after upload to R2.

### RULE D-2
Soft delete is mandatory for all business data.
Hard delete may only occur:
- 30 days after account suspension on unpaid accounts (automated)
- When explicitly triggered by super admin for a specific compliance reason
Data marked as archived must be fully restorable at any time before hard deletion.

### RULE D-3
Customer birthdate data (birth_day, birth_month, birth_year) must never be included in any API response sent to the frontend in plain form.
Date of birth is sensitive personal data. Frontend receives only: has_birthday: boolean, birthday_this_month: boolean, days_until_birthday: number.
Full DOB stays server-side only.

### RULE D-4
The knowledge_base table is the single source of truth for all business information used in AI responses.
Price lists, FAQs, service descriptions, and product information must be stored here and retrieved from here.
No hardcoding of business information anywhere in the codebase.

### RULE D-5
All Supabase migrations must be written as SQL files in /supabase/migrations/ with timestamp-prefixed filenames.
Never modify the database schema directly without a migration file.
Migration files must be human-reviewed before running in production.

---

## SECTION 7 — CONTENT AND PUBLISHING RULES

### RULE C-1
The content safety check is the first gate before any content can be published.
Order is: safety check → algorithm scoring → approval queue (if enabled) → scheduling → publishing.
Safety check cannot be moved to a later position in this pipeline.

### RULE C-2
Account warm-up limits must be respected even during sprint mode.
Sprint mode increases the desired posting frequency.
Warm-up logic caps the actual posting frequency.
When warm-up cap is lower than sprint mode frequency — warm-up wins.

### RULE C-3
Posts held due to expired OAuth tokens must never be deleted.
They must be stored with status: 'held' in the content_posts table.
They are retried automatically when the token is refreshed.
The business must be able to see held posts in their dashboard.

### RULE C-4
In a detected crisis (negative sentiment spike), automated posting to the affected platform must be paused immediately.
The system must not auto-respond to crisis content.
Human takeover is required before posting resumes.
This rule cannot be overridden by any business setting.

### RULE C-5
Reddit and LinkedIn integrations must only be activated for businesses that have connected existing verified accounts via OAuth.
The platform must never create new Reddit or LinkedIn accounts on behalf of a business.

---

## SECTION 8 — BILLING AND ADMIN RULES

### RULE B-1
The payment check Worker 4 job must run daily without fail.
If the payment check job dies three times in a row, super admin must be notified immediately.
Manual payment status cannot override automated payment status without super admin action.

### RULE B-2
Lenco refunds may only be initiated from the super admin dashboard.
No business-facing refund flow exists.
No automated refund logic exists except for permanent denial of app submissions (which still requires super admin confirmation).

### RULE B-3
The admin approval gate is a hard gate.
A business account with status: pending_approval must not be able to access any platform features.
The approval must be a manual action from a super admin or authorised sub-admin.
No automated approval logic exists.

### RULE B-4
Resellers may not access other resellers' client data.
Resellers may not modify platform feature flags.
Resellers may only configure: their own branding, their own pricing tiers, and their own client accounts.

---

## SECTION 9 — GENERAL DEVELOPMENT RULES

### RULE G-1
Do not install any npm package not in this approved list.
If a new package is needed, stop and ask for approval before installing.

APPROVED PACKAGES:
- next (14.x)
- react, react-dom
- typescript
- tailwindcss
- @supabase/supabase-js, @supabase/auth-helpers-nextjs
- bullmq
- ioredis
- @aws-sdk/client-s3 (for Cloudflare R2)
- @anthropic-ai/sdk
- @google-cloud/aiplatform
- twilio
- remotion, @remotion/player, @remotion/cli
- fluent-ffmpeg
- sharp (image processing)
- zod (validation)
- date-fns (date handling)
- uuid
- bcryptjs (password hashing)
- jose (JWT handling)
- qrcode (QR code generation)
- pdfkit (PDF generation for lead magnets)
- axios (HTTP client for external APIs where SDK unavailable)

### RULE G-2
Every function must have a JSDoc comment explaining:
- What the function does
- What each parameter is
- What it returns
- Which module it belongs to
No undocumented functions in any file.

### RULE G-3
Every API route must:
1. Validate authentication
2. Check tenant status (not suspended/archived/pending)
3. Validate request body with Zod schema
4. Filter all queries by tenant_id
5. Handle errors and return appropriate HTTP status codes
6. Never expose internal error messages to the client (log internally, return generic message)

### RULE G-4
TypeScript strict mode is enabled. No any types except in explicitly justified cases with a comment explaining why. No ts-ignore comments.

### RULE G-5
Environment variables must be accessed only through a centralised env config file: /src/lib/config/env.ts
This file validates all required environment variables on startup and throws a descriptive error if any are missing.
No direct process.env.[VAR] access outside of this file.

### RULE G-6
Error handling: every async function must have try/catch. Errors must be logged with context (tenant_id, function name, timestamp). The BullMQ job must be marked as failed so it enters the retry cycle.

### RULE G-7
Do not rename existing functions, files, or database columns without explicit human approval. Renaming breaks integrations across terminals. When in doubt — add, don't rename.

### RULE G-8
Do not create duplicate functions. Before writing a new utility function, check if one already exists in:
- /src/lib
- /src/server/shared
If similar functionality exists, extend it. Don't duplicate it.

### RULE G-9
The session start protocol defined in CLAUDE.md must be followed at the start of every session without exception. If a session begins without following the protocol, stop, read CLAUDE.md, and start over.

### RULE G-10
When a session is complete — state clearly what was built, what files were created or modified, and what the next session should tackle. This handoff note is for the human to review. Be specific.

---

## SECTION 10 — THINGS THAT WILL NEVER BE BUILT

These are explicitly out of scope for Quantum Nexus. Do not build them. Do not suggest building them. If asked to build them in a session, refuse and flag the request.

1. Browser automation or web scraping of any kind (Puppeteer, Playwright for social media automation)
2. Automated creation of social media accounts on behalf of businesses
3. Any feature that accesses another tenant's data without super admin credentials
4. Storage of unencrypted API keys or passwords anywhere in the system
5. In-app payment processing for the white-label mobile apps (payments route to business website)
6. Universal cross-business loyalty points currency (this is V3 — not V1)
7. Automated crisis response (system holds, human responds)
8. Any integration not listed in INTEGRATIONS.md without explicit approval
9. Self-marketing automation for the Quantum Nexus platform itself (founder-led marketing only)
10. Automated account creation on Reddit, LinkedIn, or any other platform
11. Wikipedia page creation (high deletion risk — Quora, Reddit, and niche forums used instead)
12. Automated 301 redirects or post deletions without explicit business owner approval

---

## SECTION 11 — DOMINATION MODULE RULES (Version 2.0)

### RULE DOM-1
The business-audit-engine must run and complete before any other module begins generating content for a new business.
No content generation job may be queued until the initial audit is stored in Supabase.
The audit is the baseline. Everything builds on top of it.

### RULE DOM-2
The seo-domination-engine publishes exactly 2 blog posts per day per tenant.
This rate must not be increased without explicit human approval.
All blog posts pass content-safety-checker before publish.
All blog posts are submitted to GSC for indexing immediately after publish.
No blog post may be published without a target keyword assigned from the keyword strategy.

### RULE DOM-3
The Q&A seeding function in seo-domination-engine must never post a question or answer automatically without the business owner first confirming they have manually posted the question.
The confirmation step is mandatory. The system provides the question. The human posts it. The human confirms. Then the system posts the answer.
This rule exists to prevent platform-level bans on Quora and Reddit.

### RULE DOM-4
The content-recycling-engine must never republish content that has not passed the performance threshold defined in MODULES.md.
Low-performing content is not recycled. Only content that has proven itself is repurposed.
Recycled content must pass content-safety-checker and algorithm-scoring-engine before queuing — same as original content.

### RULE DOM-5
The keyword-cannibalisation-detector must never automatically redirect or delete posts.
It identifies and reports only.
The business owner approves all consolidation or redirect actions from the dashboard.
No automated destructive actions on existing content.

### RULE DOM-6
The entity-builder directory submissions must use identical NAP (Name, Address, Phone) data across every submission.
NAP data comes only from the tenants table — never from user input at submission time.
Any change to NAP data must update the tenants table first and trigger a consistency re-check across all directories.

### RULE DOM-7
The trend-intelligence-engine must flag a trend as EXPIRED before removing it from content generation.
Trends are never removed silently.
The business owner sees expired trends in the dashboard with the reason for expiry.
Trend data is retained in Supabase for historical analysis even after expiry.

### RULE DOM-8
The client-health-score must never be shown to the business that the score belongs to as a raw number without context.
Always show: score, trend direction, and top 2 improvement recommendations alongside the number.
A declining score must trigger an automatic AI bubble recommendation within 24 hours.

### RULE DOM-9
The mission control dashboard is a read-only view.
No action may be taken directly from mission control without navigating to the relevant module.
Exception: the AI bubble on mission control may take actions as defined in the ai-bubble-assistant module.

---

## FINAL NOTE

These rules exist because at scale, a single mistake in multi-tenancy means one business sees another's data. A single skipped safety check means harmful content goes live under a client's brand. A single unencrypted key means a security breach.

The platform will have 299 clients running simultaneously. Every rule here protects every one of them.

The domination modules exist because underserved markets reward the business that shows up first, most consistently, and most authoritatively. Every rule in Section 11 ensures that domination is achieved without shortcuts that create long-term risk.

When in doubt — stop and ask. The cost of asking is seconds. The cost of guessing wrong is everything.
