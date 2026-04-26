# Quantum Nexus — Full Project Type Error Report

**Generated:** 2026-04-18
**Compiler:** tsc --noEmit
**Total errors:** 307
**Files affected:** 138

**Ownership note:** Terminal 6 owns `/src/middleware.ts`, `/src/lib/auth`, `/src/lib/security`, `/src/lib/encryption`. All errors in those directories were fixed in Phase 6. Zero remain.

---

## Error categories

| Code | Description | Count |
|------|-------------|-------|
| TS2339 | Property does not exist on type | 92 |
| TS2554 | Wrong number of arguments | 60 |
| TS2322 | Type not assignable | 45 |
| TS2345 | Argument type not assignable | 28 |
| TS2769 | No overload matches | 18 |
| TS2353 | Object literal unknown property | 15 |
| TS2802 | Set iteration requires downlevelIteration | 10 |
| TS2304 | Cannot find name | 6 |
| TS18047 | Possibly null | 5 |
| TS5076 | Mixed ?? and || without parens | 1 |
| TS2741 | Missing required property | 3 |
| TS2352 | Bad conversion/cast | 4 |

---

## Errors by directory (top-level grouping)

| Directory | Errors | Likely owner |
|-----------|--------|--------------|
| src/workers/analytics-seo/jobs | 40 | Terminal 5 (Workers) |
| src/server/routes/business | 38 | Terminal 4 (Server/Routes) |
| src/workers/social-publishing/jobs | 27 | Terminal 5 (Workers) |
| src/workers/content-generation/jobs | 20 | Terminal 5 (Workers) |
| src/server/routes/admin | 11 | Terminal 4 (Server/Routes) |
| src/lib/db | 11 | Terminal 2 (Database) |
| src/lib/integrations/social | 10 | Terminal 1 (Integrations) |
| src/workers/shared | 7 | Terminal 5 (Workers) |
| src/app/admin | 7 | Terminal 7 (Frontend) |
| src/server/routes/app-developer | 6 | Terminal 4 (Server/Routes) |
| src/lib/integrations/app-developer | 6 | Terminal 1 (Integrations) |
| src/server/routes/shared-modules | 5 | Terminal 4 (Server/Routes) |
| src/components/seo-domination | 5 | Terminal 7 (Frontend) |
| src/app/dashboard/audit | 5 | Terminal 7 (Frontend) |
| src/app/admin/costs | 5 | Terminal 7 (Frontend) |
| src/lib/api | 4 | Terminal 2 (Database) |
| src/app/dashboard/app-developer/support | 4 | Terminal 7 (Frontend) |
| src/app/api/admin/health | 4 | Terminal 4 (Server/Routes) |
| src/workers/ai-scene-generation | 3 | Terminal 5 (Workers) |
| src/lib/integrations/google | 3 | Terminal 1 (Integrations) |
| src/components/audit | 3 | Terminal 7 (Frontend) |
| src/app/reseller | 3 | Terminal 7 (Frontend) |
| src/app/dashboard/app-developer (subpages) | 12 | Terminal 7 (Frontend) |
| src/app/api (routes) | 18 | Terminal 4 (Server/Routes) |
| src/app/dashboard/content | 2 | Terminal 7 (Frontend) |
| src/app/dashboard/knowledge | 2 | Terminal 7 (Frontend) |
| src/app/dashboard/seo-domination | 2 | Terminal 7 (Frontend) |
| src/app/onboarding | 1 | Terminal 7 (Frontend) |
| src/components/customers | 2 | Terminal 7 (Frontend) |
| src/components/knowledge | 1 | Terminal 7 (Frontend) |
| src/components/gbp | 1 | Terminal 7 (Frontend) |
| src/components/entity | 1 | Terminal 7 (Frontend) |
| src/components/sprint | 1 | Terminal 7 (Frontend) |
| src/components/analytics | 1 | Terminal 7 (Frontend) |
| src/components/app-developer | 1 | Terminal 7 (Frontend) |
| src/lib/integrations/ai | 2 | Terminal 1 (Integrations) |

---

## Detailed file-by-file error listing

### src/server/routes/business/ (38 errors)

