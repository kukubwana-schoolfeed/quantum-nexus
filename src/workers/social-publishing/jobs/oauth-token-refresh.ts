/**
 * Job: OAuth Token Refresh
 * Worker: 2 — Social Publishing
 */

import { Job } from 'bullmq';
import { refreshToken } from '../../../lib/security/oauth-token-manager';
import { OAuthTokenRefreshPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(2, 'social-publishing');

const PLATFORM_MAP: Record<string, string> = {
  meta: 'meta_facebook', tiktok: 'tiktok', linkedin: 'linkedin',
  youtube: 'youtube', pinterest: 'pinterest', reddit: 'reddit',
};

export async function processOAuthTokenRefresh(job: Job<OAuthTokenRefreshPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, platform, account_id } = job.data;
  const oauthPlatform = (PLATFORM_MAP[platform] ?? platform) as 'meta_facebook' | 'meta_instagram' | 'tiktok' | 'linkedin' | 'youtube' | 'pinterest' | 'reddit';

  log.jobStart('oauth-token-refresh', job.id, tenant_id, [`Refresh OAuth token for ${platform}`], { platform, account_id });

  try {
    const result = await refreshToken(tenant_id, oauthPlatform, account_id);

    const duration = Date.now() - start;
    log.jobComplete('oauth-token-refresh', job.id, tenant_id, duration, `Refreshed: ${result.success}${result.reason ? ` (${result.reason})` : ''}`);

    return {
      success: result.success,
      data: { tenant_id, refreshed: result.success, platform, account_id, new_expires_at: result.expiresInSeconds ? new Date(Date.now() + result.expiresInSeconds * 1000).toISOString() : undefined, reason: result.reason, refreshed_at: new Date().toISOString() },
      tenant_id, job_type: 'oauth-token-refresh', timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('oauth-token-refresh', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'oauth-token-refresh', timestamp: new Date().toISOString() };
  }
}
