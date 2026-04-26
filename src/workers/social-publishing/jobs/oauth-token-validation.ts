/**
 * Job: OAuth Token Validation
 * Worker: 2 — Social Publishing
 */

import { Job } from 'bullmq';
import { validateToken } from '../../../lib/security/oauth-token-manager';
import { OAuthTokenValidationPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(2, 'social-publishing');

const PLATFORM_MAP: Record<string, string> = {
  meta: 'meta_facebook', tiktok: 'tiktok', linkedin: 'linkedin',
  youtube: 'youtube', pinterest: 'pinterest', reddit: 'reddit',
  gsc: 'gsc', ga4: 'ga4', gbp: 'gbp',
};

export async function processOAuthTokenValidation(job: Job<OAuthTokenValidationPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, platform, account_id } = job.data;
  const oauthPlatform = (PLATFORM_MAP[platform] ?? platform) as 'meta_facebook' | 'meta_instagram' | 'tiktok' | 'linkedin' | 'youtube' | 'pinterest' | 'reddit' | 'gsc' | 'ga4' | 'gbp';

  log.jobStart('oauth-token-validation', job.id, tenant_id, [`Validate OAuth token for ${platform}`], { platform, account_id });

  try {
    const result = await validateToken(tenant_id, oauthPlatform, account_id);

    const duration = Date.now() - start;
    log.jobComplete('oauth-token-validation', job.id, tenant_id, duration, `Valid: ${result.valid}${result.reason ? ` (${result.reason})` : ''}`);

    return {
      success: true,
      data: { tenant_id, valid: result.valid, platform, account_id, expires_at: result.expiresInSeconds ? new Date(Date.now() + result.expiresInSeconds * 1000).toISOString() : undefined, reason: result.reason, validated_at: new Date().toISOString() },
      tenant_id, job_type: 'oauth-token-validation', timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('oauth-token-validation', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'oauth-token-validation', timestamp: new Date().toISOString() };
  }
}
