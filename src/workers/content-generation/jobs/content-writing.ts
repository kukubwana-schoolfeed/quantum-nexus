/**
 * Job: Content Writing
 * Worker: 1 — Content Generation
 *
 * Calls Claude Sonnet 4.6 with a dynamically constructed system prompt
 * from the tenant's Niche Profile. Active trend data injected.
 */

import { Job } from 'bullmq';
import { generateContent } from '../../../lib/integrations/ai/vertex-claude';
import { ContentWritingPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(1, 'content-generation');

export async function processContentWriting(job: Job<ContentWritingPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, content_type, target_platform, niche_profile_id, keywords, trend_data } = job.data;

  log.jobStart('content-writing', job.id, tenant_id, [
    `Construct dynamic system prompt from Niche Profile (${niche_profile_id})`,
    `Inject active trend data: ${JSON.stringify(trend_data ?? 'none')}`,
    `Call Claude Sonnet 4.6 to generate ${content_type} for ${target_platform}`,
  ], { content_type, target_platform, keywords: keywords ?? [] });

  try {
    const systemPrompt = [
      `You are the AI content assistant generating a ${content_type} for ${target_platform}.`,
      keywords?.length ? `Target keywords: ${keywords.join(', ')}.` : '',
      trend_data ? `Active trend context: ${JSON.stringify(trend_data)}.` : '',
      'Follow the business Niche Profile for tone, voice, and brand alignment.',
      'Never make up prices, services, or facts not in the Niche Profile.',
    ].filter(Boolean).join('\n');

    const prompt = `Generate a ${content_type} optimized for ${target_platform}. tenant_id: ${tenant_id}`;

    const response = await generateContent({
      prompt,
      systemPrompt,
      model: 'claude-sonnet-4-6',
      maxTokens: content_type === 'blog_post' ? 4096 : content_type === 'script' ? 2048 : 1024,
      temperature: 0.7,
      tenantId: tenant_id,
    });

    const result = {
      id: `cnt-${Date.now().toString(36)}`,
      tenant_id,
      content_type,
      target_platform,
      body: response.content,
      title: content_type === 'blog_post' ? response.content.split('\n')[0]?.replace(/^#+\s*/, '') : undefined,
      status: 'draft',
      word_count: response.content.split(/\s+/).length,
      model_used: response.model,
      token_usage: response.usage,
      created_at: new Date().toISOString(),
    };

    const duration = Date.now() - start;
    log.jobComplete('content-writing', job.id, tenant_id, duration, `Generated ${content_type} (${result.word_count} words)`);

    return { success: true, data: result, tenant_id, job_type: 'content-writing', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('content-writing', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'content-writing', timestamp: new Date().toISOString() };
  }
}
