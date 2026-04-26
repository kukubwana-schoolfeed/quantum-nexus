/**
 * Quantum Nexus — Role-Based Access Control (RBAC)
 * Terminal 3 — Security, Auth, Middleware
 *
 * Enforces role-based permissions across the platform.
 * Each role has a defined set of permissions.
 * Super admin has unrestricted access.
 * Resellers can only manage their own clients (RULE B-4).
 *
 * PHASE 2: Full RBAC enforcement integrated with middleware and API routes.
 * Session claims propagated via x-session-claims header from middleware.
 *
 * @module auth/rbac
 */

import type { Permission, RolePermissionMap, UserRole, SessionClaims } from './types';
import { getSessionClaims } from './session';

/**
 * Role-to-permission mapping defining what each role can access.
 * Super admin has unrestricted access and is checked separately.
 *
 * @module auth/rbac
 */
const ROLE_PERMISSIONS: RolePermissionMap = {
  business_owner: [
    'content:read',
    'content:write',
    'content:publish',
    'social:connect',
    'social:post',
    'seo:manage',
    'calls:handle',
    'customers:read',
    'customers:write',
    'analytics:read',
    'broadcasts:send',
    'api-keys:manage',
  ],
  ugc_creator: [
    'content:read',
    'content:write',
    'ugc:manage',
    'analytics:read',
  ],
  faceless_creator: [
    'content:read',
    'content:write',
    'faceless:manage',
    'analytics:read',
  ],
  agency_admin: [
    'content:read',
    'content:write',
    'content:publish',
    'social:connect',
    'social:post',
    'seo:manage',
    'customers:read',
    'customers:write',
    'analytics:read',
    'broadcasts:send',
    'reseller:manage',
    'api-keys:manage',
  ],
  super_admin: [
    // Super admin has unrestricted access — checked separately in middleware
    'content:read',
    'content:write',
    'content:publish',
    'social:connect',
    'social:post',
    'seo:manage',
    'calls:handle',
    'customers:read',
    'customers:write',
    'billing:manage',
    'admin:access',
    'admin:approve',
    'reseller:manage',
    'api-keys:manage',
    'analytics:read',
    'broadcasts:send',
    'ugc:manage',
    'faceless:manage',
    'apps:manage',
  ],
};

/**
 * Checks whether a given role has a specific permission.
 *
 * @param {UserRole} role - The user's role from JWT claims
 * @param {Permission} permission - The permission to check against
 * @returns {boolean} True if the role has the permission
 * @module auth/rbac
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  // Super admin always has permission (checked separately as safety net)
  if (role === 'super_admin') {
    return true;
  }
  const rolePerms = ROLE_PERMISSIONS[role];
  if (!rolePerms) {
    return false;
  }
  return rolePerms.includes(permission);
}

/**
 * Checks whether a given role has all of the specified permissions.
 *
 * @param {UserRole} role - The user's role from JWT claims
 * @param {Permission[]} permissions - Array of permissions to check
 * @returns {boolean} True if the role has ALL specified permissions
 * @module auth/rbac
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Checks whether a given role has at least one of the specified permissions.
 *
 * @param {UserRole} role - The user's role from JWT claims
 * @param {Permission[]} permissions - Array of permissions to check
 * @returns {boolean} True if the role has at least one specified permission
 * @module auth/rbac
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Returns all permissions assigned to a given role.
 *
 * @param {UserRole} role - The user's role from JWT claims
 * @returns {Permission[]} Array of permissions the role possesses
 * @module auth/rbac
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Requires that a role has a specific permission, throwing if not.
 * Used in API route handlers for explicit permission enforcement (RULE G-3, RULE S-7).
 *
 * @param {UserRole} role - The user's role from JWT claims
 * @param {Permission} permission - The required permission
 * @throws {Error} If the role does not have the required permission
 * @module auth/rbac
 */
export function requirePermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Access denied: role '${role}' requires permission '${permission}'`);
  }
}

/**
 * Extracts session claims from a request and checks if the user has a specific permission.
 * Convenience function for API route handlers — reads claims from the
 * x-session-claims header set by middleware.
 *
 * @param {Request} request - The incoming request (with x-session-claims header)
 * @param {Permission} permission - The required permission
 * @returns {Promise<{ allowed: boolean; claims: SessionClaims }>} Whether access is allowed and the session claims
 * @module auth/rbac
 */
export async function checkRequestPermission(
  request: Request,
  permission: Permission
): Promise<{ allowed: boolean; claims: SessionClaims }> {
  const claims = await getSessionClaims(request);
  return {
    allowed: hasPermission(claims.role, permission),
    claims,
  };
}

/**
 * Requires that the authenticated user has a specific permission for a request.
 * Convenience function for API route handlers.
 * Throws with a standardised error if the permission check fails.
 *
 * @param {Request} request - The incoming request (with x-session-claims header)
 * @param {Permission} permission - The required permission
 * @returns {Promise<SessionClaims>} The session claims if the permission check passes
 * @throws {Error} If the user does not have the required permission
 * @module auth/rbac
 */
export async function requirePermissionForRequest(
  request: Request,
  permission: Permission
): Promise<SessionClaims> {
  const { allowed, claims } = await checkRequestPermission(request, permission);
  if (!allowed) {
    throw new Error(`Access denied: role '${claims.role}' requires permission '${permission}'`);
  }
  return claims;
}