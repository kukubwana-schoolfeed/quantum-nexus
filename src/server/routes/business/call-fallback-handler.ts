import * as db from '@/lib/db';
import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { CallFallbackConfigDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module call-fallback-handler @description Call fallback handler — config, updates and manual fallback trigger. */

/**
 * Retrieve the call fallback handler configuration for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @returns The call fallback configuration.
 */
export async function getConfig(tenantId: string): Promise<ApiResponse<CallFallbackConfigDTO>> {
  const profile = await db.businessQueries.getBusinessProfile(tenantId);
  const data: CallFallbackConfigDTO = {
    humanHandoffMessage: profile?.fallback_message ?? 'Let me get a team member to help you.',
    followUpDelayMinutes: 5,
  };
  return { success: true, data };
}

/**
 * Update the call fallback handler configuration for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @param data - The configuration fields to update.
 * @returns The update confirmation with modified fields.
 */
export async function updateConfig(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<ActionConfirmationDTO & Record<string, unknown>>> {
  await db.businessQueries.upsertBusinessProfile(tenantId, data);
  return { success: true, data: { success: true, message: 'Config updated' } };
}

/**
 * Manually trigger the call fallback for a specific call.
 * @param tenantId - The unique identifier of the tenant.
 * @param callId - The unique identifier of the call to trigger fallback for.
 * @returns The fallback trigger result.
 */
export async function triggerFallback(tenantId: string, callId: string): Promise<ApiResponse<{ success: boolean; handoffInitiated: boolean }>> {
  throw internalError('INTEGRATION_PENDING');
}
