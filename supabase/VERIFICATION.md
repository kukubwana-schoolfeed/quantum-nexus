# Quantum Nexus — Database Schema Verification Report

**Phase:** 7 (Final Polish)
**Terminal:** 4 (Database)
**Date:** 2026-04-18
**Migrations Audited:** 26 files (23 CREATE + 3 ALTER)

---

## Summary

| Check | Result |
|-------|--------|
| tenant_id indexes | 20/20 present |
| RLS on tenant-scoped tables | 18/20 enabled (2 intentional exceptions) |
| RLS policy consistency | 17/18 full CRUD (1 service-role-only by design) |
| FK cascade on tenant_id | 18/20 ON DELETE CASCADE (2 nullable by design) |
| Platform-level tables (no RLS) | 3 correct exclusions |

**Overall Status: PASS**

---

## Table-by-Table Audit

### Platform-Level Tables (no tenant_id, no RLS required)

| Table | tenant_id | RLS | Verdict |
|-------|-----------|-----|---------|
| `resellers` | none | No | Correct — agency accounts, service-role access only |
| `tenants` | none (IS tenant) | No | Correct — master record, application-layer isolation |
| `niche_profiles` | none | No | Correct — shared across tenants in same niche |

### Tenant-Scoped Tables — Full RLS + CRUD Policies

| # | Table | Index Name | RLS Enabled | SELECT | INSERT | UPDATE | DELETE | FK Cascade | Verdict |
|---|-------|-----------|-------------|--------|--------|--------|--------|-------------|---------|
| 1 | `business_profiles` | `idx_business_profiles_tenant` | Yes | Yes | Yes | Yes | Yes | CASCADE | Pass |
| 2 | `content_posts` | `idx_content_posts_tenant` | Yes | Yes | Yes | Yes | Yes | CASCADE | Pass |
| 3 | `customers` | `idx_customers_tenant` | Yes | Yes | Yes | Yes | Yes | CASCADE | Pass |
| 4 | `seo_tasks` | `idx_seo_tasks_tenant` | Yes | Yes | Yes | Yes | Yes | CASCADE | Pass |
| 5 | `indexed_pages` | `idx_indexed_pages_tenant` | Yes | Yes | Yes | Yes | Yes | CASCADE | Pass |
| 6 | `trends` | `idx_trends_tenant` | Yes | Yes | Yes | Yes | Yes | CASCADE | Pass |
| 7 | `business_audits` | `idx_business_audits_tenant` | Yes | Yes | Yes | Yes | Yes | CASCADE | Pass |
| 8 | `reputation_velocity` | `idx_reputation_velocity_tenant` | Yes | Yes | Yes | Yes | Yes | CASCADE | Pass |
| 9 | `client_health_scores` | `idx_client_health_tenant` | Yes | Yes | Yes | Yes | Yes | CASCADE | Pass |
| 10 | `entity_listings` | `idx_entity_listings_tenant` | Yes | Yes | Yes | Yes | Yes | CASCADE | Pass |
| 11 | `cannibalisation_reports` | `idx_cannibalisation_tenant` | Yes | Yes | Yes | Yes | Yes | CASCADE | Pass |
| 12 | `analytics_snapshots` | `idx_analytics_snapshots_tenant` | Yes | Yes | Yes | Yes | Yes | CASCADE | Pass |
| 13 | `invoices` | `idx_invoices_tenant` | Yes | Yes | Yes | Yes | Yes | CASCADE | Pass |
| 14 | `notifications` | `idx_notifications_tenant` | Yes | Yes | Yes | Yes | Yes | CASCADE | Pass |
| 15 | `loyalty_transactions` | `idx_loyalty_tenant` | Yes | Yes | Yes | Yes | Yes | CASCADE | Pass |
| 16 | `birthday_tokens` | `idx_birthday_tokens_tenant` | Yes | Yes | Yes | Yes | Yes | CASCADE | Pass |
| 17 | `knowledge_base` | `idx_knowledge_base_tenant` | Yes | Yes | Yes | Yes | Yes | CASCADE | Pass |

### Tenant-Scoped Tables — Intentional RLS Exceptions

| Table | Index Name | RLS | Reason | Verdict |
|-------|-----------|-----|--------|---------|
| `encrypted_keys` | `idx_encrypted_keys_tenant` | Enabled, no policies | Security: RLS enabled with zero policies = no auth user access. Service-role only. This is the correct pattern for sensitive credential storage. | Pass |
| `platform_users` | `idx_platform_users_tenant` | Not enabled | Super admins and agency admins need cross-tenant visibility. Role-based access enforced at application layer. tenant_id is nullable (super_admin has no tenant). | Pass |
| `dead_jobs` | `idx_dead_jobs_tenant` | Not enabled | Platform-level monitoring table. Super admin review only. tenant_id is nullable (some jobs are system-wide). No CASCADE — dead jobs are retained for forensics after tenant deletion. | Pass |

---

## RLS Policy Pattern Verification

All 17 tenant-scoped tables with CRUD policies use the identical pattern:

```sql
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)    -- SELECT, UPDATE, DELETE
WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid) -- INSERT
```

Consistency: **PASS** — no deviations detected.

---

## Foreign Key Audit

### ON DELETE CASCADE (18 tables)

All tenant-scoped tables with `NOT NULL` tenant_id use `ON DELETE CASCADE`:

