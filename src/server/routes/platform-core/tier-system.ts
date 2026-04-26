import * as db from '@/lib/db';
import { AppError, internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { TierDTO } from '@/lib/api/schema';

/** @module platform-core/tier-system @description Manages subscription tier definitions, tenant tier assignments, tier upgrades/downgrades, and feature access checks based on tier level. */

/** Static tier definitions with pricing and feature sets */
const STATIC_TIERS: TierDTO[] = [
  { id: 'basic', name: 'Basic', price: 0, features: [] },
  { id: 'growth', name: 'Growth', price: 299, features: [] },
  { id: 'pro', name: 'Pro', price: 699, features: [] },
  { id: 'enterprise', name: 'Enterprise', price: 1499, features: [] },
];

/**
 * Retrieves all available subscription tiers and their feature sets.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @returns ApiResponse wrapping all tier definitions with pricing and feature lists
 */
export async function getTiers(tenantId: string): Promise<ApiResponse<TierDTO[]>> {
  try {
    return { success: true, data: STATIC_TIERS };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('TIERS_FETCH_FAILED');
  }
}

/**
 * Retrieves the current tier assignment for a specific tenant.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @returns ApiResponse wrapping the tier object assigned to the tenant
 */
export async function getTenantTier(tenantId: string): Promise<ApiResponse<TierDTO>> {
  try {
    const tenant = await db.tenantQueries.getTenantById(tenantId);

    if (!tenant) {
      throw internalError('TENANT_NOT_FOUND');
    }

    const tier: TierDTO = {
      id: tenant.tier,
      name: tenant.tier,
      price: 0,
      features: [],
    };

    return { success: true, data: tier };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('TENANT_TIER_FETCH_FAILED');
  }
}

/**
 * Updates the subscription tier for a tenant (upgrade or downgrade).
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @param tier - The target tier identifier (e.g. 'basic', 'growth', 'pro', 'enterprise')
 * @returns ApiResponse wrapping confirmation of the tier update
 */
export async function updateTier(tenantId: string, tier: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    await db.tenantQueries.updateTenant(tenantId, { tier } as Partial<db.TenantRow>);
    return { success: true, data: { success: true, message: 'Tier updated' } };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('TIER_UPDATE_FAILED');
  }
}

/**
 * Checks whether a tenant's current tier grants access to a specific feature.
 * Uses simplified feature gating: basic tier has no access; all others are allowed.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @param feature - The feature identifier to check access for
 * @returns ApiResponse wrapping access check result with feature name and access flag
 */
export async function checkFeatureAccess(tenantId: string, feature: string): Promise<ApiResponse<{ hasAccess: boolean; feature: string }>> {
  try {
    const tenant = await db.tenantQueries.getTenantById(tenantId);

    if (!tenant) {
      throw internalError('TENANT_NOT_FOUND');
    }

    return { success: true, data: { hasAccess: tenant.tier !== 'basic', feature } };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('FEATURE_ACCESS_CHECK_FAILED');
  }
}
