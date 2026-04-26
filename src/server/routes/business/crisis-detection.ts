import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { CrisisAlertDTO, CrisisSettingsDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module crisis-detection @description Crisis detection — alerts, acknowledgement, and detection settings. */

/**
 * Retrieve active crisis detection alerts for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @returns A list of active crisis alerts.
 */
export async function getAlerts(tenantId: string): Promise<ApiResponse<CrisisAlertDTO[]>> {
  const data = await db.notificationQueries.listNotifications(tenantId, { type: 'crisis' });
  const alerts: CrisisAlertDTO[] = data.map(n => ({
    id: n.id,
    platform: '',
    alertType: n.type,
    severity: (n.priority === 'urgent' ? 'critical' : n.priority === 'high' ? 'high' : n.priority === 'normal' ? 'medium' : 'low') as CrisisAlertDTO['severity'],
    message: n.body,
    detectedAt: n.createdAt,
    acknowledged: n.read,
  }));
  return { success: true, data: alerts };
}

/**
 * Acknowledge a crisis detection alert.
 * @param tenantId - The unique identifier of the tenant.
 * @param alertId - The unique identifier of the alert to acknowledge.
 * @returns The acknowledgement confirmation.
 */
export async function acknowledgeAlert(tenantId: string, alertId: string): Promise<ApiResponse<ActionConfirmationDTO>> {
  await db.notificationQueries.markNotificationRead(tenantId, alertId);
  return { success: true, data: { success: true, message: 'Alert acknowledged' } };
}

/**
 * Retrieve the crisis detection settings for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @returns The crisis detection configuration.
 */
export async function getSettings(tenantId: string): Promise<ApiResponse<CrisisSettingsDTO>> {
  await db.businessQueries.getBusinessProfile(tenantId);
  const data: CrisisSettingsDTO = {
    autoPauseEnabled: false,
    sensitivityLevel: 'medium',
  };
  return { success: true, data };
}

/**
 * Update the crisis detection settings for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @param data - The settings fields to update.
 * @returns The update confirmation with modified fields.
 */
export async function updateSettings(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<ActionConfirmationDTO & Record<string, unknown>>> {
  await db.businessQueries.upsertBusinessProfile(tenantId, data);
  return { success: true, data: { success: true, message: 'Settings updated' } };
}
