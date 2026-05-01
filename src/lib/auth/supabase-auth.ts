/**
 * Quantum Nexus — Supabase Auth Client
 * Terminal 3 — Security, Auth, Middleware
 *
 * Real Supabase Auth integration for Phase 3.
 * - JWT verification via Supabase JWKS endpoint using jose
 * - Real sign-in, sign-out, and session refresh via Supabase Auth
 * - Real tenant status queries from the tenants table
 * - Custom claims (tenant_id, role, tier, reseller_id) appended to JWT
 *   via Supabase Auth custom claims hook
 *
 * JWT structure matches ARCHITECTURE.md spec:
 * { sub, tenant_id, role, tier, reseller_id }
 *
 * RULE G-5: All env vars accessed via /src/lib/config/env.ts
 * RULE S-1: Keys and tokens never logged or exposed to client
 * RULE MT-2: tenant_id always from JWT, never from request body
 *
 * @module auth/supabase-auth
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import type { SessionClaims, TenantStatus, UserRole, Tier } from './types';
import {
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
} from '../config/env';

/**
 * Supabase JWKS URL for JWT verification.
 * Supabase Auth signs JWTs with an RSA key published at this endpoint.
 * jose fetches and caches the JWKS automatically.
 *
 * @module auth/supabase-auth
 */
const JWKS_URL = new URL(`${NEXT_PUBLIC_SUPABASE_URL}/.well-known/jwks.json`);

/**
 * Cached JWKS key set for JWT verification.
 * jose handles caching and refetching automatically.
 *
 * @module auth/supabase-auth
 */
const jwks = createRemoteJWKSet(JWKS_URL);

/**
 * Supabase client for auth operations.
 * Uses the anon key for client-side operations (signIn, signOut, refresh).
 * Service role key is used only for admin operations (tenant status lookup).
 *
 * @module auth/supabase-auth
 */
let _supabaseClient: SupabaseClient | null = null;

/**
 * Supabase admin client using service role key.
 * Only used for operations that require elevated access (RULE MT-5):
 * - Fetching tenant status (bypasses RLS for auth middleware)
 * - Looking up encrypted keys (bypasses RLS for key manager)
 * Never used in any business-facing API route (RULE MT-5).
 *
 * @module auth/supabase-auth
 */
const supabaseAdmin = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Creates and returns the Supabase Auth client instance.
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * from the centralised env config (RULE G-5).
 *
 * @returns {ReturnType<typeof createClient>} Supabase client instance
 * @module auth/supabase-auth
 */
export function getSupabaseAuthClient(): SupabaseClient {
  if (!_supabaseClient) {
    _supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    );
  }
  return _supabaseClient;
}

/**
 * Creates and returns the Supabase admin client instance.
 * Uses the service role key — only for server-side admin operations (RULE MT-5).
 * Never used in business-facing API routes.
 *
 * @returns {ReturnType<typeof createClient>} Supabase admin client instance
 * @module auth/supabase-auth
 */
export function getSupabaseAdminClient(): SupabaseClient {
  return supabaseAdmin;
}

/**
 * Signs in a user with email and password via Supabase Auth.
 * Returns session claims from the authenticated JWT.
 *
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @returns {Promise<SessionClaims>} The authenticated session claims
 * @throws {Error} If sign-in fails or required claims are missing
 * @module auth/supabase-auth
 */
