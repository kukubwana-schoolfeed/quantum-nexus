import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { LoyaltyBalanceDTO, LoyaltyTransactionDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module loyalty-points-engine @description Loyalty points system — balance queries, transaction history, earning with auto tier-upgrade, redemption with balance validation, and manual adjustments. Tier thresholds: standard (0–999), priority (1000–4999), VIP (5000+). */

/** Points thresholds for automatic tier upgrades */
const TIER_THRESHOLDS = {
  priority: 1000,
  vip: 5000,
} as const;

/**
 * Retrieve the loyalty points balance and tier for a customer.
 * @param tenantId - The unique identifier of the tenant.
 * @param customerId - The unique identifier of the customer.
 * @returns The current points balance and loyalty tier.
 */
export async function getBalance(tenantId: string, customerId: string): Promise<ApiResponse<LoyaltyBalanceDTO>> {
  const result = await db.customerQueries.getLoyaltyBalance(tenantId, customerId);
  return { success: true, data: result };
}

/**
 * Retrieve the loyalty points transaction history for a customer.
 * @param tenantId - The unique identifier of the tenant.
 * @param customerId - The unique identifier of the customer.
 * @param params - Query parameters such as pagination and filters.
 * @returns A list of loyalty point transactions.
 */
export async function getTransactions(tenantId: string, customerId: string, params: Record<string, unknown>): Promise<ApiResponse<LoyaltyTransactionDTO[]>> {
  const result = await db.customerQueries.listLoyaltyTransactions(tenantId, customerId, params);
  return { success: true, data: result };
}

/**
 * Award loyalty points to a customer for an action or purchase.
 * Atomically updates the customer's balance, auto-upgrades tier if
 * threshold crossed, and records the transaction with the correct
 * balance_after value.
 *
 * @param tenantId - The unique identifier of the tenant.
 * @param customerId - The unique identifier of the customer.
 * @param points - The number of points to award (must be positive).
 * @param description - A description of the earning event.
 * @returns The updated balance and tier after earning.
 */
export async function earnPoints(
  tenantId: string,
  customerId: string,
  points: number,
  description: string,
): Promise<ApiResponse<{ success: boolean; newBalance: number; newTier: string }>> {
  if (points <= 0) {
    return { success: false, data: { success: false, newBalance: 0, newTier: 'standard' } };
  }

  // Atomically adjust points and auto-upgrade tier
  const newBalance = await db.customerQueries.adjustLoyaltyPoints(tenantId, customerId, points);

  // Determine the tier the customer landed in after the points update
  let newTier = 'standard';
  if (newBalance >= TIER_THRESHOLDS.vip) newTier = 'vip';
  else if (newBalance >= TIER_THRESHOLDS.priority) newTier = 'priority';

  // Record the transaction with the correct balance_after
  await db.customerQueries.createLoyaltyTransaction(tenantId, customerId, {
    type: 'earn',
    points,
    balance_after: newBalance,
    description,
  });

  return { success: true, data: { success: true, newBalance, newTier } };
}

/**
 * Redeem loyalty points from a customer balance for a reward.
 * Validates that the customer has sufficient points before redeeming.
 * Returns the updated balance after redemption.
 *
 * @param tenantId - The unique identifier of the tenant.
 * @param customerId - The unique identifier of the customer.
 * @param points - The number of points to redeem (must be positive).
 * @param description - A description of the redemption event.
 * @returns The updated balance and tier after redemption.
 */
export async function redeemPoints(
  tenantId: string,
  customerId: string,
  points: number,
  description: string,
): Promise<ApiResponse<{ success: boolean; newBalance: number; newTier: string }>> {
  if (points <= 0) {
    return { success: false, data: { success: false, newBalance: 0, newTier: 'standard' } };
  }

  // Check current balance first
  const balance = await db.customerQueries.getLoyaltyBalance(tenantId, customerId);

  if (balance.points < points) {
    return {
      success: false,
      data: {
        success: false,
        newBalance: balance.points,
        newTier: balance.tier,
      },
    };
  }

  // Atomically deduct points (adjustLoyaltyPoints enforces non-negative floor)
  const newBalance = await db.customerQueries.adjustLoyaltyPoints(tenantId, customerId, -points);

  let newTier = 'standard';
  if (newBalance >= TIER_THRESHOLDS.vip) newTier = 'vip';
  else if (newBalance >= TIER_THRESHOLDS.priority) newTier = 'priority';

  // Record the transaction as a negative-point earn (redemption)
  await db.customerQueries.createLoyaltyTransaction(tenantId, customerId, {
    type: 'redeem',
    points: -points,
    balance_after: newBalance,
    description,
  });

  return { success: true, data: { success: true, newBalance, newTier } };
}

/**
 * Manually adjust a customer's loyalty points balance (correction or override).
 * Unlike earn/redeem, adjustments can be positive or negative and bypass
 * the insufficient-balance check. Tier is still auto-upgraded/downgraded.
 *
 * @param tenantId - The unique identifier of the tenant.
 * @param customerId - The unique identifier of the customer.
 * @param points - The number of points to adjust (positive or negative).
 * @param reason - The reason for the manual adjustment.
 * @returns The updated balance and tier after adjustment.
 */
export async function adjustPoints(
  tenantId: string,
  customerId: string,
  points: number,
  reason: string,
): Promise<ApiResponse<{ success: boolean; newBalance: number; newTier: string }>> {
  if (points === 0) {
    const balance = await db.customerQueries.getLoyaltyBalance(tenantId, customerId);
    return { success: true, data: { success: true, newBalance: balance.points, newTier: balance.tier } };
  }

  // Atomically adjust (adjustLoyaltyPoints floors at 0)
  const newBalance = await db.customerQueries.adjustLoyaltyPoints(tenantId, customerId, points);

  let newTier = 'standard';
  if (newBalance >= TIER_THRESHOLDS.vip) newTier = 'vip';
  else if (newBalance >= TIER_THRESHOLDS.priority) newTier = 'priority';

  await db.customerQueries.createLoyaltyTransaction(tenantId, customerId, {
    type: 'adjustment',
    points,
    balance_after: newBalance,
    description: reason,
  });

  return { success: true, data: { success: true, newBalance, newTier } };
}
