/**
 * CARTESIA — Voice synthesis integration (REAL)
 *
 * PURPOSE: Voice synthesis for inbound call responses,
 * faceless channel character voices, voice cloning.
 *
 * AUTH METHOD: API key (CARTESIA_API_KEY env var)
 * RATE LIMITS: Depends on plan tier. Queue-based throttling.
 * VOICE MANAGEMENT: Each business gets an assigned voice from the
 * Cartesia account. Voice IDs stored per tenant in Supabase.
 *
 * API: https://api.cartesia.ai
 *   - POST /tts/bytes                        — synthesize speech
 *   - GET  /voices                            — list available voices
 *   - GET  /voices/{voice_id}                — get single voice details
 *   - POST /voices/clone                      — clone a voice from samples
 *   - DEL  /voices/{voice_id}                — delete a cloned voice
 *
 * WORKER: Worker 1 (voice generation), inline for real-time call handling
 * PHASE: 7 (real connection)
 * STATUS: connected
 *
 * ERROR HANDLING: All operations use retryWithBackoff with 3 retries.
 * On final failure, error is logged with tenant context and re-thrown.
 */

import { upload } from '../../storage/r2-client';
import axios from 'axios';

// --- Types ---

/** Output audio format for synthesis */
export type AudioOutputFormat = 'mp3_44100_128' | 'mp3_44100_192' | 'pcm_16000' | 'pcm_22050' | 'pcm_44100' | 'ulaw_8000';

/** Language for voice cloning */
export type CloningLanguage = 'en' | 'ny';

/** Parameters for voice synthesis */
export interface VoiceSynthesisParams {
  /** Text to synthesize into speech */
  text: string;
  /** Cartesia voice ID assigned to this business */
  voiceId: string;
  /** Output audio format (default: mp3_44100_128) */
  outputFormat?: AudioOutputFormat;
  /** Stability (0.0–1.0, default 0.5). Higher = more consistent, lower = more expressive */
  stability?: number;
  /** Similarity boost (0.0–1.0, default 0.75). Higher = closer to original voice */
  similarityBoost?: number;
  /** Style exaggeration (0.0–1.0, default 0.0). Higher = more stylistic speaking */
  style?: number;
  /** Speaker boost — enhances speaker similarity (default: true) */
  speakerBoost?: boolean;
  /** Tenant ID for billing and logging */
  tenantId: string;
  /** If true, upload result to R2 and return URL instead of buffer */
  storeInR2?: boolean;
}

/** Parameters for listing voices */
export interface ListVoicesParams {
  /** Tenant ID for logging */
  tenantId: string;
}

/** Parameters for getting a single voice */
export interface GetVoiceParams {
  /** Voice ID to retrieve */
  voiceId: string;
  /** Tenant ID for logging */
  tenantId: string;
}

/** Parameters for cloning a voice from audio samples */
export interface CloneVoiceParams {
  /** Display name for the cloned voice */
  name: string;
  /** Description of the voice characteristics */
  description?: string;
  /** URLs of audio samples to clone from (1-25 samples, 25s minimum total) */
  sampleUrls: string[];
  /** Language labels for the voice */
  labels?: {
    language?: CloningLanguage;
    accent?: string;
    description?: string;
    age?: 'young' | 'middle_aged' | 'old';
    gender?: 'male' | 'female';
    use_case?: 'narration' | 'conversation' | 'news' | 'audiobook';
  };
  /** Tenant ID for billing and logging */
  tenantId: string;
}

/** Parameters for deleting a cloned voice */
export interface DeleteVoiceParams {
  /** Voice ID to delete */
  voiceId: string;
  /** Tenant ID for logging */
  tenantId: string;
}

/** Response from voice synthesis */
export interface VoiceSynthesisResponse {
  /** Synthesized audio as a Buffer (omitted if storeInR2 is true) */
  audioBuffer?: Buffer;
  /** Duration of the audio in seconds */
  duration: number;
  /** MIME content type of the audio */
  contentType: string;
  /** CDN URL if stored in R2 (only when storeInR2 is true) */
  r2Url?: string;
  /** Size of audio in bytes */
  sizeBytes: number;
}

