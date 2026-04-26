/**
 * Quantum Nexus — Auth Module Barrel Exports
 * Terminal 3 — Security, Auth, Middleware
 *
 * Re-exports all auth module public APIs.
 *
 * @module auth
 */

export type {
  UserRole,
  Tier,
  TenantStatus,
  SessionClaims,
  SessionValidationResult,
  TenantStatusResult,
  Permission,
  TierFeatureMap,
  RolePermissionMap,
} from './types';

export {
  extractToken,
  validateSession,
  getSessionClaims,
  isTenantActive,
  getTenantId,
  getUserRole,
} from './session';

export {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getRolePermissions,
  requirePermission,
  checkRequestPermission,
  requirePermissionForRequest,
} from './rbac';

export {
  getSupabaseAuthClient,
  getSupabaseAdminClient,
  signIn,
  signOut,
  refreshSession,
  fetchTenantStatus,
  verifyJwt,
} from './supabase-auth';