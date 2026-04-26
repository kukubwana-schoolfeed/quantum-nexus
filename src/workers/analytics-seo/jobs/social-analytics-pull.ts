/**
 * Job: Social Platform Analytics Pull
 * Worker: 4 — Analytics and SEO
 */

import { Job } from 'bullmq';
import { getInsights as metaInsights } from '../../../lib/integrations/social/meta';
import { getAnalytics as tiktokAnalytics } from '../../../lib/integrations/social/tiktok';
import { getAnalytics as linkedinAnalytics } from '../../../lib/integrations/social/linkedin';
import { getAnalytics as youtubeAnalytics } from '../../../lib/integrations/social/youtube';
import { getAnalytics as pinterestAnalytics } from '../../../lib/integrations/social/pinterest';
import { SocialAnalyticsPullPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processSocialAnalyticsPull(job: Job<SocialAnalyticsPullPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, platform, account_id, metrics, date_range } = job.data;

  log.jobStart('social-analytics-pull', job.id, tenant_id, [`Pull analytics from ${platform}`], { platform, account_id });

  try {
    const commonParams = { tenantId: tenant_id, since: date_range.start, until: date_range.end };

    switch (platform) {
      case 'meta': await metaInsights({ pageId: account_id, metrics, ...commonParams }); break;
      case 'tiktok': await tiktokAnalytics({ videoId: account_id, metrics, ...commonParams }); break;
      case 'linkedin': await linkedinAnalytics({ organizationUrn: account_id, metrics, ...commonParams }); break;
      case 'youtube': await youtubeAnalytics({ videoId: account_id, metrics, ...commonParams }); break;
      case 'pinterest': await pinterestAnalytics({ pinId: account_id, metrics, ...commonParams }); break;
    }

    const result = { tenant_id, platform, account_id, metrics, date_range, pulled_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('social-analytics-pull', job.id, tenant_id, duration, `${platform} analytics pulled`);
    return { success: true, data: result, tenant_id, job_type: 'social-analytics-pull', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('social-analytics-pull', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'social-analytics-pull', timestamp: new Date().toISOString() };
  }
}
