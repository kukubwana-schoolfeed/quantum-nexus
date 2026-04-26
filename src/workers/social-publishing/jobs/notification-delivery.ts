/**
 * Job: Notification Delivery
 * Worker: 2 — Social Publishing
 *
 * Delivers a notification row via the requested channels (in_app, sms,
 * whatsapp, email). In-app delivery marks the notification as created
 * in the DB (already handled by the caller). SMS uses Twilio, WhatsApp
 * uses the Business API, Email uses the email delivery job.
 */

import { Job, Queue } from 'bullmq';
import { notificationQueries, getSupabaseAdmin } from '../../../lib/db';
import { sendSms } from '../../../lib/integrations/communication/twilio';
import { sendMessage as sendWhatsApp } from '../../../lib/integrations/communication/whatsapp';
import { bullMQConnection } from '../../shared/redis-connection';
import { NotificationDeliveryPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(2, 'social-publishing');

export async function processNotificationDelivery(job: Job<NotificationDeliveryPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, notification_id, channels } = job.data;

  log.jobStart('notification-delivery', job.id, tenant_id, [`Deliver notification via ${channels.join(', ')}`], { notification_id });

  try {
    const supabase = getSupabaseAdmin();
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('title, body, action_url')
      .eq('tenant_id', tenant_id)
      .eq('id', notification_id)
      .single();

    if (fetchError) throw fetchError;
    if (!notification) {
      const duration = Date.now() - start;
      log.jobComplete('notification-delivery', job.id, tenant_id, duration, `Notification ${notification_id} not found`);
      return { success: true, data: { delivered: [], reason: 'notification_not_found' }, tenant_id, job_type: 'notification-delivery', timestamp: new Date().toISOString() };
    }

    const message = `${notification.title}${notification.body ? `\n${notification.body}` : ''}`;

    // Get tenant's Twilio number or business owner phone for SMS/WhatsApp
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('phone_number')
      .eq('tenant_id', tenant_id)
      .single();

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('auth_user_id')
      .eq('tenant_id', tenant_id)
      .eq('role', 'business_owner')
      .limit(1)
      .single();

    const deliveredChannels: string[] = [];
    const errors: string[] = [];

    // In-app: already persisted by the caller, just record it
    if (channels.includes('in_app')) {
      deliveredChannels.push('in_app');
    }

    if (channels.includes('sms') && businessProfile?.phone_number) {
      try {
        await sendSms({
          to: businessProfile.phone_number,
          body: message,
          tenantId: tenant_id,
        });
        deliveredChannels.push('sms');
      } catch (smsErr) {
        const msg = smsErr instanceof Error ? smsErr.message : String(smsErr);
        errors.push(`SMS: ${msg}`);
      }
    }

    if (channels.includes('whatsapp') && businessProfile?.phone_number) {
      try {
        await sendWhatsApp({
          to: businessProfile.phone_number,
          message,
          tenantId: tenant_id,
        });
        deliveredChannels.push('whatsapp');
      } catch (waErr) {
        const msg = waErr instanceof Error ? waErr.message : String(waErr);
        errors.push(`WhatsApp: ${msg}`);
      }
    }

    if (channels.includes('email') && platformUser?.auth_user_id) {
      const { data: userEmail } = await supabase.auth.admin.getUserById(platformUser.auth_user_id);
      if (userEmail?.user?.email) {
        try {
          const emailQueue = new Queue('social-publishing', { connection: bullMQConnection });
          await emailQueue.add('email-delivery', {
            tenant_id,
            to: userEmail.user.email,
            subject: notification.title,
            template_id: 'notification',
            template_data: { body: notification.body, action_url: notification.action_url },
          });
          deliveredChannels.push('email');
        } catch (emailErr) {
          const msg = emailErr instanceof Error ? emailErr.message : String(emailErr);
          errors.push(`Email: ${msg}`);
        }
      }
    }

    const duration = Date.now() - start;
    log.jobComplete('notification-delivery', job.id, tenant_id, duration, `Delivered via ${deliveredChannels.join(', ')}`);

    return {
      success: true,
      data: {
        notification_id,
        delivered: deliveredChannels,
        failed: errors.length > 0 ? errors : undefined,
      },
      tenant_id,
      job_type: 'notification-delivery',
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('notification-delivery', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'notification-delivery', timestamp: new Date().toISOString() };
  }
}
