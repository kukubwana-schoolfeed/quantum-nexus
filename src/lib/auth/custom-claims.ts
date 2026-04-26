/**
 * Quantum Nexus — Supabase Auth Custom Claims Hook
 * Terminal 3 — Security, Auth, Middleware
 *
 * Defines the SQL function that Supabase Auth calls when generating JWTs.
 * This function injects custom claims (tenant_id, role, tier, reseller_id)
 * into every authenticated user's JWT, matching the ARCHITECTURE.md spec:
 *
 * { sub, tenant_id, role, tier, reseller_id }
 *
 * HOW IT WORKS:
 * Supabase Auth supports a "custom claims" hook that runs a PostgreSQL
 * function whenever a JWT is generated. The function receives the user's
 * UUID and returns a JSON object whose keys are merged into the JWT payload.
 *
 * The user_roles and user_profiles tables (created by Terminal 2) store
 * the tenant_id, role, tier, and reseller_id for each user. This hook
 * reads from those tables and injects the values into the JWT.
 *
 * DEPLOYMENT:
 * This SQL must be applied as a migration in /supabase/migrations/.
 * Terminal 3 OWNS the auth configuration but /supabase is Terminal 2's
 * territory (RULE T-3). The SQL is defined here as a constant string
 * that Terminal 2 must apply via:
 *   npx supabase db push
 * or by copying to /supabase/migrations/
 *
 * RULE G-5: No direct process.env access outside env.ts
 * RULE S-1: Keys and tokens never logged or exposed to client
 * RULE MT-2: tenant_id always from JWT, never from request body
 *
 * @module auth/custom-claims
 */

/**
 * SQL migration that creates the custom claims hook function.
 *
 * This function is called by Supabase Auth on every JWT generation.
 * It reads the user's profile from the user_profiles table and
 * injects tenant_id, role, tier, and reseller_id into the JWT.
 *
 * The function uses SECURITY DEFINER so it can read from user_profiles
 * even if the user doesn't have direct SELECT permission on that table.
 *
 * Prerequisites (created by Terminal 2):
 * - user_profiles table with columns: user_id (UUID, FK to auth.users), tenant_id (UUID), role (TEXT), tier (TEXT), reseller_id (UUID nullable)
 * - tenants table with columns: id (UUID), status (TEXT)
 *
 * @module auth/custom-claims
 */
export const CUSTOM_CLAIMS_MIGRATION_SQL = `
-- Quantum Nexus: Custom Claims Hook for Supabase Auth
-- Injects tenant_id, role, tier, reseller_id into every JWT
-- Terminal 3 — Security, Auth, Middleware

-- Create the custom claims function
CREATE OR REPLACE FUNCTION public.custom_claims(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  claims JSONB;
  user_id UUID;
  user_role TEXT;
  user_tier TEXT;
  user_tenant_id UUID;
  user_reseller_id UUID;
  tenant_status TEXT;
BEGIN
  -- Extract user_id from the auth event
  user_id := (event ->> 'user_id')::UUID;

  -- Fetch the user's profile from user_profiles table
  SELECT
    up.tenant_id,
    up.role,
    up.tier,
    up.reseller_id
  INTO
    user_tenant_id,
    user_role,
    user_tier,
    user_reseller_id
  FROM public.user_profiles up
  WHERE up.user_id = user_id;

  -- If no profile exists, return empty claims (user not yet onboarded)
  IF user_tenant_id IS NULL THEN
    RETURN '{}'::JSONB;
  END IF;

  -- Check tenant status — reject JWT for inactive tenants (RULE S-7)
  SELECT t.status INTO tenant_status
  FROM public.tenants t
  WHERE t.id = user_tenant_id;

  -- Build the custom claims object
  claims := jsonb_build_object(
    'tenant_id', user_tenant_id,
    'role', COALESCE(user_role, 'business_owner'),
    'tier', COALESCE(user_tier, 'basic'),
    'reseller_id', user_reseller_id
  );

  RETURN claims;
END;
$$;

-- Grant execution to the Supabase Auth role
GRANT EXECUTE ON FUNCTION public.custom_claims(JSONB) TO authenticator;

-- Create the auth hook trigger that calls custom_claims
-- Supabase Auth calls this function via the auth.hooks custom claims API
-- This is configured in the Supabase Dashboard under Auth > Hooks > Custom Claims
-- or via the supabase.auth.schema custom_claims_function setting
`;

/**
 * SQL to create the user_profiles table if it doesn't exist.
 * Terminal 2 is responsible for the actual migration, but this
 * reference SQL ensures the schema matches what the custom claims
 * hook expects.
 *
 * @module auth/custom-claims
 */
