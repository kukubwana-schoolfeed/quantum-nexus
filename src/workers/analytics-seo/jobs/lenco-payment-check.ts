/**
 * Job: Lenco Payment Check
 * Worker: 4 — Analytics and SEO
 */

import { Job } from 'bullmq';
import { getTransactions } from '../../../lib/integrations/payments/lenco';
import { getPaymentStatus } from '../../../lib/integrations/payments/payment-router';
import { LencoPaymentCheckPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processLencoPaymentCheck(job: Job<LencoPaymentCheckPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, invoice_id } = job.data;

  log.jobStart('lenco-payment-check', job.id, tenant_id, [`Check payment: ${invoice_id}`], { invoice_id });

  try {
    const response = await getPaymentStatus({ transactionId: invoice_id, provider: 'lenco', tenantId: tenant_id });
    const result = { tenant_id, invoice_id, status: response.status, amount: response.amount, checked_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('lenco-payment-check', job.id, tenant_id, duration, `Status: ${response.status}`);
    return { success: true, data: result, tenant_id, job_type: 'lenco-payment-check', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('lenco-payment-check', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'lenco-payment-check', timestamp: new Date().toISOString() };
  }
}
