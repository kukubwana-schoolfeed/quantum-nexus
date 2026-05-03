import * as db from '@/lib/db';
import { AppError, internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { SprintModeConfigDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module platform-core/sprint-mode-engine @description Manages Sprint Mode configuration and activation state. Sprint Mode amplifies posting frequency, clip extraction, comment response speed, and trend checks for time-limited high-intensity marketing pushes. */

/**
 * Retrieves the current Sprint Mode configuration for a tenant.
 * Derives config from the tenant row's sprint_mode_active and sprint_mode_ends_at fields.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @returns ApiResponse wrapping Sprint Mode config including multiplier, extraction mode, and schedule
 */
export async function getConfig(tenantId: string): Promise<ApiResponse<SprintModeConfigDTO>> {
  try {
    const tenant = await db.tenantQueries.getTenantById(tenantId);

    if (!tenant) {
      const defaultConfig: SprintModeConfigDTO = {
        active: true,
        postingMultiplier: 3,
        clipExtractionMode: 'maximum',
        commentResponseSpeed: 'every',
        trendCheckFrequency: 'daily',
        warmupOverride: false,
        endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      };
      return { success: true, data: defaultConfig };
    }

    const config: SprintModeConfigDTO = {
      active: tenant.sprint_mode_active,
      postingMultiplier: tenant.sprint_mode_active ? 3 : 1,
      clipExtractionMode: 'normal',
      commentResponseSpeed: 'filtered',
      trendCheckFrequency: 'daily',
      warmupOverride: tenant.sprint_mode_active,
      endsAt: tenant.sprint_mode_ends_at ?? '',
    };

    return { success: true, data: config };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('SPRINT_CONFIG_FETCH_FAILED');
  }
}

/**
 * Activates Sprint Mode for a tenant, applying boosted posting and engagement settings.
 * Sets sprint_mode_ends_at to 14 days from now.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @returns ApiResponse wrapping confirmation that Sprint Mode has been activated
 */
export async function activate(tenantId: string): Promise<ApiResponse<ActionConfirmationDTO>> {
  try {
    await db.tenantQueries.updateTenant(tenantId, {
      sprint_mode_active: true,
      sprint_mode_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    } as Partial<db.TenantRow>);
    return { success: true, data: { success: true, message: 'Sprint mode activated' } };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('SPRINT_ACTIVATE_FAILED');
  }
}

/**
 * Deactivates Sprint Mode for a tenant, reverting to the sustainable schedule.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @returns ApiResponse wrapping confirmation that Sprint Mode has been deactivated
 */
export async function deactivate(tenantId: string): Promise<ApiResponse<ActionConfirmationDTO>> {
  try {
    await db.tenantQueries.updateTenant(tenantId, {
      sprint_mode_active: false,
    } as Partial<db.TenantRow>);
    return { success: true, data: { success: true, message: 'Sprint mode deactivated' } };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('SPRINT_DEACTIVATE_FAILED');
  }
}
