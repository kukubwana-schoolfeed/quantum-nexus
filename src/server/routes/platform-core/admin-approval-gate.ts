import * as db from '@/lib/db';
import { AppError, internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { PendingAccountDTO } from '@/lib/api/schema';

/** @module platform-core/admin-approval-gate @description Controls the approval and rejection flow for new tenant accounts, allowing admins to review pending submissions and accept or deny them. */

/**
 * Retrieves all tenant accounts that are pending admin approval.
 * @param tenantId - The tenant's UUID (from authenticated session, must be admin)
 * @returns ApiResponse wrapping an array of pending accounts with id, businessName, submittedAt, and tier
 */
export async function getPendingAccounts(tenantId: string): Promise<ApiResponse<PendingAccountDTO[]>> {
  try {
    const supabase = db.getSupabaseAdmin();
    const { data, error } = await supabase
      .from('tenants')
      .select('id, business_name, created_at, tier')
      .eq('status', 'pending_approval');

    if (error) {
      throw internalError('PENDING_ACCOUNTS_FETCH_FAILED');
    }

    const rows = data as Array<{ id: string; business_name: string; created_at: string; tier: string }> ?? [];
    const accounts: PendingAccountDTO[] = rows.map((row) => ({
      id: row.id,
      businessName: row.business_name,
      submittedAt: row.created_at,
      tier: row.tier,
    }));

    return { success: true, data: accounts };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('PENDING_ACCOUNTS_FETCH_FAILED');
  }
}

/**
 * Approves a pending account, transitioning it to active status.
 * @param tenantId - The tenant's UUID (from authenticated session, must be admin)
 * @param accountId - The UUID of the account to approve
 * @param approvedBy - The UUID or identifier of the admin performing the approval
 * @returns ApiResponse wrapping confirmation with the approved account's id
 */
export async function approveAccount(tenantId: string, accountId: string, approvedBy: string): Promise<ApiResponse<{ success: boolean; accountId: string }>> {
  try {
    await db.tenantQueries.updateTenant(accountId, {
      status: 'active',
      activated_at: new Date().toISOString(),
      admin_approved_by: approvedBy,
      admin_approved_at: new Date().toISOString(),
    } as Partial<db.TenantRow>);
    return { success: true, data: { success: true, accountId } };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('ACCOUNT_APPROVE_FAILED');
  }
}

/**
 * Rejects a pending account, recording the reason and the rejecting admin.
 * @param tenantId - The tenant's UUID (from authenticated session, must be admin)
 * @param accountId - The UUID of the account to reject
 * @param reason - The reason for rejection
 * @param rejectedBy - The UUID or identifier of the admin performing the rejection
 * @returns ApiResponse wrapping confirmation with the rejected account's id
 */
export async function rejectAccount(tenantId: string, accountId: string, reason: string, rejectedBy: string): Promise<ApiResponse<{ success: boolean; accountId: string }>> {
  try {
    await db.tenantQueries.updateTenant(accountId, {
      status: 'rejected',
      rejection_reason: reason,
      admin_approved_by: rejectedBy,
    } as Partial<db.TenantRow>);
    return { success: true, data: { success: true, accountId } };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('ACCOUNT_REJECT_FAILED');
  }
}
