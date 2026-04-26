/**
 * Job: Voice Generation
 * Worker: 1 — Content Generation
 *
 * Calls ElevenLabs API for voice synthesis.
 */

import { Job } from 'bullmq';
import { synthesize } from '../../../lib/integrations/voice/elevenlabs';
import { upload } from '../../../lib/storage/r2-client';
import { VoiceGenerationPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(1, 'content-generation');

export async function processVoiceGeneration(job: Job<VoiceGenerationPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, voice_id, text, purpose } = job.data;

  log.jobStart('voice-generation', job.id, tenant_id, [
    `Call ElevenLabs voice synthesis with voice_id: ${voice_id}`,
    `Purpose: ${purpose}, text length: ${text.length}`,
  ], { voice_id, purpose });

  try {
    const response = await synthesize({
      text,
      voiceId: voice_id,
      outputFormat: 'mp3_44100_128',
      stability: 0.5,
      similarityBoost: 0.75,
      tenantId: tenant_id,
    });

    // Upload audio to R2
    const fileName = `voice-${Date.now().toString(36)}.mp3`;
    if (!response.audioBuffer) {
      throw new Error('Voice synthesis returned no audio buffer');
    }

    const uploadResult = await upload({
      fileName,
      fileBuffer: response.audioBuffer,
      contentType: response.contentType,
      path: 'audio',
      tenantId: tenant_id,
    });

    const publicUrl = uploadResult.url;
    const result = {
      id: `vce-${Date.now().toString(36)}`,
      tenant_id,
      audio_url: publicUrl,
      duration_seconds: response.duration,
      voice_id,
      purpose,
      text_preview: text.substring(0, 80) + (text.length > 80 ? '...' : ''),
      generated_at: new Date().toISOString(),
    };

    const duration = Date.now() - start;
    log.jobComplete('voice-generation', job.id, tenant_id, duration, `Audio generated (${result.duration_seconds}s)`);

    return { success: true, data: result, tenant_id, job_type: 'voice-generation', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('voice-generation', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'voice-generation', timestamp: new Date().toISOString() };
  }
}
