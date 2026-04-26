/**
 * WHISPER_STT — Self-hosted Whisper transcription integration (REAL)
 *
 * PURPOSE: All transcription — UGC videos, call transcripts,
 * bubble voice input, uploaded inspiration videos. Zero cost.
 *
 * AUTH METHOD: Internal HTTP call to local Whisper service on Hetzner
 * (WHISPER_SERVICE_URL env var). No API key — internal network only.
 *
 * NOTE: This is not an external service. It runs on Hetzner.
 * Deploy Whisper as a Docker container via Coolify before Phase 3 begins.
 * The container exposes an OpenAI-compatible /v1/audio/transcriptions endpoint.
 *
 * WORKER: Worker 1
 * PHASE: 3 (REAL — connected to self-hosted Whisper Docker container)
 * STATUS: connected
 *
 * ERROR HANDLING: All operations use retryWithBackoff with 3 retries.
 * On final failure, error is logged with tenant context and re-thrown
 * so BullMQ can mark the job as failed for the dead queue.
 *
 * RETRY BEHAVIOUR: 3 retries with exponential backoff.
 * Retries on: network errors, 5xx responses, timeouts.
 * Does NOT retry on: 4xx client errors (bad request, unsupported format).
 * On final failure, job goes to dead queue.
 */

import axios, { AxiosError } from 'axios';
import { WHISPER_SERVICE_URL } from '../../config/env';

// --- Types ---

/** Supported transcription languages */
export type WhisperLanguage = 'en' | 'ny' | 'auto';

/** Parameters for transcription */
export interface WhisperTranscribeParams {
  /** URL of the audio/video file to transcribe */
  fileUrl: string;
  /** Language hint — 'auto' for auto-detection */
  language?: WhisperLanguage;
  /** Tenant ID */
  tenantId: string;
}

/** A single timestamped segment of transcription */
export interface WhisperSegment {
  /** Start time in seconds */
  start: number;
  /** End time in seconds */
  end: number;
  /** Transcribed text for this segment */
  text: string;
}

/** Response from transcription */
export interface WhisperTranscribeResponse {
  /** Full transcript text */
  transcript: string;
  /** Timestamped segments */
  segments: WhisperSegment[];
  /** Detected or specified language */
  language: string;
}

/** Shape of the Whisper API response (OpenAI-compatible) */
interface WhisperApiResponse {
  text: string;
  language?: string;
  segments?: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
    avg_logprob: number;
  }>;
}

// --- Retry Logic ---

/** Default retry configuration */
const RETRY_CONFIG = {
  /** Maximum number of retry attempts */
  maxRetries: 3,
  /** Base delay in milliseconds for exponential backoff */
  baseDelayMs: 1000,
  /** Maximum delay cap in milliseconds */
  maxDelayMs: 30000,
} as const;

/**
 * Execute an async operation with exponential backoff retry logic.
 *
 * Retries on transient errors (network timeouts, 5xx responses).
 * Does NOT retry on client errors (4xx).
 *
 * @param operation - The async function to execute
 * @param context - Description for logging
 * @returns The result of the operation
 * @throws The last error if all retries are exhausted
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on client errors (4xx)
      if (!isRetryableError(error)) {
        throw lastError;
      }

      // If this was the last attempt, throw
      if (attempt === RETRY_CONFIG.maxRetries) {
        console.error(`[WHISPER] All ${RETRY_CONFIG.maxRetries + 1} attempts failed for ${context}`, {
          error: lastError.message,
        });
        throw lastError;
      }

      // Calculate exponential backoff delay with jitter
      const delay = Math.min(
        RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt),
        RETRY_CONFIG.maxDelayMs
      );
      const jitter = Math.random() * delay * 0.1;

      console.warn(
        `[WHISPER] Attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1} failed for ${context}. ` +
        `Retrying in ${Math.round(delay + jitter)}ms. Error: ${lastError.message}`
      );

      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
    }
  }

  throw lastError;
}

/**
 * Determine if an error from the Whisper service is retryable.
 * @param error - The error to check
 * @returns Whether the error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError;
    const status = axiosErr.response?.status;

    // Retry on 429 (throttling) and 5xx (server errors)
    if (status === 429) return true;
    if (status !== undefined && status >= 500) return true;

    // Retry on network errors (no response received)
    if (!axiosErr.response && axiosErr.code) {
      const retryableCodes = ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN'];
      return retryableCodes.includes(axiosErr.code);
    }

    // Don't retry on 4xx client errors
    if (status !== undefined && status >= 400 && status < 500) return false;
  }

  // Non-Axios errors (unexpected) — retry once
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('timeout') || msg.includes('network') || msg.includes('econnreset')) {
      return true;
    }
  }

  // Default: don't retry unknown errors
  return false;
}

// --- Service URL Validation ---

/**
 * Get the Whisper service URL, throwing if not configured.
 * @returns The configured Whisper service base URL
 * @throws Error if WHISPER_SERVICE_URL is not set
 */
function getWhisperUrl(): string {
  if (!WHISPER_SERVICE_URL) {
    throw new Error(
      'WHISPER_SERVICE_URL is not configured. Deploy the Whisper Docker container and set the WHISPER_SERVICE_URL environment variable.'
    );
  }
  return WHISPER_SERVICE_URL.replace(/\/+$/, ''); // Strip trailing slashes
}

// --- Main Export ---

/**
 * Transcribe audio or video using self-hosted Whisper on Hetzner.
 *
 * Calls the OpenAI-compatible /v1/audio/transcriptions endpoint
 * on the self-hosted Whisper Docker container.
 *
 * Used for: UGC video transcription, call transcripts,
 * bubble voice input, inspiration video transcription.
 * Zero cost — runs on Hetzner Docker container.
 *
 * @param params - File URL, language hint, tenantId
 * @returns Full transcript with timestamped segments
 * @throws Error if transcription fails after retries or service is not configured
 */
export async function transcribe(params: WhisperTranscribeParams): Promise<WhisperTranscribeResponse> {
  const baseUrl = getWhisperUrl();
  const context = `Whisper transcribe tenant=${params.tenantId} file=${params.fileUrl.substring(0, 80)}`;

  return retryWithBackoff(async () => {
    // Build form data for the Whisper API
    // The OpenAI-compatible endpoint expects multipart/form-data
    const formData = new FormData();
    formData.append('url', params.fileUrl);
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'segment');

    // Only set language if explicitly specified (not 'auto')
    if (params.language && params.language !== 'auto') {
      formData.append('language', params.language);
    }

    const response = await axios.post<WhisperApiResponse>(
      `${baseUrl}/v1/audio/transcriptions`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300_000, // 5 minutes — long audio files can take time
      }
    );

    const data = response.data;

    // Map Whisper API segments to our internal format
    const segments: WhisperSegment[] = (data.segments ?? []).map((seg) => ({
      start: Math.round(seg.start * 100) / 100,
      end: Math.round(seg.end * 100) / 100,
      text: seg.text.trim(),
    }));

    return {
      transcript: data.text.trim(),
      segments,
      language: data.language ?? (params.language === 'auto' || !params.language ? 'en' : params.language),
    };
  }, context);
}