| File | Errors | Codes |
|------|--------|-------|
| birthday-engine.ts | 11 | TS18047 (possibly null), TS2339 (missing props on BusinessProfileRow) |
| content-machine.ts | 6 | TS2554 (wrong arg count), TS2339 (missing props) |
| retention-layer.ts | 7 | TS2339, TS2322, TS2554 |
| approval-queue.ts | 4 | TS2339, TS2554 |
| knowledge-base-builder.ts | 5 | TS2554, TS2339 |
| social-media-layer.ts | 1 | TS2554 |
| seo-engine.ts | 1 | TS2554 |
| daily-report-engine.ts | 1 | TS2554 |
| competitor-intelligence.ts | 1 | TS2554 |
| broadcast-engine.ts | 1 | TS2554 |

### src/workers/analytics-seo/jobs/ (40 errors)

| File | Errors | Codes |
|------|--------|-------|
| social-analytics-pull.ts | 5 | TS2554, TS2339 |
| trend-scanning.ts | 3 | TS2554, TS2339 |
| aso-rank-check.ts | 3 | TS2554, TS2339 |
| app-revenue-sync.ts | 3 | TS2554, TS2339 |
| gbp-insights-pull.ts | 2 | TS2554 |
| competitor-rank-tracking.ts | 2 | TS2554 |
| keyword-cannibalisation-scan.ts | 2 | TS2554 |
| lenco-payment-check.ts | 2 | TS2554 |
| niche-research.ts | 2 | TS2554 |
| page-indexing-request.ts | 2 | TS2554 |
| gsc-api-pull.ts | 1 | TS2554 |
| ga4-data-pull.ts | 1 | TS2554 |
| business-audit.ts | 1 | TS2554 |
| client-health-score-update.ts | 1 | TS2554 |
| content-refresh.ts | 1 | TS2554 |
| daily-report-generation.ts | 1 | TS2554 |
| dashboard-aggregation.ts | 1 | TS2554 |
| entity-consistency-check.ts | 1 | TS2554 |
| app-review-monitoring.ts | 1 | TS2554 |
| reputation-velocity-update.ts | 1 | TS2554 |
| sitemap-submission.ts | 1 | TS2554 |
| sprint-mode-end-check.ts | 1 | TS2554 |
| trend-expiry-check.ts | 1 | TS2554 |
| key-rotation.ts | 1 | TS2554 |

### src/workers/social-publishing/jobs/ (27 errors)

| File | Errors | Codes |
|------|--------|-------|
| social-posting.ts | 6 | TS2339, TS2554, TS2322 |
| app-review-reply.ts | 4 | TS2554, TS2339 |
| gbp-posting.ts | 3 | TS2554, TS2339 |
| 14 other job files | 1 each | TS2554 (wrong arg count to mock-data helpers) |

### src/workers/content-generation/jobs/ (20 errors)

| File | Errors | Codes |
|------|--------|-------|
| whisper-transcription.ts | 5 | TS2339, TS2554 |
| voice-generation.ts | 3 | TS2554, TS2339 |
| algorithm-scoring.ts | 2 | TS2554 |
| content-recycling.ts | 2 | TS2554 |
| 8 other job files | 1 each | TS2554 |

### src/workers/shared/ (7 errors)

| File | Errors | Codes |
|------|--------|-------|
| logger.ts | 4 | TS2554 (wrong arg count) |
| types.ts | 1 | TS2322 |
| queues.ts | 1 | TS2322 |
| job-options.ts | 1 | TS2322 |

### src/workers/ai-scene-generation/ (3 errors)

| File | Errors | Codes |
|------|--------|-------|
| worker.ts | 2 | TS2322 |
| runway-video-generation.ts | 1 | TS2554 |

### src/lib/db/ (11 errors)

| File | Errors | Codes |
|------|--------|-------|
| analytics-queries.ts | 9 | TS2339 (missing columns on AnalyticsSnapshotRow), TS2353 (unknown DTO props), TS2802 (Set iteration) |
| admin-queries.ts | 1 | TS2322 (status enum mismatch — active vs approved) |
| seo-queries.ts | 1 | TS2322 (string not assignable to union type) |

### src/lib/api/ (4 errors)

| File | Errors | Codes |
|------|--------|-------|
| mock-data.ts | 4 | TS2304 (BirthdayTokenDTO not found), TS2322 (null not assignable to number) |

### src/lib/integrations/ (21 errors)

