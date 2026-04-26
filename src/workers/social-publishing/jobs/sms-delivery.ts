/**
 * Job: SMS Delivery
 * Worker: 2 — Social Publishing
 */

import { Job } from 'bullmq';
import { sendSms } from '../../../lib/integrations/communication/twilio';
import { SmsDeliveryPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(2, 'social-publishing');

export async function processSmsDelivery(job: Job<SmsDeliveryPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, to, message } = job.data;

  log.jobStart('sms-delivery', job.id, tenant_id, [`Send SMS via Twilio to ${to}`], { to });

  try {
    const response = await sendSms({ to, body: message, tenantId: tenant_id });

    const result = { tenant_id, message_id: response.messageSid ?? `sms-${Date.now().toString(36)}`, to, message_preview: message.substring(0, 40), provider: 'twilio', status: 'delivered' as const, delivered_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('sms-delivery', job.id, tenant_id, duration, `SMS delivered to ${to}`);
    return { success: true, data: result, tenant_id, job_type: 'sms-delivery', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message_ = err instanceof Error ? err.message : String(err);
    log.jobFailed('sms-delivery', job.id, tenant_id, message_, duration);
    return { success: false, error: message_, tenant_id, job_type: 'sms-delivery', timestamp: new Date().toISOString() };
  }
}
