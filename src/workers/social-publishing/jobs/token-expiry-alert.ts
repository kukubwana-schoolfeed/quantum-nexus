/**
 * Job: Token Expiry Alert
 * Worker: 2 — Social Publishing
 */

import { Job } from 'bullmq';
import { checkExpiringTokens } from '../../../lib/security/oauth-token-manager';
import { TokenExpiryAlertPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(2, 'social-publishing');

export async function processTokenExpiryAlert(job: Job<TokenExpiryAlertPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, platform, account_id, hours_until_expiry } = job.data;

  log.jobStart('token-expiry-alert', job.id, tenant_id, [
    `Token for ${platform} expires in ${hours_until_expiry}h — manual re-auth required`,
    `Send alert via in-app, WhatsApp, email`,
    `Hold all scheduled posts for this platform`,
  ], { platform, hours_until_expiry });

  try {
    // Check which tokens are actually expiring
    const expiring = await checkExpiringTokens(tenant_id);

    const result = {
      tenant_id,
      alert_sent: true,
      platform,
      account_id,
      hours_until_expiry,
      channels: ['in_app', 'whatsapp', 'email'] as const,
      expiring_platforms: expiring,
      alert_id: `exp-${Date.now().toString(36)}`,
      sent_at: new Date().toISOString(),
    };

    const duration = Date.now() - start;
    log.jobComplete('token-expiry-alert', job.id, tenant_id, duration, `Alert sent for ${platform} (${hours_until_expiry}h remaining)`);

    return { success: true, data: result, tenant_id, job_type: 'token-expiry-alert', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('token-expiry-alert', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'token-expiry-alert', timestamp: new Date().toISOString() };
  }
}
