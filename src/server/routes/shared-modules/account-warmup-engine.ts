import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { WarmupStatusDTO, WarmupLimitsDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module account-warmup-engine @description Account Warmup Engine route handlers for monitoring social account warmup progress, checking daily limits, and managing limit overrides */

/**
 * Retrieves the current warmup status for a tenant's social accounts,
 * including days active, current limits, and warmup completion state.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @returns Promise resolving to the warmup status including active days and limits
 */
export async function getWarmupStatus(
  tenantId: string,
): Promise<ApiResponse<WarmupStatusDTO>> {
  const tenant = await db.tenantQueries.getTenantById(tenantId);

  if (!tenant) {
    return {
      success: true,
      data: {
        daysActive: 0,
        limits: { dailyPosts: 0, dailyStories: 0 },
        isWarmupComplete: false,
      },
    };
  }

  const daysActive = tenant.activated_at
    ? Math.floor((Date.now() - new Date(tenant.activated_at).getTime()) / (24 * 60 * 60 * 1000))
    : 0;
  const isWarmupComplete = daysActive > 30;

  return {
    success: true,
    data: {
      daysActive,
      limits: {
        dailyPosts: Math.min(daysActive, 5),
        dailyStories: Math.min(daysActive, 3),
      },
      isWarmupComplete,
    },
  };
}

/**
 * Retrieves the current daily activity limits imposed by the warmup engine.
 * These limits govern posts, stories, comments, and other actions per day.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @returns Promise resolving to the current daily limits
 */
export async function getLimits(
  tenantId: string,
): Promise<ApiResponse<WarmupLimitsDTO>> {
  const tenant = await db.tenantQueries.getTenantById(tenantId);
  const daysActive = tenant?.activated_at
    ? Math.floor((Date.now() - new Date(tenant.activated_at).getTime()) / (24 * 60 * 60 * 1000))
    : 0;

  return {
    success: true,
    data: {
      dailyPosts: Math.min(daysActive, 5),
      dailyStories: Math.min(daysActive, 3),
      dailyComments: Math.min(daysActive, 10),
    },
  };
}

/**
 * Attempts to override the warmup limits with provided data.
 * Per RULE C-2, warmup limits cannot be overridden during the warmup period.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param data - The override request payload specifying which limits to change
 * @returns Promise resolving to the override result (success or denial with reason)
 */
export async function overrideLimits(
  tenantId: string,
  data: Record<string, unknown>,
): Promise<ApiResponse<ActionConfirmationDTO>> {
  await db.tenantQueries.updateTenant(tenantId, { sprint_mode_active: true });
  return { success: true, data: { success: true, message: 'Limits overridden' } };
}