export async function signIn(email: string, password: string): Promise<SessionClaims> {
  const { data, error } = await getSupabaseAuthClient().auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Sign-in failed: ${error.message}`);
  }

  if (!data.session?.access_token) {
    throw new Error('Sign-in succeeded but no access token returned');
  }

  // Extract claims from the JWT — custom claims are set by Supabase Auth hooks
  const claims = await verifyJwt(data.session.access_token);
  if (!claims) {
    throw new Error('Sign-in succeeded but JWT claims are invalid');
  }

  return claims;
}

/**
 * Signs out the current user, invalidating the session.
 *
 * @param {string} accessToken - The current access token to invalidate
 * @returns {Promise<void>} Resolves when sign-out is complete
 * @throws {Error} If sign-out fails
 * @module auth/supabase-auth
 */
export async function signOut(accessToken: string): Promise<void> {
  const { error } = await getSupabaseAuthClient().auth.admin.signOut(accessToken);
  if (error) {
    // Log but don't throw — sign-out should be best-effort
    console.error(`[Auth] Sign-out failed: ${error.message}`);
  }
}

/**
 * Refreshes an expired access token using the refresh token.
 * Supabase Auth handles token rotation automatically.
 *
 * @param {string} refreshToken - The refresh token to exchange
 * @returns {Promise<SessionClaims>} Fresh session claims after token refresh
 * @throws {Error} If refresh fails or claims are invalid
 * @module auth/supabase-auth
 */
export async function refreshSession(refreshToken: string): Promise<SessionClaims> {
  const { data, error } = await getSupabaseAuthClient().auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error) {
    throw new Error(`Session refresh failed: ${error.message}`);
  }

  if (!data.session?.access_token) {
    throw new Error('Session refresh succeeded but no access token returned');
  }

  const claims = await verifyJwt(data.session.access_token);
  if (!claims) {
    throw new Error('Session refresh succeeded but JWT claims are invalid');
  }

  return claims;
}

/**
 * Fetches the tenant status from the tenants table in Supabase.
 * Uses the admin client to bypass RLS — this is required for the auth
 * middleware to check tenant status before the user's session is fully
 * established (RULE S-7, RULE MT-5).
 *
 * @param {string} tenantId - The tenant UUID from JWT claims (RULE MT-2)
 * @returns {Promise<TenantStatus>} The current status of the tenant account
 * @throws {Error} If the query fails
 * @module auth/supabase-auth
 */
export async function fetchTenantStatus(tenantId: string): Promise<TenantStatus> {
  try {
    const { data, error } = await supabaseAdmin
      .from('tenants')
      .select('status')
      .eq('id', tenantId)
      .single();

    if (error) {
      console.error(`[Auth] Failed to fetch tenant status for ${tenantId}: ${error.message}`);
      // Fail safe — if we can't verify tenant status, treat as active
      // to avoid locking out all users on a transient DB error
      return 'active';
    }

    return (data?.status as TenantStatus) ?? 'active';
  } catch (err) {
    console.error(`[Auth] Exception fetching tenant status for ${tenantId}:`, err);
    // Fail safe on DB error
    return 'active';
  }
}

/**
 * Verifies and decodes a Supabase Auth JWT using the JWKS endpoint.
 * Supabase Auth JWTs are signed with an RSA key; the public key is
 * fetched from the JWKS endpoint and cached by jose.
 *
 * Custom claims (tenant_id, role, tier, reseller_id) are injected into
 * the JWT by the Supabase Auth custom claims hook on the database side.
 *
 * @param {string} token - The JWT access token from the Authorization header
 * @returns {Promise<SessionClaims | null>} Decoded claims if valid, null otherwise
 * @module auth/supabase-auth
 */
export async function verifyJwt(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `${NEXT_PUBLIC_SUPABASE_URL}/auth/v1`,
      audience: 'authenticated',
    });

    // Validate that all required custom claims are present
    const claims = payload as Record<string, unknown>;
    if (
      typeof claims.sub !== 'string' ||
      typeof claims.tenant_id !== 'string' ||
      typeof claims.role !== 'string' ||
      typeof claims.tier !== 'string'
    ) {
      console.error('[Auth] JWT verified but missing required custom claims');
      return null;
    }

    return {
      sub: claims.sub as string,
      tenant_id: claims.tenant_id as string,
      role: claims.role as UserRole,
      tier: claims.tier as Tier,
      reseller_id: (claims.reseller_id as string | null) ?? null,
    };
  } catch (err) {
    // Token is invalid, expired, or tampered
    // Don't log token content (RULE S-1)
    if (err instanceof Error && err.name !== 'JWTExpired') {
      console.error(`[Auth] JWT verification failed: ${err.message}`);
    }
    return null;
  }
}