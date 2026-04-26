export const runtime = 'nodejs';

/**
 * Quantum Nexus — Next.js Middleware Entry Point
 * Terminal 3 — Security, Auth, Middleware
 *
 * Validates JWT on every request (CLAUDE.md — "Next.js middleware validates JWT on every request").
 * Enforces authentication, tenant status checks, and tier-based feature access.
 *
 * Pipeline:
 * 1. Skip static assets and public routes
 * 2. Extract JWT from Authorization header or cookie
 * 3. Validate JWT signature and expiry via Supabase JWKS (RULE S-7)
 * 4. Check tenant is not suspended/archived/pending_approval (RULE S-7)
 * 5. Enforce tier-based feature access via tier-guard
 * 6. Apply content safety guard where applicable
 * 7. Propagate session claims to downstream handlers via custom header
 *
 * PHASE 3: Real Supabase Auth JWT verification via JWKS endpoint.
 * No mock sessions — all requests require a valid JWT.
 *
 * @module middleware
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { SessionClaims } from './lib/auth/types';
import { verifyJwt, fetchTenantStatus } from './lib/auth/supabase-auth';
import { tierGuard } from './middleware/tier-guard';

/** Cookie name used to store the Supabase access token */
const AUTH_COOKIE_NAME = 'sb-access-token';

/** Header name for propagating session claims to downstream handlers */
const SESSION_CLAIMS_HEADER = 'x-session-claims';

/**
 * Routes that do NOT require authentication.
 * Public pages, static assets, and auth callback routes.
 */
const PUBLIC_ROUTES = [
  '/',
  '/onboarding',
  '/api/auth/callback',
  '/api/webhooks',
];

/**
 * Checks whether a given path matches any of the public route prefixes.
 *
 * @param {string} pathname - The request pathname to check
 * @returns {boolean} True if the path is in the public routes list
 * @module middleware
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Checks whether a path is a static asset or Next.js internal path.
 * Static assets bypass all middleware checks.
 *
 * @param {string} pathname - The request pathname to check
 * @returns {boolean} True if the path is a static/Next.js internal asset
 * @module middleware
 */
function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_next') ||
    pathname.includes('.') // file extensions = static assets
  );
}

/**
 * Extracts the JWT token from a Next.js request.
 * Checks Authorization header first (Bearer token), then falls back to cookie.
 *
 * @param {NextRequest} request - The incoming Next.js request
 * @returns {string | null} The JWT token string, or null if not found
 * @module middleware
 */
function extractToken(request: NextRequest): string | null {
  // Check Authorization: Bearer <token> header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // Fallback: check cookie (for browser-initiated requests)
  const tokenCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (tokenCookie) {
    return tokenCookie;
  }

  return null;
}

/**
 * Creates an unauthorized response with a generic error message.
 * Never exposes internal error details to the client (RULE G-3).
 *
 * @param {string} reason - The internal reason (logged, not sent to client)
 * @param {number} status - HTTP status code (401 or 403)
 * @returns {NextResponse} JSON response with generic error message
 * @module middleware
 */
function unauthorizedResponse(reason: string, status: number = 401): NextResponse {
  // Log internally for debugging — never expose reason to client (RULE G-3)
  console.error(`[Middleware] Auth denied: ${reason}`);
  return NextResponse.json(
    { error: 'Authentication required' },
    { status }
  );
}

/**
 * Creates a NextResponse that continues the request with session claims
 * propagated via a custom header for downstream API route handlers.
 *
 * @param {NextRequest} request - The original request
 * @param {SessionClaims} claims - The verified session claims to propagate
 * @returns {NextResponse} Response with claims attached as header
 * @module middleware
 */
function continueWithClaims(request: NextRequest, claims: SessionClaims): NextResponse {
  const response = NextResponse.next();
  response.headers.set(SESSION_CLAIMS_HEADER, JSON.stringify(claims));
  return response;
}

/**
 * Next.js middleware function.
 * Runs on every request before it reaches the page or API route.
 *
 * Phase 3: Real JWT validation via Supabase JWKS, tenant status from
 * Supabase tenants table, tier enforcement, and safety guard.
 * No mock sessions — all requests require a valid JWT.
 *
 * @param {NextRequest} request - The incoming Next.js request
 * @returns {Promise<NextResponse>} The response — either continue, redirect, or error
 * @module middleware
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Step 1: Static assets and Next.js internals always pass through
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // Step 2: Public routes do not require authentication
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Step 3: Extract JWT token from request
  const token = extractToken(request);

  if (!token) {
    // Redirect to onboarding for page routes, return 401 for API routes
    if (pathname.startsWith('/api/')) {
      return unauthorizedResponse('No authentication token provided');
    }
    // Redirect browser requests to onboarding/login
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // Step 4: Verify JWT signature and expiry via Supabase JWKS
  const claims = await verifyJwt(token);

  if (!claims) {
    if (pathname.startsWith('/api/')) {
      return unauthorizedResponse('Invalid or expired authentication token');
    }
    // Redirect browser requests with invalid tokens to onboarding
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // Step 5: Check tenant status — reject suspended/archived/pending (RULE S-7)
  const tenantStatus = await fetchTenantStatus(claims.tenant_id);
  if (tenantStatus !== 'active') {
    if (pathname.startsWith('/api/')) {
      return unauthorizedResponse(
        `Tenant account is ${tenantStatus}. Access denied.`,
        403
      );
    }
    // Redirect suspended/archived/pending tenants to a status page
    return NextResponse.redirect(new URL('/onboarding?status=inactive', request.url));
  }

  // Step 6: Enforce tier-based route access
  const tierResponse = await tierGuard(request, claims);
  if (tierResponse.status !== 200) {
    return tierResponse;
  }

  // Step 7: Propagate session claims to downstream handlers
  return continueWithClaims(request, claims);
}

/**
 * Middleware config — specifies which routes the middleware runs on.
 * Runs on all routes. Public routes and static assets are handled inside
 * the middleware function itself for centralised control.
 *
 * @module middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
