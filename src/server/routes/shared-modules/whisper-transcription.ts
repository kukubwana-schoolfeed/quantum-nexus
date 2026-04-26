import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { IdReferenceDTO, TranscriptionDTO } from '@/lib/api/schema';

/** @module whisper-transcription @description Whisper Transcription route handlers for submitting audio/video transcription jobs and retrieving completed transcription results */

/**
 * Submits an audio or video file for transcription using the Whisper model.
 * Returns a job ID that can be polled for completion.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param data - The transcription job payload including file reference and options
 * @returns Promise resolving to the job ID reference for the submitted transcription
 */
export async function submitJob(
  tenantId: string,
  data: Record<string, unknown>,
): Promise<ApiResponse<IdReferenceDTO>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Retrieves the transcription result for a previously submitted job.
 * Returns the transcribed text, language, and completion status.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param jobId - The Whisper transcription job ID to retrieve results for
 * @returns Promise resolving to the transcription output and metadata
 */
export async function getTranscription(
  tenantId: string,
  jobId: string,
): Promise<ApiResponse<TranscriptionDTO>> {
  throw internalError('INTEGRATION_PENDING');
}
