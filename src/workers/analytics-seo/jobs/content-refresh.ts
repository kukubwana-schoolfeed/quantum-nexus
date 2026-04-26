/**
 * Job: Content Refresh
 * Worker: 4 — Analytics and SEO
 *
 * Finds stale content posts (published > 6 months ago, not yet refreshed),
 * regenerates content via AI, and persists the update via contentQueries.
 * If a specific content_id is provided, only that post is refreshed.
 */

import { Job } from 'bullmq';
import { generateContent } from '../../../lib/integrations/ai/vertex-claude';
import { contentQueries, getSupabaseAdmin } from '../../../lib/db';
import { ContentRefreshPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

const STALE_THRESHOLD_MONTHS = 6;

export async function processContentRefresh(job: Job<ContentRefreshPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, content_id } = job.data;

  log.jobStart('content-refresh', job.id, tenant_id, [`Refresh stale content`], { content_id: content_id ?? 'all eligible' });

  try {
    let postsToRefresh: Array<{ id: string; caption: string | null; blog_content: string | null }>;

    if (content_id) {
      const post = await contentQueries.getPost(tenant_id, content_id);
      if (!post) {
        const duration = Date.now() - start;
        log.jobComplete('content-refresh', job.id, tenant_id, duration, `Post ${content_id} not found`);
        return { success: true, data: { refreshed_count: 0, reason: 'post_not_found' }, tenant_id, job_type: 'content-refresh', timestamp: new Date().toISOString() };
      }
      postsToRefresh = [post];
    } else {
      const staleCutoff = new Date(Date.now() - STALE_THRESHOLD_MONTHS * 30 * 24 * 60 * 60 * 1000).toISOString();
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('content_posts')
        .select('id, caption, blog_content')
        .eq('tenant_id', tenant_id)
        .eq('status', 'published')
        .eq('is_refreshed', false)
        .lt('published_at', staleCutoff)
        .order('published_at', { ascending: true })
        .limit(10);

      if (error) throw error;
      postsToRefresh = (data ?? []) as Array<{ id: string; caption: string | null; blog_content: string | null }>;
    }

    if (postsToRefresh.length === 0) {
      const duration = Date.now() - start;
      log.jobComplete('content-refresh', job.id, tenant_id, duration, `No stale content to refresh`);
      return { success: true, data: { refreshed_count: 0, reason: 'no_stale_content' }, tenant_id, job_type: 'content-refresh', timestamp: new Date().toISOString() };
    }

    const refreshed: string[] = [];

    for (const post of postsToRefresh) {
      try {
        const response = await generateContent({
          prompt: `Refresh and update the content${post.caption ? ` titled "${post.caption}"` : ''} with current information, updated statistics, improved keyword targeting, and refreshed internal links. Maintain the original structure and brand voice.`,
          systemPrompt: 'You are a content refresh specialist. Update existing content to maintain accuracy, improve SEO performance, and ensure relevance.',
          model: 'claude-sonnet-4-6',
          maxTokens: 4096,
          temperature: 0.5,
          tenantId: tenant_id,
        });

        await contentQueries.updatePost(tenant_id, post.id, {
          blog_content: response.content,
          is_refreshed: true,
          original_post_id: post.id,
        });

        refreshed.push(post.id);
      } catch (refreshErr) {
        const msg = refreshErr instanceof Error ? refreshErr.message : String(refreshErr);
        log.jobFailed('content-refresh', job.id, tenant_id, `Failed to refresh post ${post.id}: ${msg}`, Date.now() - start);
      }
    }

    const duration = Date.now() - start;
    log.jobComplete('content-refresh', job.id, tenant_id, duration, `Refreshed ${refreshed.length}/${postsToRefresh.length} posts`);

    return {
      success: true,
      data: {
        refreshed_count: refreshed.length,
        refreshed_post_ids: refreshed,
        refreshed_at: new Date().toISOString(),
      },
      tenant_id,
      job_type: 'content-refresh',
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('content-refresh', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'content-refresh', timestamp: new Date().toISOString() };
  }
}
