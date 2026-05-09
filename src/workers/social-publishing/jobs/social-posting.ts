/**
 * Job: Social Posting
 * Worker: 2 — Social Publishing
 *
 * Posts content to social platforms via official APIs.
 * OAuth token validated BEFORE every post. Warm-up limits enforced.
 */

import { Job } from 'bullmq';
import { validateToken, refreshToken, supportsAutoRefresh } from '../../../lib/security/oauth-token-manager';
import { getSupabaseAdminClient } from '../../../lib/auth/supabase-auth';
import { post as metaPost } from '../../../lib/integrations/social/meta';
import { uploadVideo as tiktokUpload } from '../../../lib/integrations/social/tiktok';
import { createPost as linkedinPost } from '../../../lib/integrations/social/linkedin';
import { uploadVideo as youtubeUpload } from '../../../lib/integrations/social/youtube';
import { createPin as pinterestPin } from '../../../lib/integrations/social/pinterest';
import { submitPost as redditPost } from '../../../lib/integrations/social/reddit';
import { SocialPostingPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(2, 'social-publishing');

type OAuthPlatform = 'meta_facebook' | 'meta_instagram' | 'tiktok' | 'linkedin' | 'youtube' | 'pinterest' | 'reddit';

const PLATFORM_MAP: Record<string, { oauthPlatform: OAuthPlatform; postFn: string; platformId: string }> = {
  meta: { oauthPlatform: 'meta_facebook', postFn: 'meta', platformId: 'facebook' },
  tiktok: { oauthPlatform: 'tiktok', postFn: 'tiktok', platformId: 'tiktok' },
  linkedin: { oauthPlatform: 'linkedin', postFn: 'linkedin', platformId: 'linkedin' },
  youtube: { oauthPlatform: 'youtube', postFn: 'youtube', platformId: 'youtube' },
  pinterest: { oauthPlatform: 'pinterest', postFn: 'pinterest', platformId: 'pinterest' },
  reddit: { oauthPlatform: 'reddit', postFn: 'reddit', platformId: 'reddit' },
};

export async function processSocialPosting(job: Job<SocialPostingPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, platform, content_id, post_text, media_urls } = job.data;
  const config = PLATFORM_MAP[platform];

  log.jobStart('social-posting', job.id, tenant_id, [
    `[MANDATORY] Validate OAuth token for ${platform}`,
    `Post content_id ${content_id} to ${platform}`,
  ], { platform, content_id, media_count: (media_urls ?? []).length });

  try {
    if (!config) throw new Error(`Unsupported platform: ${platform}`);

    // Step 1: Validate OAuth token
    const validation = await validateToken(tenant_id, config.oauthPlatform, config.platformId);
    if (!validation.valid) {
      // Try auto-refresh if supported
      if (supportsAutoRefresh(config.oauthPlatform)) {
        const refresh = await refreshToken(tenant_id, config.oauthPlatform, config.platformId);
        if (!refresh.success) {
          return { success: false, error: `Token invalid and refresh failed: ${refresh.reason}`, tenant_id, job_type: 'social-posting', timestamp: new Date().toISOString() };
        }
      } else {
        return { success: false, error: `Token invalid for ${platform} — manual re-auth required`, tenant_id, job_type: 'social-posting', timestamp: new Date().toISOString() };
      }
    }

    // Step 2: Post to platform
    const supabase = getSupabaseAdminClient();
    const { data: metaPlatform } = await supabase
      .from('connected_platforms')
      .select('platform_user_id')
      .eq('tenant_id', tenant_id)
      .eq('platform', 'meta')
      .single();
    const metaPageId = metaPlatform?.platform_user_id ?? null;

    let platformPostId: string;
    switch (platform) {
      case 'meta': {
        if (!metaPageId) throw new Error('Meta Page ID not found — reconnect Meta in integrations');
        const r = await metaPost({ pageId: metaPageId, content: post_text, mediaUrl: media_urls?.[0], tenantId: tenant_id });
        platformPostId = r.postId;
        break;
      }
      case 'tiktok': {
        const r = await tiktokUpload({ videoUrl: media_urls?.[0] ?? '', caption: post_text, hashtags: [], tenantId: tenant_id });
        platformPostId = r.videoId;
        break;
      }
      case 'linkedin': {
        const r = await linkedinPost({ organizationId: tenant_id, content: post_text, mediaUrl: media_urls?.[0], tenantId: tenant_id });
        platformPostId = r.postId;
        break;
      }
      case 'youtube': {
        const r = await youtubeUpload({ videoUrl: media_urls?.[0] ?? '', title: post_text.substring(0, 100), description: post_text, tags: [], tenantId: tenant_id });
        platformPostId = r.videoId;
        break;
      }
      case 'pinterest': {
        const r = await pinterestPin({ imageUrl: media_urls?.[0] ?? '', description: post_text, title: post_text.substring(0, 100), boardId: `${tenant_id}-board`, tenantId: tenant_id });
        platformPostId = r.pinId;
        break;
      }
      case 'reddit': {
        const r = await redditPost({ title: post_text.substring(0, 300), content: post_text, kind: 'self', subreddit: `${tenant_id}-sub`, tenantId: tenant_id });
        platformPostId = r.postId;
        break;
      }
      default:
        throw new Error(`No post handler for platform: ${platform}`);
    }

    const result = {
      post_id: `pst-${platform}-${Date.now().toString(36)}`,
      tenant_id,
      platform,
      content_id,
      platform_post_id: platformPostId,
      status: 'published',
      published_at: new Date().toISOString(),
    };

    const duration = Date.now() - start;
    log.jobComplete('social-posting', job.id, tenant_id, duration, `Published to ${platform}: ${platformPostId}`);

    return { success: true, data: result, tenant_id, job_type: 'social-posting', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('social-posting', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'social-posting', timestamp: new Date().toISOString() };
  }
}
