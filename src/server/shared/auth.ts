/**
 * Server Authentication Utilities
 * @module server/shared/auth
 * @description Extracts and validates session claims from authenticated requests.
 * RULE S-7: All API routes must validate authenticated session before processing.
 * RULE MT-2: tenant_id always derived from JWT, never from request body or URL params.
 */

import type { SessionClaims, TenantStatus } from '@/lib/api/types';

/**
 * Extracts session claims from the authenticated request's JWT.
 * @param request - The incoming Next.js request object
 * @returns SessionClaims containing sub, tenant_id, role, tier, reseller_id
 * @throws Error if no valid session is found
 */
export async function getSessionClaims(request: Request): Promise<SessionClaims> {
  // PLACEHOLDER: Supabase Auth — JWT extraction
  // REAL INTEGRATION: /src/lib/auth/session.ts
  // PHASE: 2
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    throw new Error('Unauthorized: No authorization header');
  }
  // Mock session for Phase 1
  return {
    sub: 'mock-user-id',
    tenant_id: 'mock-tenant-id',
    role: 'business_owner',
    tier: 'growth',
    reseller_id: null,
  };
}

/**
 * Validates that the tenant is in an active status and can use platform features.
 * RULE B-3: pending_approval accounts cannot access any platform features.
 * @param tenantId - The tenant's UUID
 * @returns Object with valid status and tenant status string
 */
export async function validateTenantStatus(tenantId: string): Promise<{
  valid: boolean;
  status: TenantStatus;
}> {
  // PLACEHOLDER: Supabase — tenant status check
  // REAL INTEGRATION: /src/lib/db/tenant-queries.ts
  // PHASE: 2
  return { valid: true, status: 'active' };
}

/**
 * Checks if the user's role is authorized for the required permission.
 * @param claims - The session claims of the authenticated user
 * @param requiredRoles - Array of roles that are allowed access
 * @returns True if the user has one of the required roles
 */
export function hasRole(claims: SessionClaims, requiredRoles: string[]): boolean {
  return requiredRoles.includes(claims.role);
}

/**
 * Checks if the user is a super admin.
 * @param claims - The session claims of the authenticated user
 * @returns True if the user has super_admin role
 */
export function isSuperAdmin(claims: SessionClaims): boolean {
  return claims.role === 'super_admin';
}