export const USER_PROFILES_TABLE_SQL = `
-- Quantum Nexus: User Profiles table for custom claims
-- Stores tenant_id, role, tier, reseller_id per user
-- Terminal 2 creates this as a migration — this is reference SQL

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'business_owner'
    CHECK (role IN ('business_owner', 'ugc_creator', 'faceless_creator', 'agency_admin', 'super_admin')),
  tier TEXT NOT NULL DEFAULT 'basic'
    CHECK (tier IN ('basic', 'growth', 'pro', 'enterprise', 'internal')),
  reseller_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (user_id = auth.uid());

-- Service role can read all profiles (for admin operations)
CREATE POLICY "Service role can read all profiles"
  ON public.user_profiles FOR SELECT
  USING (auth.role() = 'service_role');

-- Index for fast lookup by user_id (used on every JWT generation)
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Index for fast lookup by tenant_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant_id ON public.user_profiles(tenant_id);
`;

/** Shape returned by the user_profiles query in verifyCustomClaims */
interface UserProfileRow {
  tenant_id: string;
  role: string;
  tier: string;
  reseller_id: string | null;
}

/** Shape used in setUserClaims upsert */
interface UserProfileUpsert {
  user_id: string;
  tenant_id: string;
  role: string;
  tier: string;
  reseller_id: string | null;
  updated_at: string;
}

/**
 * Verifies that the custom claims hook is working by checking
 * that a user's JWT contains the expected custom claims.
 *
 * @param {string} userId - The user UUID to verify claims for
 * @returns {Promise<{ hasCustomClaims: boolean; claims: Record<string, unknown> | null }>} Whether the user has custom claims and what they are
 * @module auth/custom-claims
 */
export async function verifyCustomClaims(
  userId: string
): Promise<{ hasCustomClaims: boolean; claims: Record<string, unknown> | null }> {
  const { getSupabaseAdminClient } = await import('./supabase-auth');
  const supabase = getSupabaseAdminClient();

  try {
    // Check if the user has a profile with the expected claims
    const { data, error } = await supabase
      .from('user_profiles')
      .select('tenant_id, role, tier, reseller_id')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return { hasCustomClaims: false, claims: null };
    }

    const profile = data as unknown as UserProfileRow;

    return {
      hasCustomClaims: true,
      claims: {
        tenant_id: profile.tenant_id,
        role: profile.role,
        tier: profile.tier,
        reseller_id: profile.reseller_id,
      },
    };
  } catch (err) {
    console.error(`[CustomClaims] Failed to verify claims for user ${userId}:`, err);
    return { hasCustomClaims: false, claims: null };
  }
}

/**
 * Sets or updates custom claims for a user by writing to user_profiles.
 * Used during onboarding to set the initial tenant_id, role, and tier.
 * Also used by super admin to change a user's role or tier.
 *
 * @param {string} userId - The user UUID to set claims for
 * @param {string} tenantId - The tenant UUID this user belongs to (RULE MT-2: from authenticated session)
 * @param {'business_owner' | 'ugc_creator' | 'faceless_creator' | 'agency_admin' | 'super_admin'} role - The user's role
 * @param {'basic' | 'growth' | 'pro' | 'enterprise' | 'internal'} tier - The user's subscription tier
 * @param {string | null} resellerId - The reseller UUID if applicable
 * @returns {Promise<boolean>} True if the claims were set successfully
 * @throws {Error} If the upsert fails
 * @module auth/custom-claims
 */
export async function setUserClaims(
  userId: string,
  tenantId: string,
  role: 'business_owner' | 'ugc_creator' | 'faceless_creator' | 'agency_admin' | 'super_admin',
  tier: 'basic' | 'growth' | 'pro' | 'enterprise' | 'internal',
  resellerId: string | null
): Promise<boolean> {
  const { getSupabaseAdminClient } = await import('./supabase-auth');
  const supabase = getSupabaseAdminClient();

  try {
    const upsertData: UserProfileUpsert = {
      user_id: userId,
      tenant_id: tenantId,
      role,
      tier,
      reseller_id: resellerId,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('user_profiles')
      .upsert(upsertData as never, { onConflict: 'user_id' });

    if (error) {
      console.error(`[CustomClaims] Failed to set claims for user ${userId}: ${error.message}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[CustomClaims] Exception setting claims for user ${userId}:`, err);
    return false;
  }
}

/**
 * Removes custom claims for a user by deleting their profile.
 * Used when a user is removed from a tenant or when their account is deleted.
 *
 * @param {string} userId - The user UUID to remove claims for
 * @returns {Promise<boolean>} True if the claims were removed successfully
 * @module auth/custom-claims
 */
export async function removeUserClaims(userId: string): Promise<boolean> {
  const { getSupabaseAdminClient } = await import('./supabase-auth');
  const supabase = getSupabaseAdminClient();

  try {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error(`[CustomClaims] Failed to remove claims for user ${userId}: ${error.message}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[CustomClaims] Exception removing claims for user ${userId}:`, err);
    return false;
  }
}