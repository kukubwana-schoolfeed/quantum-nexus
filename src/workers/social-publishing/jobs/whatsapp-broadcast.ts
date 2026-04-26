/**
 * Job: WhatsApp Broadcast
 * Worker: 2 — Social Publishing
 *
 * Sends a WhatsApp broadcast to a contact list by resolving recipients
 * from the database and calling the WhatsApp Business API.
 */

import { Job } from 'bullmq';
import { getSupabaseAdmin } from '../../../lib/db';
import { sendBroadcast } from '../../../lib/integrations/communication/whatsapp';
import { WhatsAppBroadcastPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(2, 'social-publishing');

export async function processWhatsAppBroadcast(job: Job<WhatsAppBroadcastPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, contact_list_id, message_template_id } = job.data;

  log.jobStart('whatsapp-broadcast', job.id, tenant_id, [`Send broadcast to list: ${contact_list_id}`], { contact_list_id, message_template_id });

  try {
    const supabase = getSupabaseAdmin();

    const { data: customers, error: custError } = await supabase
      .from('customers')
      .select('phone_number')
      .eq('tenant_id', tenant_id)
      .eq('status', 'active')
      .not('phone_number', 'is', null);

    if (custError) throw custError;

    const recipients = (customers ?? []).map((c) => c.phone_number).filter(Boolean) as string[];

    if (recipients.length === 0) {
      const duration = Date.now() - start;
      log.jobComplete('whatsapp-broadcast', job.id, tenant_id, duration, `No recipients found`);
      return { success: true, data: { broadcast_id: `wab-${Date.now().toString(36)}`, recipients: 0, delivered: 0, read: 0, status: 'completed' as const }, tenant_id, job_type: 'whatsapp-broadcast', timestamp: new Date().toISOString() };
    }

    const response = await sendBroadcast({
      recipients,
      message: message_template_id,
      templateId: message_template_id,
      tenantId: tenant_id,
    });

    const result = {
      tenant_id,
      broadcast_id: response.broadcastId,
      contact_list_id,
      message_template_id,
      recipients: response.totalRecipients,
      delivered: response.deliveredCount,
      read: response.readCount,
      status: 'completed' as const,
      completed_at: new Date().toISOString(),
    };

    const duration = Date.now() - start;
    log.jobComplete('whatsapp-broadcast', job.id, tenant_id, duration, `Broadcast: ${result.delivered}/${result.recipients} delivered`);

    return { success: true, data: result, tenant_id, job_type: 'whatsapp-broadcast', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('whatsapp-broadcast', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'whatsapp-broadcast', timestamp: new Date().toISOString() };
  }
}
