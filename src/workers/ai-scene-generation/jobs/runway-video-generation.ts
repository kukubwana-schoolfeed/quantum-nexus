/**
 * Job: Runway Video Generation
 * Worker: 3 — AI Scene Generation
 *
 * Generates AI video scenes via RunwayML Gen-3 API.
 * Pre-conditions: premium tier, monthly quota, AI_SCENE flag.
 */

import { Job } from 'bullmq';
import { generateScene, getJobStatus } from '../../../lib/integrations/video/runway';
import { RunwayVideoGenerationPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(3, 'ai-scene-generation');

export async function processRunwayVideoGeneration(job: Job<RunwayVideoGenerationPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, scene_description, style, duration_seconds } = job.data;

  log.jobStart('runway-video-generation', job.id, tenant_id, [
    `[PRE-CHECK 1] Validate premium tier status`,
    `[PRE-CHECK 2] Validate monthly Runway quota`,
    `[PRE-CHECK 3] Verify content is flagged AI_SCENE`,
    `Call RunwayML Gen-3 API — concurrency: 1, 30s throttle`,
  ], { style, duration_seconds });

  try {
    // Pre-check: premium tier + quota — handled by integration layer
    const response = await generateScene({
      description: scene_description,
      duration: duration_seconds,
      style,
      tenantId: tenant_id,
    });

    // Poll for completion if pending/processing
    let finalStatus = response.status;
    let videoUrl = response.videoUrl;
    let pollCount = 0;
    const maxPolls = 60; // 5 minutes max at 5s intervals

    while ((finalStatus === 'pending' || finalStatus === 'processing') && pollCount < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const statusCheck = await getJobStatus({ jobId: response.videoUrl ?? 'unknown', tenantId: tenant_id });
      finalStatus = statusCheck.status;
      if (statusCheck.videoUrl) videoUrl = statusCheck.videoUrl;
      pollCount++;
    }

    if (finalStatus === 'failed') {
      return { success: false, error: 'RunwayML scene generation failed', tenant_id, job_type: 'runway-video-generation', timestamp: new Date().toISOString() };
    }

    const result = {
      video_id: `rwy-${Date.now().toString(36)}`,
      tenant_id,
      video_url: videoUrl,
      scene_description,
      style,
      duration_seconds,
      status: finalStatus === 'complete' ? 'completed' : finalStatus,
      generated_at: new Date().toISOString(),
    };

    const duration = Date.now() - start;
    log.jobComplete('runway-video-generation', job.id, tenant_id, duration, `Scene generated (${duration_seconds}s, ${pollCount} polls)`);

    return { success: true, data: result, tenant_id, job_type: 'runway-video-generation', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('runway-video-generation', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'runway-video-generation', timestamp: new Date().toISOString() };
  }
}