| File | Errors | Codes |
|------|--------|-------|
| social/meta.ts | 2 | TS2345 (readonly array), TS2322 (unknown not string) |
| social/linkedin.ts | 2 | TS2345 (readonly array), TS2322 (unknown not string) |
| social/reddit.ts | 2 | TS2345 (readonly array), TS2322 (unknown not string) |
| social/tiktok.ts | 2 | TS2345 (readonly array), TS2322 (unknown not string) |
| social/youtube.ts | 2 | TS2345 (readonly array), TS2322 (unknown not string) |
| app-developer/app-store-connect.ts | 3 | TS2345 (readonly array x2), TS2322 (unknown not string) |
| app-developer/play-console.ts | 3 | TS2345 (readonly array x2), TS2322 (unknown not string) |
| google/gbp.ts | 3 | TS2345 (readonly array x2), TS2322 (unknown not string) |
| ai/vertex-claude.ts | 2 | TS18047 (client possibly null) |

### src/server/routes/admin/ (11 errors)

| File | Errors | Codes |
|------|--------|-------|
| reseller-dashboard.ts | 8 | TS2322, TS2353, TS2741 |
| app-publishing-pipeline.ts | 2 | TS2554 |
| cost-dashboard.ts | 1 | TS2554 |

### src/server/routes/app-developer/ (6 errors)

| File | Errors | Codes |
|------|--------|-------|
| app-analytics-dashboard.ts | 6 | TS2554, TS2339 |

### src/server/routes/shared-modules/ (5 errors)

| File | Errors | Codes |
|------|--------|-------|
| notification-engine.ts | 3 | TS2554, TS2339 |
| oauth-token-manager.ts | 1 | TS2554 |
| bullmq-job-registry.ts | 1 | TS2554 |

### src/app/admin/ (7 errors total across 7 files)

| File | Errors | Codes |
|------|--------|-------|
| page.tsx | 7 | TS2339 (missing props on `{}` typed state) |
| approvals/page.tsx | 2 | TS2339 (map/length on `{}`) |
| apps/page.tsx | 1 | TS2339 |
| businesses/page.tsx | 2 | TS2339 |
| costs/page.tsx | 5 | TS2339 |
| dead-jobs/page.tsx | 1 | TS2339 |
| health/page.tsx | 2 | TS2339 |
| niches/page.tsx | 2 | TS2339 |

### src/app/dashboard/ (34 errors total across 10 subpaths)

| File | Errors | Codes |
|------|--------|-------|
| audit/page.tsx | 5 | TS2322 (`{}` not assignable), TS2339 |
| app-developer/page.tsx | 3 | TS2339 |
| app-developer/analytics/page.tsx | 2 | TS2339 |
| app-developer/aso/page.tsx | 2 | TS2339 |
| app-developer/content/page.tsx | 3 | TS2339 |
| app-developer/profile/page.tsx | 3 | TS2339 |
| app-developer/revenue/page.tsx | 3 | TS2339 |
| app-developer/reviews/page.tsx | 2 | TS2339 |
| app-developer/support/page.tsx | 4 | TS2339 |
| content/page.tsx | 2 | TS2322 |
| content/recycling/page.tsx | 2 | TS2339 |
| knowledge/page.tsx | 2 | TS2802 (Set iteration) |
| seo-domination/page.tsx | 2 | TS2339 |
| seo-domination/cannibalisation/page.tsx | 2 | TS2339 |

### src/app/api/ (18 errors total across 16 route files)

