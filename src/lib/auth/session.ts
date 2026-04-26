/**
 * Quantum Nexus — Session Handling
 * Terminal 3 — Security, Auth, Middleware
 *
 * Extracts and validates JWT session claims from incoming requests.
 * All tenant_id values are derived from the JWT — never from request body,
 * URL parameters, or query strings (RULE MT-2).
 *
 * PHASE 3: Real Supabase Auth JWT verification via JWKS.
 * No mock fallbacks — unauthenticated requests are rejected.
 * tenant_id ALWAYS from JWT claims — RULE MT-2 enforced.
 * Tenant status checked against real Supabase tenants table (RULE S-7).
 *
 * @module auth/session
 */

import type {
  SessionClaims,
  SessionValidationResult,
  TenantStatusResult,
  TenantStatus,
  UserRole,
} from './types';
import { verifyJwt, fetchTenantStatus } from './supabase-auth';

/** Cookie name used to store the Supabase access token */
const AUTH_COOKIE_NAME = 'sb-access-token';

/** Header name for request context propagation from middleware */
const SESSION_CLAIMS_HEADER = 'x-session-claims';

/**
 * Extracts the JWT token from a Next.js request.
 * Checks Authorization header first (Bearer token), then falls back to cookie.
 *
 * @param {Request} request - The incoming HTTP request
 * @returns {string | null} The JWT token string, or null if not found
 * @module auth/session
 */
export function extractToken(request: Request): string | null {
  // Check Authorization: Bearer <token> header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // Fallback: check cookie (for browser-initiated requests)
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=');
        return [k, v.join('=')];
      })
    );
    if (cookies[AUTH_COOKIE_NAME]) {
      return cookies[AUTH_COOKIE_NAME];
    }
  }

  return null;
}

/**
 * Validates the authenticated session from a Next.js request.
 * Checks JWT signature and expiry via Supabase JWKS.
 * Also verifies tenant is not suspended/archived/pending (RULE S-7).
 *
 * @param {Request} request - The incoming HTTP request with Authorization header or cookie
 * @returns {SessionValidationResult} Whether the session is valid, with reason and claims if valid
 * @module auth/session
 */
export async function validateSession(request: Request): Promise<SessionValidationResult> {
  const token = extractToken(request);

  if (!token) {
    return { valid: false, reason: 'No authentication token provided' };
  }

  // Verify and decode the JWT via Supabase JWKS
  const claims = await verifyJwt(token);

  if (!claims) {
    return { valid: false, reason: 'Invalid or expired authentication token' };
  }

  // Check tenant status — reject suspended/archived/pending (RULE S-7)
  const tenantStatus = await fetchTenantStatus(claims.tenant_id);
  if (tenantStatus !== 'active') {
    return {
      valid: false,
      reason: `Tenant account is ${tenantStatus}. Access denied.`,
      claims,
    };
  }

  return { valid: true, claims };
}

/**
 * Extracts session claims from the authenticated JWT.
 * tenant_id is ALWAYS from JWT claims — never from request body (RULE MT-2).
 *
 * First attempts to read claims from the x-session-claims header (set by middleware).
 * Falls back to extracting and verifying the JWT from the request directly.
 *
 * @param {Request} request - The incoming HTTP request with valid JWT
 * @returns {Promise<SessionClaims>} The extracted JWT claims including tenant_id, role, and tier
 * @throws {Error} If no valid session can be established
 * @module auth/session
 */
export async function getSessionClaims(request: Request): Promise<SessionClaims> {
  // Fast path: read claims propagated by middleware via custom header
  const propagatedClaims = request.headers.get(SESSION_CLAIMS_HEADER);
  if (propagatedClaims) {
    try {
      return JSON.parse(propagatedClaims) as SessionClaims;
    } catch {
      // Malformed header — fall through to full verification
    }
  }

  // Full path: verify JWT and extract claims
  const token = extractToken(request);
  if (!token) {
    throw new Error('No authentication token provided. Access denied.');
  }

  const claims = await verifyJwt(token);
  if (!claims) {
    throw new Error('Invalid or expired authentication token. Access denied.');
  }

  return claims;
}

/**
 * Checks whether a tenant account is active and in good standing.
 * Rejects tenants that are suspended, archived, or pending_approval (RULE S-7).
 * Queries the real Supabase tenants table via admin client.
 *
 * @param {string} tenantId - The tenant UUID to check (from JWT, never from request body)
 * @returns {Promise<TenantStatusResult>} Whether the tenant is active and its current status
 * @module auth/session
 */
export async function isTenantActive(tenantId: string): Promise<TenantStatusResult> {
  const status: TenantStatus = await fetchTenantStatus(tenantId);
  return {
    active: status === 'active',
    status,
  };
}

/**
 * Convenience function to extract tenant_id from request JWT.
 * Enforces that tenant_id comes only from the authenticated session (RULE MT-2).
 *
 * @param {Request} request - The incoming HTTP request with valid JWT
 * @returns {Promise<string>} The tenant_id from JWT claims
 * @throws {Error} If session is invalid or tenant_id is missing from claims
 * @module auth/session
 */
export async function getTenantId(request: Request): Promise<string> {
  const claims = await getSessionClaims(request);
  if (!claims.tenant_id) {
    throw new Error('tenant_id missing from session claims');
  }
  return claims.tenant_id;
}

/**
 * Convenience function to extract user role from request JWT.
 *
 * @param {Request} request - The incoming HTTP request with valid JWT
 * @returns {Promise<UserRole>} The user role from JWT claims
 * @module auth/session
 */
export async function getUserRole(request: Request): Promise<UserRole> {
  const claims = await getSessionClaims(request);
  return claims.role;
}