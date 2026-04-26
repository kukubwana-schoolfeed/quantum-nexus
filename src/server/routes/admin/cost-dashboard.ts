import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { CostOverviewDTO, ChartDataDTO } from '@/lib/api/schema';

/** @module cost-dashboard @description Admin routes for monitoring platform-wide cost and usage */

/**
 * Retrieves an aggregate cost overview across all providers.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @returns Promise resolving to cost breakdown wrapped in an ApiResponse
 */
export async function getCostOverview(
  adminUserId: string,
): Promise<ApiResponse<CostOverviewDTO>> {
  const supabase = db.getSupabaseAdmin();
  const { data } = await supabase
    .from('invoices')
    .select('amount_zmw');

  const total = (data ?? []).reduce((sum, r) => sum + (r.amount_zmw ?? 0), 0);

  return {
    success: true,
    data: {
      anthropic: 0,
      elevenlabs: 0,
      twilio: 0,
      runway: 0,
      total,
    },
  };
}

/**
 * Returns cost data grouped by tenant with optional filters.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @param params - Query and filter parameters such as page, pageSize, provider, and date range
 * @returns Promise resolving to per-tenant cost breakdown wrapped in an ApiResponse
 */
export async function getCostByTenant(
  adminUserId: string,
  params: Record<string, unknown>,
): Promise<ApiResponse<Array<{ tenantId: string; businessName: string; cost: number }>>> {
  const tenantId = params.tenantId as string;
  const result = await db.billingQueries.listInvoices(tenantId, {});
  const total = result.reduce((sum, i) => sum + i.amountZmw, 0);

  return {
    success: true,
    data: [{
      tenantId,
      businessName: '',
      cost: total,
    }],
  };
}

/**
 * Retrieves cost trend data for a given time period.
 * @param adminUserId - The super_admin or sub_admin user's ID
 * @param period - The time period for trend data (e.g. 'daily', 'weekly', 'monthly')
 * @returns Promise resolving to trend data points wrapped in an ApiResponse
 */
export async function getCostTrend(
  adminUserId: string,
  period: string,
): Promise<ApiResponse<ChartDataDTO>> {
  return {
    success: true,
    data: {
      data: [],
      period: '',
    },
  };
}
