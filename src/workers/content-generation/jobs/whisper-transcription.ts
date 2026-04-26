/**
 * Job: Whisper Transcription
 * Worker: 1 — Content Generation
 *
 * Calls self-hosted Whisper STT on Hetzner for transcription.
 */

import { Job } from 'bullmq';
import { transcribe, WhisperLanguage } from '../../../lib/integrations/transcription/whisper';
import { WhisperTranscriptionPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(1, 'content-generation');

export async function processWhisperTranscription(job: Job<WhisperTranscriptionPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, media_url, language } = job.data;

  log.jobStart('whisper-transcription', job.id, tenant_id, [
    `Route to self-hosted Whisper STT service on Hetzner`,
    `Media: ${media_url}, language: ${language ?? 'auto-detect'}`,
  ], { media_url, language: language ?? 'auto' });

  try {
    const response = await transcribe({
      fileUrl: media_url,
      language: language as WhisperLanguage | undefined,
      tenantId: tenant_id,
    });

    const result = {
      id: `trn-${Date.now().toString(36)}`,
      tenant_id,
      text: response.transcript,
      language: response.language ?? language ?? 'en',
      duration_seconds: response.segments.length > 0 ? response.segments[response.segments.length - 1].end : 0,
      media_url,
      confidence: response.segments.length > 0 ? 1 : 0,
      transcribed_at: new Date().toISOString(),
    };

    const duration = Date.now() - start;
    log.jobComplete('whisper-transcription', job.id, tenant_id, duration, `Transcribed (${result.duration_seconds}s, confidence: ${result.confidence})`);

    return { success: true, data: result, tenant_id, job_type: 'whisper-transcription', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('whisper-transcription', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'whisper-transcription', timestamp: new Date().toISOString() };
  }
}
