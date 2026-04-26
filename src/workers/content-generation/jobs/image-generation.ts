/**
 * Job: Image Generation
 * Worker: 1 — Content Generation
 *
 * Calls Imagen 3 via Vertex AI for image generation.
 * Integration handles R2 upload and returns CDN URLs.
 */

import { Job } from 'bullmq';
import { generateImage } from '../../../lib/integrations/ai/vertex-gemini';
import { ImageGenerationPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(1, 'content-generation');

/** Map pixel-dimension size strings to Imagen 3 aspect ratios. */
function sizeToAspectRatio(size: string): string | undefined {
  const ratioMap: Record<string, string> = {
    '1024x1024': '1:1', '512x512': '1:1', '1:1': '1:1',
    '1920x1080': '16:9', '1280x720': '16:9', '16:9': '16:9',
    '1080x1920': '9:16', '720x1280': '9:16', '9:16': '9:16',
    '1024x768': '4:3', '4:3': '4:3',
  };
  return ratioMap[size] ?? (size.includes(':') ? size : undefined);
}

export async function processImageGeneration(job: Job<ImageGenerationPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, prompt, size, purpose } = job.data;

  const aspectRatio = sizeToAspectRatio(size);
  log.jobStart('image-generation', job.id, tenant_id, [
    `Call Imagen 3 via Vertex AI with prompt: "${prompt.substring(0, 80)}..."`,
    `Size: ${size}, aspectRatio: ${aspectRatio ?? 'default'}, purpose: ${purpose}`,
  ], { purpose, size, aspectRatio });

  try {
    const response = await generateImage({
      description: prompt,
      aspectRatio,
      tenantId: tenant_id,
    });

    const imageUrl = response.imageUrls[0];
    if (!imageUrl) {
      throw new Error('Imagen 3 returned no images');
    }

    const result = {
      id: `img-${Date.now().toString(36)}`,
      tenant_id,
      image_url: imageUrl,
      prompt,
      size,
      purpose,
      generated_at: new Date().toISOString(),
    };

    const duration = Date.now() - start;
    log.jobComplete('image-generation', job.id, tenant_id, duration, `Image generated for ${purpose}`);

    return { success: true, data: result, tenant_id, job_type: 'image-generation', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('image-generation', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'image-generation', timestamp: new Date().toISOString() };
  }
}