/** A single voice from the Cartesia library */
export interface ElevenLabsVoice {
  /** Voice ID */
  voiceId: string;
  /** Display name */
  name: string;
  /** Available model IDs */
  models: string[];
  /** Voice labels */
  labels: Record<string, string>;
  /** Preview URL */
  previewUrl: string;
  /** Category: 'cloned' | 'generated' | 'premade' */
  category: string;
}

/** Response from listing voices */
export interface ListVoicesResponse {
  /** Available voices */
  voices: ElevenLabsVoice[];
}

/** Response from getting a single voice */
export interface GetVoiceResponse {
  voice: ElevenLabsVoice & {
    /** Fine-tuning state */
    fineTuning: { state: string; message?: string };
  };
}

/** Response from cloning a voice */
export interface CloneVoiceResponse {
  /** ID of the newly created voice */
  voiceId: string;
  /** Whether cloning requires verification */
  requiresVerification: boolean;
}

/** Response from deleting a voice */
export interface DeleteVoiceResponse {
  /** Whether the voice was deleted */
  deleted: boolean;
}

// --- Client ---

const API_BASE = 'https://api.cartesia.ai';

function authHeaders(): Record<string, string> {
  const apiKey = process.env.CARTESIA_API_KEY;
  if (!apiKey) {
    throw new Error('Cartesia not configured. Set CARTESIA_API_KEY env var.');
  }
  return {
    'X-API-Key': apiKey,
  };
}

// --- Retry logic ---

const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 10_000,
} as const;

async function retryWithBackoff<T>(operation: () => Promise<T>, context: string): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (!isRetryableError(error) || attempt === RETRY_CONFIG.maxRetries) {
        console.error(`[Cartesia] All attempts failed for ${context}`, { error: lastError.message });
        throw lastError;
      }

      const delay = Math.min(RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt), RETRY_CONFIG.maxDelayMs);
      const jitter = Math.random() * delay * 0.1;

      console.warn(
        `[Cartesia] Attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1} failed for ${context}. ` +
        `Retrying in ${Math.round(delay + jitter)}ms.`
      );

      await new Promise((r) => setTimeout(r, delay + jitter));
    }
  }

  throw lastError;
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return true;
  const msg = error.message.toLowerCase();
  if (msg.includes('429') || msg.includes('throttl') || msg.includes('rate') || msg.includes('too many')) return true;
  if (msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('504')) return true;
  if (msg.includes('econnreset') || msg.includes('etimedout') || msg.includes('socket hang up')) return true;
  if (msg.includes('overloaded')) return true;
  return false;
}

// --- Content type mapping ---

function formatToContentType(format: AudioOutputFormat): string {
  if (format.startsWith('mp3')) return 'audio/mpeg';
  if (format.startsWith('pcm')) return 'audio/pcm';
  if (format.startsWith('ulaw')) return 'audio/basic';
  return 'audio/mpeg';
}

// --- Cartesia output format mapping ---

function formatToCartesiaOutput(format: AudioOutputFormat): Record<string, unknown> {
  if (format === 'mp3_44100_128') {
    return { container: 'mp3', sample_rate: 44100, bit_rate: 128000, encoding: 'mp3' };
  }
  if (format === 'mp3_44100_192') {
    return { container: 'mp3', sample_rate: 44100, bit_rate: 192000, encoding: 'mp3' };
  }
  if (format === 'pcm_16000') {
    return { container: 'raw', sample_rate: 16000, encoding: 'pcm_s16le' };
  }
  if (format === 'pcm_22050') {
    return { container: 'raw', sample_rate: 22050, encoding: 'pcm_s16le' };
  }
  if (format === 'pcm_44100') {
    return { container: 'raw', sample_rate: 44100, encoding: 'pcm_s16le' };
  }
  if (format === 'ulaw_8000') {
    return { container: 'raw', sample_rate: 8000, encoding: 'pcm_mulaw' };
  }
  return { container: 'mp3', sample_rate: 44100, bit_rate: 128000, encoding: 'mp3' };
}

