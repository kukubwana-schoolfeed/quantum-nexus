/**
 * Quantum Nexus — Tier Guard Middleware Helper
 * Terminal 3 — Security, Auth, Middleware
 *
 * Enforces feature access based on the authenticated user's subscription tier.
 * Tier is extracted from the JWT claims and checked against the required tier
 * for the requested route or feature.
 *
 * Tiers:
 * - basic: core automation, 3 social accounts, SEO, content machine, English + Nyanja, 60s video
 * - growth: basic + broadcasts, customer DB, review campaigns, all socials, 5min video
 * - pro: growth + white-label app, rewards, priority queue, dedicated voice number
 * - enterprise: pro + 15min animated episodes, white-label reseller capability
 * - internal: full access, zero billing
 *
 * PHASE 2: Full tier enforcement with session claims from middleware.
 *
 * @module middleware/tier-guard
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Tier, SessionClaims } from '../lib/auth/types';

/**
 * Tier hierarchy from lowest to highest access level.
 * Used to compare whether a user's tier meets the minimum requirement.
 *
 * @module middleware/tier-guard
 */
const TIER_HIERARCHY: Tier[] = ['basic', 'growth', 'pro', 'enterprise', 'internal'];

/**
 * Feature routes that require a minimum tier.
 * Key: route prefix. Value: minimum tier required.
 * Routes not listed are accessible to all authenticated users.
 *
 * @module middleware/tier-guard
 */
const TIER_GATED_ROUTES: Record<string, Tier> = {
  '/dashboard/broadcasts': 'growth',
  '/dashboard/customers': 'growth',
  '/dashboard/reviews': 'growth',
  '/dashboard/loyalty': 'pro',
  '/dashboard/app-builder': 'pro',
  '/dashboard/calls': 'pro',
  '/dashboard/faceless': 'pro',
  '/reseller': 'enterprise',
  '/api/broadcasts': 'growth',
  '/api/customers': 'growth',
  '/api/reviews': 'growth',
  '/api/loyalty': 'pro',
  '/api/calls': 'pro',
  '/api/faceless': 'pro',
};

/**
 * Checks whether a given tier meets or exceeds the required minimum tier.
 *
 * @param {Tier} userTier - The user's subscription tier from JWT claims
 * @param {Tier} requiredTier - The minimum tier required for the feature
 * @returns {boolean} True if the user's tier meets or exceeds the requirement
 * @module middleware/tier-guard
 */
function meetsTierRequirement(userTier: Tier, requiredTier: Tier): boolean {
  const userLevel = TIER_HIERARCHY.indexOf(userTier);
  const requiredLevel = TIER_HIERARCHY.indexOf(requiredTier);
  return userLevel >= requiredLevel;
}

/**
 * Finds the minimum tier required for a given pathname.
 * Returns undefined if the route is not tier-gated (accessible to all authenticated users).
 *
 * @param {string} pathname - The request pathname to check
 * @returns {Tier | undefined} The minimum required tier, or undefined if not gated
 * @module middleware/tier-guard
 */
function getRequiredTier(pathname: string): Tier | undefined {
  for (const [route, tier] of Object.entries(TIER_GATED_ROUTES)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return tier;
    }
  }
  return undefined;
}

/**
 * Tier guard middleware handler.
 * Enforces feature access based on the user's subscription tier.
 * Receives session claims from the main middleware pipeline.
 *
 * @param {NextRequest} request - The incoming request
 * @param {SessionClaims} claims - The verified session claims from JWT
 * @returns {Promise<NextResponse>} Continue if tier allows access, 403 if insufficient tier
 * @module middleware/tier-guard
 */
export async function tierGuard(
  request: NextRequest,
  claims: SessionClaims
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Check if this route requires a minimum tier
  const requiredTier = getRequiredTier(pathname);
  if (!requiredTier) {
    // Not tier-gated — all authenticated users can access
    return NextResponse.next();
  }

  // Super admin / internal tier bypasses all tier checks
  if (claims.tier === 'internal' || claims.role === 'super_admin') {
    return NextResponse.next();
  }

  // Compare user tier against required tier
  if (!meetsTierRequirement(claims.tier, requiredTier)) {
    console.error(
      `[TierGuard] Access denied: tier '${claims.tier}' does not meet required '${requiredTier}' for ${pathname}`
    );
    return NextResponse.json(
      {
        error: 'Upgrade required',
        requiredTier,
        currentTier: claims.tier,
      },
      { status: 403 }
    );
  }

  return NextResponse.next();
}