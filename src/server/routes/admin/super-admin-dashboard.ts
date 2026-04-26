import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { PlatformStatsDTO, TenantSummaryDTO, TenantDetailsDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module super-admin-dashboard @description Platform-level administration routes for super_admin and sub_admin users */

/**
 * Retrieves aggregate platform statistics including tenant counts, revenue, and growth.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @returns Promise resolving to platform-wide stats wrapped in an ApiResponse
 */
export async function getPlatformStats(
  adminUserId: string,
): Promise<ApiResponse<PlatformStatsDTO>> {
  const result = await db.tenantQueries.getPlatformStats();
  return { success: true, data: result };
}

/**
 * Returns a paginated, filterable list of all tenants on the platform.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @param params - Query and filter parameters such as page, pageSize, search, and status
 * @returns Promise resolving to array of tenant summaries wrapped in an ApiResponse
 */
export async function getTenantList(
  adminUserId: string,
  params: Record<string, unknown>,
): Promise<ApiResponse<TenantSummaryDTO[]>> {
  const result = await db.adminQueries.listTenantsAdmin(params);
  return { success: true, data: result };
}

/**
 * Fetches full details for a single tenant.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @param tenantId - The tenant to look up
 * @returns Promise resolving to tenant details wrapped in an ApiResponse
 */
export async function getTenantDetails(
  adminUserId: string,
  tenantId: string,
): Promise<ApiResponse<TenantDetailsDTO>> {
  const result = await db.adminQueries.getTenantDetailsAdmin(tenantId);
  return { success: true, data: result as TenantDetailsDTO };
}

/**
 * Suspends a tenant, blocking access to the platform.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @param tenantId - The tenant to suspend
 * @param reason - Justification for the suspension
 * @returns Promise resolving to confirmation result wrapped in an ApiResponse
 */
export async function suspendTenant(
  adminUserId: string,
  tenantId: string,
  reason: string,
): Promise<ApiResponse<ActionConfirmationDTO>> {
  const result = await db.tenantQueries.suspendTenant(tenantId, reason);
  return { success: true, data: result };
}

/**
 * Reactivates a previously suspended tenant.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @param tenantId - The tenant to reactivate
 * @returns Promise resolving to confirmation result wrapped in an ApiResponse
 */
export async function reactivateTenant(
  adminUserId: string,
  tenantId: string,
): Promise<ApiResponse<ActionConfirmationDTO>> {
  const result = await db.tenantQueries.reactivateTenant(tenantId);
  return { success: true, data: result };
}