`business_profiles`, `content_posts`, `customers`, `seo_tasks`, `indexed_pages`,
`trends`, `business_audits`, `reputation_velocity`, `client_health_scores`,
`entity_listings`, `cannibalisation_reports`, `analytics_snapshots`, `invoices`,
`notifications`, `loyalty_transactions`, `birthday_tokens`, `knowledge_base`,
`encrypted_keys`

### Nullable FK without CASCADE (2 tables)

| Table | tenant_id Nullable | No CASCADE | Reason |
|-------|-------------------|------------|--------|
| `platform_users` | Yes | Yes | super_admin/agency_admin have no tenant; row survives tenant deletion |
| `dead_jobs` | Yes | Yes | Retained for forensic analysis after tenant deletion |

Verdict: **PASS** — both exceptions are intentional and correct.

---

## Alter Migration Audit

| File | Changes | Indexes Added | RLS Impact | Verdict |
|------|---------|--------------|------------|---------|
| `20260417000001_alter_encrypted_keys_add_key_type.sql` | Adds `key_type` column + CHECK | `idx_encrypted_keys_type`, `idx_encrypted_keys_tenant_type_expires` (partial) | None | Pass |
| `20260417000002_alter_tenants_add_churned_status.sql` | Expands status CHECK, adds `churned_at` | None (existing `idx_tenants_status` covers new value) | None | Pass |
| `20260417000003_alter_content_posts_add_target_platform.sql` | Adds `target_platform` + `repurposed_from_id`, expands status CHECK | `idx_content_posts_target_platform` (partial) | None | Pass |

---

## Additional Index Coverage

Beyond tenant_id indexes, the following secondary indexes exist:

| Table | Index | Column(s) |
|-------|-------|-----------|
| `tenants` | `idx_tenants_status` | status |
| `tenants` | `idx_tenants_tier` | tier |
| `tenants` | `idx_tenants_reseller` | reseller_id |
| `tenants` | `idx_tenants_slug` | slug |
| `platform_users` | `idx_platform_users_role` | role |
| `content_posts` | `idx_content_posts_status` | status |
| `content_posts` | `idx_content_posts_scheduled` | scheduled_for |
| `content_posts` | `idx_content_posts_platform` | platform |
| `content_posts` | `idx_content_posts_target_platform` | target_platform (partial) |
| `customers` | `idx_customers_tier` | tier |
| `customers` | `idx_customers_birthday` | birth_month, birth_day |
| `seo_tasks` | `idx_seo_tasks_date` | task_date |
| `seo_tasks` | `idx_seo_tasks_status` | status |
| `indexed_pages` | `idx_indexed_pages_date` | indexed_at |
| `trends` | `idx_trends_status` | status |
| `trends` | `idx_trends_score` | score DESC |
| `business_audits` | `idx_business_audits_type` | audit_type |
| `reputation_velocity` | `idx_reputation_velocity_week` | week_start DESC |
| `client_health_scores` | `idx_client_health_date` | score_date DESC |
| `entity_listings` | `idx_entity_listings_status` | status |
| `cannibalisation_reports` | `idx_cannibalisation_status` | status |
| `analytics_snapshots` | `idx_analytics_snapshots_time` | snapshot_at DESC |
| `invoices` | `idx_invoices_status` | status |
| `notifications` | `idx_notifications_read` | read |
| `loyalty_transactions` | `idx_loyalty_customer` | customer_id |
| `birthday_tokens` | `idx_birthday_tokens_token` | token |
| `knowledge_base` | `idx_knowledge_base_category` | category |
| `dead_jobs` | `idx_dead_jobs_reviewed` | reviewed |
| `dead_jobs` | `idx_dead_jobs_failed` | failed_at DESC |
| `encrypted_keys` | `idx_encrypted_keys_type` | key_type |
| `encrypted_keys` | `idx_encrypted_keys_tenant_type_expires` | tenant_id, key_type, expires_at (partial) |

---

## Findings and Recommendations

### No Issues Found

All 26 migration files are consistent and correct:

1. Every tenant-scoped table has a `tenant_id` index
2. RLS is enabled on all tables that contain tenant data, with appropriate policies
3. The three tables without RLS (`resellers`, `tenants`, `niche_profiles`) are correctly platform-level
4. The three intentional RLS exceptions (`encrypted_keys`, `platform_users`, `dead_jobs`) are justified by security or cross-tenant access requirements
5. All RLS policies use the same JWT claim pattern for consistency
6. FK cascade behavior is correct — CASCADE for owned data, no CASCADE where retention is needed
7. Alter migrations add indexes where needed without breaking existing RLS or constraints

### Advisory Notes (non-blocking)

- **`encrypted_keys`** has RLS enabled with zero policies. This is correct (service-role only), but consider adding a comment in the migration file explicitly stating this is intentional for future maintainers.
- **`platform_users`** lacks RLS. If multi-tenant JWT tokens could ever leak, a tenant_id check at the application layer is the only guard. Verify that middleware enforces this consistently.
- **`dead_jobs`** nullable `tenant_id` without CASCADE is correct for forensics, but some dead jobs may reference deleted tenants. Consider adding `ON DELETE SET NULL` to allow tenant cleanup while preserving job records.

---

*Report generated by Terminal 4 — Database. Phase 7 verification complete.*
