import * as db from '@/lib/db';
import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { VoiceJobDTO } from '@/lib/api/schema';

/** @module faceless-voice-pipeline @description Faceless channel voice generation — TTS voice listing, generation, and status tracking */

/**
 * Retrieve all configured voices for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to a list of voices with character assignments, provider, and sample URLs
 */
export async function getVoices(tenantId: string): Promise<ApiResponse<VoiceJobDTO[]>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Generate a voice-over clip for a character or scene.
 * @param tenantId - The unique identifier of the tenant
 * @param data - The generation parameters including characterId, text, provider, and voiceId
 * @returns Promise resolving to the voice job with its id, status, and audio URL
 */
export async function generateVoice(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<VoiceJobDTO>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Retrieve the status of a voice generation job.
 * @param tenantId - The unique identifier of the tenant
 * @param voiceJobId - The unique identifier of the voice generation job
 * @returns Promise resolving to the voice job status and audio URL when complete
 */
export async function getVoiceStatus(tenantId: string, voiceJobId: string): Promise<ApiResponse<VoiceJobDTO>> {
  throw internalError('INTEGRATION_PENDING');
}