// --- Main exports ---

/**
 * Synthesize speech from text using Cartesia Sonic-3.
 *
 * Used for: inbound call AI voice responses, faceless channel character voices.
 * Voice IDs are managed per tenant — each business has an assigned voice.
 *
 * Optionally stores the result in R2 (storeInR2: true) for faceless channel
 * audio that needs to be retrieved later for video assembly.
 *
 * For real-time call handling, omit storeInR2 to get the buffer directly.
 *
 * @param params - Text, voice ID, format options, tenantId
 * @returns Audio buffer (or R2 URL) with duration and content type
 */
export async function synthesize(params: VoiceSynthesisParams): Promise<VoiceSynthesisResponse> {
  const format = params.outputFormat || 'mp3_44100_128';
  const contentType = formatToContentType(format);

  return retryWithBackoff(async () => {
    const url = `${API_BASE}/tts/bytes`;

    const body = {
      model_id: 'sonic-3',
      transcript: params.text,
      voice: {
        mode: 'id',
        id: params.voiceId,
      },
      output_format: formatToCartesiaOutput(format),
    };

    const response = await axios.post(url, body, {
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
        Accept: contentType,
      },
      responseType: 'arraybuffer',
      timeout: 120_000,
    });

    const audioBuffer = Buffer.from(response.data as ArrayBuffer);
    const sizeBytes = audioBuffer.length;

    // Estimate duration from format bitrate
    let duration: number;
    if (format.startsWith('mp3_44100_128')) {
      duration = sizeBytes / 16000;
    } else if (format.startsWith('mp3_44100_192')) {
      duration = sizeBytes / 24000;
    } else if (format.startsWith('pcm_16000')) {
      duration = sizeBytes / 32000;
    } else if (format.startsWith('pcm_22050')) {
      duration = sizeBytes / 44100;
    } else if (format.startsWith('pcm_44100')) {
      duration = sizeBytes / 88200;
    } else if (format.startsWith('ulaw_8000')) {
      duration = sizeBytes / 8000;
    } else {
      duration = sizeBytes / 16000;
    }

    if (params.storeInR2) {
      const fileName = `voice_${params.voiceId}_${Date.now()}.${format.startsWith('mp3') ? 'mp3' : format.startsWith('pcm') ? 'pcm' : 'ulaw'}`;
      const result = await upload({
        fileName,
        fileBuffer: audioBuffer,
        contentType,
        path: 'audio',
        tenantId: params.tenantId,
      });

      return {
        duration: Math.round(duration * 100) / 100,
        contentType,
        r2Url: result.url,
        sizeBytes,
      };
    }

    return {
      audioBuffer,
      duration: Math.round(duration * 100) / 100,
      contentType,
      sizeBytes,
    };
  }, `Cartesia TTS voice=${params.voiceId} tenant=${params.tenantId}`);
}

/**
 * List all available voices in the Cartesia account.
 *
 * Used for: voice selection during onboarding, admin voice management.
 *
 * @param params - tenantId for logging
 * @returns List of available voices with metadata
 */
export async function listVoices(params: ListVoicesParams): Promise<ListVoicesResponse> {
  return retryWithBackoff(async () => {
    const url = `${API_BASE}/voices`;

    const response = await axios.get(url, {
      headers: authHeaders(),
      timeout: 30_000,
    });

    const data = response.data;

    const voices: ElevenLabsVoice[] = (data.data ?? []).map((v: any) => ({
      voiceId: v.id,
      name: v.name,
      models: ['sonic-3'],
      labels: v.labels ?? {},
      previewUrl: v.preview_url ?? '',
      category: v.category ?? 'premade',
    }));

    return { voices };
  }, `Cartesia list voices tenant=${params.tenantId}`);
}

