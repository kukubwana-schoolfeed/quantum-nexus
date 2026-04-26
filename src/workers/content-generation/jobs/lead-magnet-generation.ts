/**
 * Job: Lead Magnet Generation
 * Worker: 1 — Content Generation
 *
 * Generates lead magnet content via Claude Sonnet 4.6.
 */

import { Job } from 'bullmq';
import { generateContent } from '../../../lib/integrations/ai/vertex-claude';
import { upload } from '../../../lib/storage/r2-client';
import { LeadMagnetGenerationPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(1, 'content-generation');

export async function processLeadMagnetGeneration(job: Job<LeadMagnetGenerationPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, topic, format, niche_profile_id } = job.data;

  log.jobStart('lead-magnet-generation', job.id, tenant_id, [
    `Generate ${format} lead magnet on "${topic}"`,
    `Niche Profile: ${niche_profile_id}`,
  ], { topic, format });

  try {
    const response = await generateContent({
      prompt: `Create a comprehensive ${format === 'pdf' ? 'guide/ebook' : format === 'checklist' ? 'step-by-step checklist' : 'ready-to-use template'} about "${topic}". Make it highly valuable, actionable, and branded for the business. Include clear sections, practical tips, and a compelling title.`,
      systemPrompt: 'You are a lead magnet content specialist. Create high-value, actionable content that businesses can gate behind email capture. Every piece must deliver immediate value and position the business as an authority.',
      model: 'claude-sonnet-4-6',
      maxTokens: 4096,
      temperature: 0.7,
      tenantId: tenant_id,
    });

    // Upload content to R2 (in production, this would go through a PDF/design renderer)
    const ext = format === 'pdf' ? 'pdf' : 'docx';
    const fileName = `lm-${Date.now().toString(36)}.${ext}`;
    const uploadResult = await upload({
      fileName,
      fileBuffer: Buffer.from(response.content, 'utf-8'),
      contentType: ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      path: 'exports',
      tenantId: tenant_id,
    });

    const publicUrl = uploadResult.url;
    const result = {
      id: `lm-${Date.now().toString(36)}`,
      tenant_id,
      topic,
      format,
      niche_profile_id,
      download_url: publicUrl,
      title: response.content.split('\n')[0]?.replace(/^#+\s*/, '') || `${topic} — Free ${format}`,
      pages: Math.ceil(response.content.split(/\s+/).length / 250),
      token_usage: response.usage,
      generated_at: new Date().toISOString(),
    };

    const duration = Date.now() - start;
    log.jobComplete('lead-magnet-generation', job.id, tenant_id, duration, `Lead magnet generated (${format}, ${result.pages} pages)`);

    return { success: true, data: result, tenant_id, job_type: 'lead-magnet-generation', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('lead-magnet-generation', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'lead-magnet-generation', timestamp: new Date().toISOString() };
  }
}
