/**
 * Job: Loyalty Transaction Sync
 * Worker: 2 — Social Publishing
 *
 * Syncs loyalty transactions for customers. Can adjust points for a specific
 * customer or perform batch adjustments (e.g., point expiration for inactive
 * customers). Persists transactions via customerQueries.
 */

import { Job } from 'bullmq';
import { customerQueries, getSupabaseAdmin } from '../../../lib/db';
import { LoyaltyTransactionSyncPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(2, 'social-publishing');

const INACTIVITY_THRESHOLD_DAYS = 90;
const INACTIVITY_EXPIRY_POINTS = -50;

export async function processLoyaltyTransactionSync(job: Job<LoyaltyTransactionSyncPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, customer_id, points_delta, reason } = job.data;

  log.jobStart('loyalty-transaction-sync', job.id, tenant_id, [`Sync loyalty transactions`], { customer_id: customer_id ?? 'batch' });

  try {
    if (customer_id && points_delta !== undefined) {
      const newBalance = await customerQueries.adjustLoyaltyPoints(tenant_id, customer_id, points_delta);

      await customerQueries.createLoyaltyTransaction(tenant_id, customer_id, {
        type: points_delta > 0 ? 'earn' : points_delta < 0 ? 'adjustment' : 'adjustment',
        points: points_delta,
        balance_after: newBalance,
        description: reason ?? `Manual adjustment: ${points_delta > 0 ? '+' : ''}${points_delta} points`,
      });

      const duration = Date.now() - start;
      log.jobComplete('loyalty-transaction-sync', job.id, tenant_id, duration, `Adjusted ${points_delta} points for customer ${customer_id}. New balance: ${newBalance}`);

      return {
        success: true,
        data: {
          customer_id,
          points_adjusted: points_delta,
          new_balance: newBalance,
          synced_count: 1,
        },
        tenant_id,
        job_type: 'loyalty-transaction-sync',
        timestamp: new Date().toISOString(),
      };
    }

    // Batch mode: expire points for inactive customers
    const supabase = getSupabaseAdmin();
    const inactivityCutoff = new Date(Date.now() - INACTIVITY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { data: inactiveCustomers, error: fetchError } = await supabase
      .from('customers')
      .select('id, first_name, loyalty_points')
      .eq('tenant_id', tenant_id)
      .eq('status', 'active')
      .gt('loyalty_points', 0)
      .lt('updated_at', inactivityCutoff);

    if (fetchError) throw fetchError;

    let syncedCount = 0;
    const results: Array<{ customer_id: string; points_expired: number }> = [];

    for (const customer of (inactiveCustomers ?? [])) {
      const expiryAmount = Math.min(customer.loyalty_points, Math.abs(INACTIVITY_EXPIRY_POINTS));

      if (expiryAmount === 0) continue;

      try {
        const newBalance = await customerQueries.adjustLoyaltyPoints(tenant_id, customer.id, -expiryAmount);

        await customerQueries.createLoyaltyTransaction(tenant_id, customer.id, {
          type: 'expire',
          points: -expiryAmount,
          balance_after: newBalance,
          description: `${INACTIVITY_THRESHOLD_DAYS}-day inactivity: ${expiryAmount} points expired`,
        });

        results.push({ customer_id: customer.id, points_expired: expiryAmount });
        syncedCount++;
      } catch (adjustErr) {
        const msg = adjustErr instanceof Error ? adjustErr.message : String(adjustErr);
        log.jobFailed('loyalty-transaction-sync', job.id, tenant_id, `Failed to expire points for ${customer.id}: ${msg}`, Date.now() - start);
      }
    }

    const duration = Date.now() - start;
    log.jobComplete('loyalty-transaction-sync', job.id, tenant_id, duration, `${syncedCount} customers processed, ${results.reduce((s, r) => s + r.points_expired, 0)} total points expired`);

    return {
      success: true,
      data: {
        synced_count: syncedCount,
        total_points_expired: results.reduce((s, r) => s + r.points_expired, 0),
        customers_processed: results,
      },
      tenant_id,
      job_type: 'loyalty-transaction-sync',
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('loyalty-transaction-sync', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'loyalty-transaction-sync', timestamp: new Date().toISOString() };
  }
}