| File | Errors | Codes |
|------|--------|-------|
| admin/health/route.ts | 4 | TS2345 (object not assignable to string) |
| admin/apps/route.ts | 1 | TS2554 |
| admin/dead-jobs/route.ts | 1 | TS2554 |
| app-developer/content/route.ts | 3 | TS2554 |
| app-developer/aso/route.ts | 2 | TS2554 |
| app-developer/reviews/route.ts | 1 | TS2554 |
| app-developer/support/route.ts | 1 | TS2554 |
| community/route.ts | 1 | TS2554 |
| content/recycling/route.ts | 2 | TS2554 |
| faceless/assembly|episode-tracker|episodes|scenes | 1 each | TS2554 |
| knowledge/route.ts | 1 | TS2554 |
| loyalty/route.ts | 2 | TS2554 |
| reseller/pricing/route.ts | 1 | TS2554 |
| ugc/* (5 routes) | 1 each | TS2554 |

### src/app/reseller/ (3 errors)

| File | Errors | Codes |
|------|--------|-------|
| page.tsx | 2 | TS2339 (brandName, primaryColor on `{}`) |
| clients/page.tsx | 1 | TS2339 (businessName on ResellerClientDTO) |

### src/app/onboarding/ (1 error)

| File | Errors | Codes |
|------|--------|-------|
| onboarding/page.tsx | 1 | TS5076 (mixed ?? and || without parens) |

### src/components/ (17 errors total)

| File | Errors | Codes |
|------|--------|-------|
| analytics/SEORankings.tsx | 1 | TS2304 (ProgressBar not found) |
| app-developer/KeywordTracker.tsx | 1 | TS2554 |
| audit/AuditReport.tsx | 1 | TS2322 (sublabel not in ProgressBarProps) |
| audit/BaselineScore.tsx | 2 | TS2322 (sublabel not in ProgressBarProps) |
| customers/SegmentBuilder.tsx | 2 | TS2802 (Set iteration) |
| entity/EntityConsistencyScore.tsx | 1 | TS2322 (sublabel) |
| gbp/GBPManager.tsx | 1 | TS2322 (sublabel) |
| knowledge/KnowledgeBase.tsx | 1 | TS2554 |
| seo-domination/BacklinkTracker.tsx | 2 | TS2322 (sublabel) |
| seo-domination/CannibalisationReport.tsx | 1 | TS2352 (DTO to Record cast) |
| seo-domination/IndexGrowthChart.tsx | 2 | TS2322 (sublabel) |
| sprint/SprintStatus.tsx | 1 | TS2322 (sublabel) |

---

## Recurring error patterns

1. **TS2554 — Wrong argument count (60 errors):** Nearly all `src/workers/` and `src/app/api/` route files call mock-data or server helper functions with fewer arguments than their signatures expect. This is a systemic issue from Phase 2 stub functions being expanded in Phase 3+ without updating all call sites.

2. **TS2339 — Missing property on `{}` (92 errors):** Frontend pages in `src/app/admin/` and `src/app/dashboard/` use `useState({})` or fetch responses typed as `{}`. All destructured properties (`.map`, `.length`, `.totalRevenue`, etc.) fail. Needs proper DTO typing on all page-level state.

3. **TS2322 sublabel on ProgressBarProps (8 errors):** Multiple components pass a `sublabel` prop to `<ProgressBar>` but `ProgressBarProps` doesn't declare it. Either add `sublabel` to the shared `ProgressBarProps` type or remove the prop from all call sites.

4. **TS2345 readonly array not assignable (10 errors):** `as const` arrays in integration files produce `readonly` tuples that can't be assigned to `unknown[]` or `string[]` parameters. Fix with `[...] as string[]` or by widening parameter types.

5. **TS2802 Set iteration (10 errors):** Code iterates `Set<string>` with `for...of` or spread, but `tsconfig.json` target is below ES2015. Fix by setting `"target": "es2017"` or adding `"downlevelIteration": true` in `tsconfig.json`.

6. **TS18047 possibly null (5 errors):** Vertex AI client and birthday engine access `.data` on possibly-null config results. Add null checks or non-null assertions with justification.

---

## Terminal 6 owned files — clean

| File | Errors |
|------|--------|
| src/middleware.ts | 0 |
| src/lib/auth/types.ts | 0 |
| src/lib/auth/rbac.ts | 0 |
| src/lib/auth/supabase-auth.ts | 0 |
| src/lib/auth/session.ts | 0 |
| src/lib/auth/custom-claims.ts | 0 |
| src/lib/auth/index.ts | 0 |
| src/lib/security/encryption.ts | 0 |
| src/lib/security/rate-limiter.ts | 0 |
| src/lib/security/content-safety.ts | 0 |
| src/lib/security/oauth-token-manager.ts | 0 |
| src/lib/security/key-manager.ts | 0 |
| src/lib/security/invoice-encryption.ts | 0 |
| src/lib/security/key-rotation-scheduler.ts | 0 |
| src/lib/security/index.ts | 0 |
| src/lib/encryption/index.ts | 0 |
