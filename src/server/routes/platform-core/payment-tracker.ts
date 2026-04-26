import * as db from '@/lib/db';
import { AppError, internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { PaymentStatusDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module platform-core/payment-tracker @description Monitors payment status, triggers grace periods for overdue accounts, and manages tenant suspension workflows for non-payment. */

/**
 * Retrieves the current payment status for a tenant.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @returns ApiResponse wrapping payment status including last payment date and next due date
 */
export async function getPaymentStatus(tenantId: string): Promise<ApiResponse<PaymentStatusDTO>> {
  try {
    const result = await db.billingQueries.getPaymentStatus(tenantId);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('PAYMENT_STATUS_FETCH_FAILED');
  }
}

/**
 * Checks whether a tenant's payment is current or overdue.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @returns ApiResponse wrapping payment status result indicating current or overdue state
 */
export async function checkPayment(tenantId: string): Promise<ApiResponse<PaymentStatusDTO>> {
  try {
    const result = await db.billingQueries.getPaymentStatus(tenantId);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('PAYMENT_CHECK_FAILED');
  }
}

/**
 * Moves a tenant into the grace period state after a missed payment.
 * Tenants in grace period retain limited access for a defined window.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @returns ApiResponse wrapping confirmation that grace period has been triggered
 */
export async function triggerGracePeriod(tenantId: string): Promise<ApiResponse<ActionConfirmationDTO>> {
  try {
    await db.tenantQueries.updateTenant(tenantId, {
      status: 'grace_period',
    } as Partial<db.TenantRow>);
    return { success: true, data: { success: true, message: 'Grace period triggered' } };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('GRACE_PERIOD_TRIGGER_FAILED');
  }
}

/**
 * Suspends a tenant's account after the grace period expires without payment.
 * Suspended tenants lose all platform access until payment is resolved.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @returns ApiResponse wrapping confirmation that suspension has been triggered
 */
export async function triggerSuspension(tenantId: string): Promise<ApiResponse<ActionConfirmationDTO>> {
  try {
    const result = await db.tenantQueries.suspendTenant(tenantId, 'Payment overdue');
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('SUSPENSION_TRIGGER_FAILED');
  }
}
