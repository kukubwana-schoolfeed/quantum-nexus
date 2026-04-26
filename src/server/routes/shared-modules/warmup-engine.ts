import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { WarmupStatusDTO, WarmupScheduleDTO } from '@/lib/api/schema';

/** @module warmup-engine @description Warmup Engine route handlers for monitoring account warmup progress and retrieving the recommended posting schedule */

/**
 * Retrieves the current warmup status for the tenant's accounts,
 * including the warmup phase, days active, and daily action limits.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @returns Promise resolving to the warmup status with phase and limits
 */
export async function getStatus(
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
 * Retrieves the recommended posting schedule during the warmup period,
 * including optimal posting times and daily post counts.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @returns Promise resolving to the warmup schedule recommendations
 */
export async function getSchedule(
  tenantId: string,
): Promise<ApiResponse<WarmupScheduleDTO>> {
  const tenant = await db.tenantQueries.getTenantById(tenantId);
  const daysActive = tenant?.activated_at
    ? Math.floor((Date.now() - new Date(tenant.activated_at).getTime()) / (24 * 60 * 60 * 1000))
    : 0;

  return {
    success: true,
    data: {
      postsPerDay: Math.min(daysActive, 5),
      optimalTimes: ['09:00', '12:00', '18:00'],
    },
  };
}
