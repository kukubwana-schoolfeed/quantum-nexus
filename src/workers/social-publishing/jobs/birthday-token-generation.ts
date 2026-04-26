/**
 * Job: Birthday Token Generation
 * Worker: 2 — Social Publishing
 *
 * Finds customers with upcoming birthdays, generates unique birthday
 * tokens via customerQueries, and sends birthday offer messages via
 * SMS (Twilio) or WhatsApp.
 */

import { Job } from 'bullmq';
import { customerQueries, getSupabaseAdmin } from '../../../lib/db';
import { sendSms } from '../../../lib/integrations/communication/twilio';
import { sendMessage as sendWhatsApp } from '../../../lib/integrations/communication/whatsapp';
import { BirthdayTokenGenerationPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(2, 'social-publishing');

const DEFAULT_DAYS_AHEAD = 7;
const BIRTHDAY_OFFER_DESCRIPTION = 'Happy Birthday! Enjoy a special birthday offer just for you.';
const TOKEN_EXPIRY_DAYS = 14;

function generateTokenExpiry(): string {
  return new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

export async function processBirthdayTokenGeneration(job: Job<BirthdayTokenGenerationPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, days_ahead, channels } = job.data;
  const daysAhead = days_ahead ?? DEFAULT_DAYS_AHEAD;
  const deliveryChannels = channels ?? ['sms', 'whatsapp'];

  log.jobStart('birthday-token-generation', job.id, tenant_id, [`Generate birthday tokens for next ${daysAhead} days`]);

  try {
    const customers = await customerQueries.getCustomersNeedingBirthdayTokens(tenant_id, daysAhead);

    if (customers.length === 0) {
      const duration = Date.now() - start;
      log.jobComplete('birthday-token-generation', job.id, tenant_id, duration, `No upcoming birthdays needing tokens`);
      return { success: true, data: { tokens_generated: 0, messages_sent: 0 }, tenant_id, job_type: 'birthday-token-generation', timestamp: new Date().toISOString() };
    }

    const supabase = getSupabaseAdmin();
    const thisYear = new Date().getFullYear();
    const tokensGenerated: string[] = [];
    const messagesSent: string[] = [];
    const errors: string[] = [];

    for (const customer of customers) {
      try {
        const token = await customerQueries.createBirthdayToken(
          tenant_id,
          customer.id,
          BIRTHDAY_OFFER_DESCRIPTION,
          generateTokenExpiry(),
          thisYear,
        );

        tokensGenerated.push(token.id);

        const customerRow = await supabase
          .from('customers')
          .select('phone_number, first_name')
          .eq('tenant_id', tenant_id)
          .eq('id', customer.id)
          .single();

        if (customerRow.error) {
          errors.push(`Failed to fetch phone for customer ${customer.id}: ${customerRow.error.message}`);
          continue;
        }

        const phone = customerRow.data.phone_number as string;
        const firstName = customerRow.data.first_name as string;
        const message = `Happy Birthday, ${firstName}! 🎂 You have a special offer waiting for you. Show this code at our store: ${token.token}. Valid for ${TOKEN_EXPIRY_DAYS} days. We appreciate you!`;

        if (deliveryChannels.includes('sms') && phone) {
          try {
            await sendSms({ to: phone, body: message, tenantId: tenant_id });
            messagesSent.push(`sms:${customer.id}`);
          } catch (smsErr) {
            const msg = smsErr instanceof Error ? smsErr.message : String(smsErr);
            errors.push(`SMS failed for ${customer.id}: ${msg}`);
          }
        }

        if (deliveryChannels.includes('whatsapp') && phone) {
          try {
            await sendWhatsApp({ to: phone, message, tenantId: tenant_id });
            messagesSent.push(`whatsapp:${customer.id}`);
          } catch (waErr) {
            const msg = waErr instanceof Error ? waErr.message : String(waErr);
            errors.push(`WhatsApp failed for ${customer.id}: ${msg}`);
          }
        }
      } catch (tokenErr) {
        const msg = tokenErr instanceof Error ? tokenErr.message : String(tokenErr);
        errors.push(`Token generation failed for ${customer.id}: ${msg}`);
      }
    }

    await customerQueries.expireOutstandingBirthdayTokens(tenant_id);

    const duration = Date.now() - start;
    log.jobComplete('birthday-token-generation', job.id, tenant_id, duration, `${tokensGenerated.length} tokens generated, ${messagesSent.length} messages sent`);

    return {
      success: true,
      data: {
        tokens_generated: tokensGenerated.length,
        token_ids: tokensGenerated,
        messages_sent: messagesSent.length,
        errors: errors.length > 0 ? errors : undefined,
        expired_tokens_cleaned: true,
      },
      tenant_id,
      job_type: 'birthday-token-generation',
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('birthday-token-generation', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'birthday-token-generation', timestamp: new Date().toISOString() };
  }
}