/**
 * Get details for a single voice.
 *
 * Used for: verifying a voice exists before synthesis, checking fine-tuning status.
 *
 * @param params - voiceId, tenantId
 * @returns Voice details including fine-tuning state
 */
export async function getVoice(params: GetVoiceParams): Promise<GetVoiceResponse> {
  return retryWithBackoff(async () => {
    const url = `${API_BASE}/voices/${params.voiceId}`;

    const response = await axios.get(url, {
      headers: authHeaders(),
      timeout: 30_000,
    });

    const v = response.data;

    return {
      voice: {
        voiceId: v.id,
        name: v.name,
        models: ['sonic-3'],
        labels: v.labels ?? {},
        previewUrl: v.preview_url ?? '',
        category: v.category ?? 'premade',
        fineTuning: {
          state: v.fine_tuning?.state ?? 'not_started',
          message: v.fine_tuning?.message,
        },
      },
    };
  }, `Cartesia get voice=${params.voiceId} tenant=${params.tenantId}`);
}

/**
 * Clone a voice from audio sample URLs.
 *
 * Used for: creating branded character voices for faceless channels,
 * cloning a business owner's voice for call responses.
 *
 * Downloads samples from URLs, uploads to Cartesia for voice cloning.
 * Requires at least 25 seconds of total audio across all samples.
 *
 * @param params - Name, sample URLs, labels, tenantId
 * @returns New voice ID and verification status
 */
export async function cloneVoice(params: CloneVoiceParams): Promise<CloneVoiceResponse> {
  return retryWithBackoff(async () => {
    const url = `${API_BASE}/voices/clone`;

    // Download all sample audio files in parallel
    const sampleBuffers = await Promise.all(
      params.sampleUrls.map(async (sampleUrl) => {
        const response = await axios.get(sampleUrl, {
          responseType: 'arraybuffer',
          timeout: 60_000,
          maxContentLength: 10 * 1024 * 1024,
        });
        return {
          buffer: Buffer.from(response.data as ArrayBuffer),
          contentType: response.headers['content-type'] || 'audio/mpeg',
        };
      })
    );

    // Build multipart form data
    const FormData = require('form-data');
    const form = new FormData();

    form.append('name', params.name);

    if (params.description) {
      form.append('description', params.description);
    }

    if (params.labels) {
      form.append('labels', JSON.stringify(params.labels));
    }

    // Append each sample as a file
    for (let i = 0; i < sampleBuffers.length; i++) {
      const ext = sampleBuffers[i].contentType.includes('wav') ? 'wav' : 'mp3';
      form.append('files', sampleBuffers[i].buffer, {
        filename: `sample_${i}.${ext}`,
        contentType: sampleBuffers[i].contentType,
      });
    }

    const response = await axios.post(url, form, {
      headers: {
        ...authHeaders(),
        ...form.getHeaders(),
      },
      timeout: 120_000,
      maxContentLength: 50 * 1024 * 1024,
    });

    const data = response.data;

    return {
      voiceId: data.id,
      requiresVerification: data.requires_verification ?? false,
    };
  }, `Cartesia clone voice="${params.name}" tenant=${params.tenantId}`);
}

/**
 * Delete a cloned voice from the Cartesia account.
 *
 * Used for: cleaning up voices when a tenant churns,
 * removing incorrectly cloned voices.
 *
 * @param params - voiceId to delete, tenantId for logging
 * @returns Whether the voice was deleted
 */
export async function deleteVoice(params: DeleteVoiceParams): Promise<DeleteVoiceResponse> {
  return retryWithBackoff(async () => {
    const url = `${API_BASE}/voices/${params.voiceId}`;

    await axios.delete(url, {
      headers: authHeaders(),
      timeout: 30_000,
    });

    return { deleted: true };
  }, `Cartesia delete voice=${params.voiceId} tenant=${params.tenantId}`);
}
