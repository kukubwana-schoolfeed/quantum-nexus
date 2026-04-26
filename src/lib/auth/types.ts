/**
 * Quantum Nexus — Auth Type Definitions
 * Terminal 3 — Security, Auth, Middleware
 *
 * Defines all authentication and session-related types
 * used across the auth and middleware layers.
 *
 * @module auth/types
 */

/** Supported user roles in the platform */
export type UserRole =
  | 'business_owner'
  | 'ugc_creator'
  | 'faceless_creator'
  | 'agency_admin'
  | 'super_admin';

/** Supported subscription tiers */
export type Tier = 'basic' | 'growth' | 'pro' | 'enterprise' | 'internal';

/** Tenant account status values */
export type TenantStatus = 'active' | 'suspended' | 'archived' | 'pending_approval';

/**
 * JWT claims embedded in every authenticated session.
 * tenant_id is ALWAYS derived from JWT — never from request body (RULE MT-2).
 */
export interface SessionClaims {
  /** Unique user identifier (maps to Supabase Auth sub) */
  sub: string;
  /** Tenant (business) identifier — sourced from JWT only */
  tenant_id: string;
  /** User's role within the platform */
  role: UserRole;
  /** Subscription tier determining feature access */
  tier: Tier;
  /** Reseller identifier, null if not associated with a reseller */
  reseller_id: string | null;
}

/** Result of session validation */
export interface SessionValidationResult {
  /** Whether the session is valid */
  valid: boolean;
  /** Human-readable reason if invalid */
  reason?: string;
  /** The session claims if valid */
  claims?: SessionClaims;
}

/** Result of tenant status check */
export interface TenantStatusResult {
  /** Whether the tenant is active and in good standing */
  active: boolean;
  /** Current status of the tenant account */
  status: TenantStatus;
}

/** Permission identifiers for RBAC */
export type Permission =
  | 'content:read'
  | 'content:write'
  | 'content:publish'
  | 'social:connect'
  | 'social:post'
  | 'seo:manage'
  | 'calls:handle'
  | 'customers:read'
  | 'customers:write'
  | 'billing:manage'
  | 'admin:access'
  | 'admin:approve'
  | 'reseller:manage'
  | 'api-keys:manage'
  | 'analytics:read'
  | 'broadcasts:send'
  | 'ugc:manage'
  | 'faceless:manage'
  | 'apps:manage';

/** Tier-to-feature mapping for tier guard enforcement */
export interface TierFeatureMap {
  [key: string]: Tier[];
}

/** Role-to-permissions mapping for RBAC enforcement */
export interface RolePermissionMap {
  [role: string]: Permission[];
}