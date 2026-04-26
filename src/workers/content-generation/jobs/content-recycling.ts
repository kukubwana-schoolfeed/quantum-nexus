/**
 * Job: Content Recycling
 * Worker: 1 — Content Generation
 *
 * Fetches original content from DB, then repurposes it across formats
 * via Claude Sonnet 4.6.
 */

import { Job } from 'bullmq';
import { generateContent } from '../../../lib/integrations/ai/vertex-claude';
import { getPost } from '../../../lib/db/content-queries';
import { ContentRecyclingPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(1, 'content-generation');

export async function processContentRecycling(job: Job<ContentRecyclingPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, original_content_id, target_format, target_platform } = job.data;

  log.jobStart('content-recycling', job.id, tenant_id, [
    `Fetch original content ${original_content_id} from DB`,
    `Repurpose as ${target_format} for ${target_platform}`,
  ], { original_content_id, target_format, target_platform });

  try {
    const originalPost = await getPost(tenant_id, original_content_id);
    if (!originalPost) {
      throw new Error(`Original content ${original_content_id} not found for tenant ${tenant_id}`);
    }

    const originalText = originalPost.caption ?? originalPost.blog_content ?? '';
    if (!originalText.trim()) {
      throw new Error(`Original content ${original_content_id} has no text content to repurpose`);
    }

    const response = await generateContent({
      prompt: `Repurpose the following content into a ${target_format} optimized for ${target_platform}.\n\nOriginal content:\n---\n${originalText}\n---\n\nAdapt hooks, formatting, and structure for the new platform while preserving the core message. Maintain brand voice and key claims.`,
      systemPrompt: 'You are a content repurposing specialist. Take high-performing content and adapt it for new platforms and formats while maximizing engagement potential. Preserve the core message and brand voice.',
      model: 'claude-sonnet-4-6',
      maxTokens: 2048,
      temperature: 0.7,
      tenantId: tenant_id,
    });

    const result = {
      id: `rcy-${Date.now().toString(36)}`,
      tenant_id,
      original_content_id,
      target_format,
      target_platform,
      new_content: response.content,
      status: 'draft',
      token_usage: response.usage,
      recycled_at: new Date().toISOString(),
    };

    const duration = Date.now() - start;
    log.jobComplete('content-recycling', job.id, tenant_id, duration, `Recycled as ${target_format} for ${target_platform}`);

    return { success: true, data: result, tenant_id, job_type: 'content-recycling', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('content-recycling', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'content-recycling', timestamp: new Date().toISOString() };
  }
}
