/**
 * VERTEX_AI_GEMINI — Gemini and Imagen integration via Vertex AI (REAL)
 *
 * PURPOSE: Long video analysis (Gemini 2.5 Pro), inspiration video analysis,
 * bulk fast tasks and trend scanning (Gemini 2.0 Flash),
 * image generation (Imagen 3).
 *
 * AUTH METHOD: Dual — Google Cloud service account (Vertex) or Google AI Studio (API key)
 *   'vertex'  → VERTEX_AI_CREDENTIALS + VERTEX_AI_PROJECT_ID (same as vertex-claude)
 *   'google-ai' → GEMINI_API_KEY (simpler, good for dev/testing)
 *   Falls back to Vertex if GEMINI_API_KEY is not set.
 *
 * MODELS: gemini-2.5-pro, gemini-2.0-flash, imagen-3
 * WORKER: Worker 1
 * PHASE: 6 (real connection)
 * STATUS: connected
 */

import {
  VERTEX_AI_PROJECT_ID,
  VERTEX_AI_CREDENTIALS,
  GEMINI_API_KEY,
} from '../../config/env';
import { upload } from '../../storage/r2-client';
import axios from 'axios';

// --- Types ---

/** Available Gemini and Imagen models on Vertex AI */
export type GeminiModel = 'gemini-2.5-pro' | 'gemini-2.0-flash';
export type ImagenModel = 'imagen-3';

/** Gemini provider switch */
export type GeminiProvider = 'vertex' | 'google-ai';

/** Parameters for Gemini video analysis */
export interface GeminiVideoAnalysisParams {
  /** URL of the video to analyze (HTTP/HTTPS or gs:// URI) */
  videoUrl: string;
  /** Prompt describing what to analyze */
  prompt: string;
  /** Gemini model to use */
  model?: GeminiModel;
  /** Tenant ID for billing and logging */
  tenantId: string;
}

/** Parameters for Gemini text/generation tasks */
export interface GeminiTextParams {
  /** The prompt for fast bulk tasks or trend scanning */
  prompt: string;
  /** System prompt for context */
  systemPrompt?: string;
  /** Gemini model to use */
  model?: GeminiModel;
  /** Temperature (0.0–1.0) */
  temperature?: number;
  /** Maximum output tokens */
  maxTokens?: number;
  /** Tenant ID */
  tenantId: string;
}

/** Parameters for Imagen image generation */
export interface ImagenGenerateParams {
  /** Text description of the image to generate */
  description: string;
  /** Aspect ratio (e.g. '1:1', '16:9', '4:3') */
  aspectRatio?: string;
  /** Number of images to generate (max 4) */
  numberOfImages?: number;
  /** Tenant ID */
  tenantId: string;
}

/** Response from Gemini video analysis */
export interface GeminiVideoAnalysisResponse {
  /** Analysis text output */
  analysis: string;
  /** Timestamped segments parsed from analysis */
  segments: Array<{
    startTime: number;
    endTime: number;
    text: string;
  }>;
}

/** Response from Gemini text tasks */
export interface GeminiTextResponse {
  /** Generated text */
  content: string;
  /** Token usage */
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

/** Response from Imagen image generation */
export interface ImagenGenerateResponse {
  /** CDN URLs of generated images (stored in R2) */
  imageUrls: string[];
}

// --- Provider detection ---

function getProvider(): GeminiProvider {
  if (GEMINI_API_KEY) return 'google-ai';
  return 'vertex';
}

// --- Vertex AI Authentication (lazy) ---

const VERTEX_LOCATION = 'us-central1';
const VERTEX_AI_BASE = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1`;
const GOOGLE_AI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

let cachedToken: string | null = null;
let tokenExpiryMs = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiryMs - 60_000) {
    return cachedToken;
  }

  if (!VERTEX_AI_CREDENTIALS || !VERTEX_AI_PROJECT_ID) {
    throw new Error(
      'Vertex AI not configured. Set VERTEX_AI_CREDENTIALS and VERTEX_AI_PROJECT_ID env vars.'
    );
  }

  let credentials: { client_email: string; private_key: string };
  try {
    credentials = JSON.parse(VERTEX_AI_CREDENTIALS);
  } catch {
    throw new Error('VERTEX_AI_CREDENTIALS is not valid JSON.');
  }

  const { GoogleAuth } = require('google-auth-library');
  const auth = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();

  if (!tokenResponse.token) {
    throw new Error('Failed to obtain Vertex AI access token.');
  }

  cachedToken = tokenResponse.token;
  tokenExpiryMs = Date.now() + 3_600_000;

  return cachedToken as string;
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
        console.error(`[Gemini] All attempts failed for ${context}`, { error: lastError.message });
        throw lastError;
      }

      const delay = Math.min(RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt), RETRY_CONFIG.maxDelayMs);
      const jitter = Math.random() * delay * 0.1;

      console.warn(
        `[Gemini] Attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1} failed for ${context}. ` +
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
  if (msg.includes('429') || msg.includes('throttl') || msg.includes('rate')) return true;
  if (msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('504')) return true;
  if (msg.includes('econnreset') || msg.includes('etimedout') || msg.includes('socket hang up')) return true;
  if (msg.includes('overloaded')) return true;
  return false;
}

// --- Vertex AI REST API helpers ---

async function callGeminiGenerateContent(
  model: GeminiModel,
  requestBody: Record<string, unknown>
): Promise<Record<string, any>> {
  const provider = getProvider();

  let url: string;
  let headers: Record<string, string>;

  if (provider === 'google-ai') {
    url = `${GOOGLE_AI_BASE}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    headers = { 'Content-Type': 'application/json' };
  } else {
    const token = await getAccessToken();
    url = `${VERTEX_AI_BASE}/projects/${VERTEX_AI_PROJECT_ID}/locations/${VERTEX_LOCATION}/publishers/google/models/${model}:generateContent`;
    headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  const response = await axios.post(url, requestBody, {
    headers,
    timeout: 300_000,
    maxContentLength: 50 * 1024 * 1024,
  });

  return response.data;
}

async function callImagenPredict(
  prompt: string,
  sampleCount: number,
  aspectRatio?: string
): Promise<Record<string, any>> {
  const provider = getProvider();
  const body = {
    instances: [{ prompt }],
    parameters: {
      sampleCount,
      ...(aspectRatio ? { aspectRatio } : {}),
    },
  };

  let url: string;
  let headers: Record<string, string>;

  if (provider === 'google-ai') {
    url = `${GOOGLE_AI_BASE}/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`;
    headers = { 'Content-Type': 'application/json' };
  } else {
    const token = await getAccessToken();
    url = `${VERTEX_AI_BASE}/projects/${VERTEX_AI_PROJECT_ID}/locations/${VERTEX_LOCATION}/publishers/google/models/imagen-3:predict`;
    headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  const response = await axios.post(url, body, {
    headers,
    timeout: 120_000,
  });

  return response.data;
}

// --- Video download helper ---

const MAX_INLINE_VIDEO_BYTES = 20 * 1024 * 1024; // 20MB

async function downloadVideoAsBase64(videoUrl: string): Promise<{ mimeType: string; data: string }> {
  const response = await axios.get(videoUrl, {
    responseType: 'arraybuffer',
    timeout: 120_000,
    maxContentLength: MAX_INLINE_VIDEO_BYTES,
  });

  const contentType = response.headers['content-type'] || 'video/mp4';
  const data = Buffer.from(response.data as ArrayBuffer).toString('base64');

  return { mimeType: contentType, data };
}

// --- Segment parsing ---

function parseSegments(analysis: string): Array<{ startTime: number; endTime: number; text: string }> {
  const segments: Array<{ startTime: number; endTime: number; text: string }> = [];

  // Match [MM:SS - MM:SS] or [M:SS-M:SS] timestamp patterns
  const pattern = /\[(\d{1,2}):(\d{2})\s*[-\u2013\u2014]\s*(\d{1,2}):(\d{2})\]\s*(.+)/g;
  let match;
  while ((match = pattern.exec(analysis)) !== null) {
    segments.push({
      startTime: parseInt(match[1]) * 60 + parseInt(match[2]),
      endTime: parseInt(match[3]) * 60 + parseInt(match[4]),
      text: match[5].trim(),
    });
  }

  if (segments.length === 0) {
    segments.push({ startTime: 0, endTime: 0, text: analysis });
  }

  return segments;
}

// --- Response extraction helpers ---

function extractTextFromCandidate(candidate: any): string {
  if (!candidate?.content?.parts) return '';
  return candidate.content.parts
    .filter((p: any) => p.text)
    .map((p: any) => p.text)
    .join('\n');
}

function checkFinishReason(candidate: any): void {
  const reason = candidate?.finishReason;
  if (reason === 'SAFETY') {
    throw new Error('Gemini blocked the response due to safety filters. Rephrase the prompt and retry.');
  }
  if (reason === 'RECITATION') {
    throw new Error('Gemini blocked the response due to recitation (copyrighted content). Rephrase the prompt and retry.');
  }
  if (reason === 'PROHIBITED_CONTENT') {
    throw new Error('Gemini blocked the response due to prohibited content policy.');
  }
}

// --- Main exports ---

/**
 * Analyze a video using Gemini (2.5 Pro for long videos, 2.0 Flash for quick scans).
 *
 * Supports HTTP/HTTPS URLs (downloaded as inline data) and gs:// URIs (file data).
 * For videos larger than 20MB, upload to GCS first and pass a gs:// URI.
 *
 * @param params - Video URL, analysis prompt, model selection, tenantId
 * @returns Analysis text with timestamped segments
 */
export async function analyzeVideo(params: GeminiVideoAnalysisParams): Promise<GeminiVideoAnalysisResponse> {
  const model = params.model || 'gemini-2.5-pro';

  return retryWithBackoff(async () => {
    let videoPart: Record<string, unknown>;

    if (params.videoUrl.startsWith('gs://')) {
      videoPart = {
        fileData: {
          mimeType: 'video/mp4',
          fileUri: params.videoUrl,
        },
      };
    } else {
      const { mimeType, data } = await downloadVideoAsBase64(params.videoUrl);
      videoPart = { inlineData: { mimeType, data } };
    }

    const contents = [
      {
        role: 'user',
        parts: [videoPart, { text: params.prompt }],
      },
    ];

    const response = await callGeminiGenerateContent(model, {
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 8192,
      },
    });

    const candidate = response.candidates?.[0];
    if (!candidate) {
      throw new Error('Gemini returned no candidates. The video may be too large or the prompt may be blocked.');
    }

    checkFinishReason(candidate);
    const analysis = extractTextFromCandidate(candidate);
    const segments = parseSegments(analysis);

    return { analysis, segments };
  }, `Gemini ${model} video analysis tenant=${params.tenantId}`);
}

/**
 * Run a fast text generation task using Gemini.
 *
 * Used for: bulk trend scanning, fast classification, bulk content tasks.
 * Defaults to Gemini 2.0 Flash for speed; use gemini-2.5-pro for complex reasoning.
 *
 * @param params - Prompt, system context, model, tenantId
 * @returns Generated text with usage metadata
 */
export async function generateText(params: GeminiTextParams): Promise<GeminiTextResponse> {
  const model = params.model || 'gemini-2.0-flash';

  return retryWithBackoff(async () => {
    const contents = [
      {
        role: 'user',
        parts: [{ text: params.prompt }],
      },
    ];

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: params.temperature ?? 0.7,
        maxOutputTokens: params.maxTokens ?? 4096,
      },
    };

    if (params.systemPrompt) {
      body.systemInstruction = { parts: [{ text: params.systemPrompt }] };
    }

    const response = await callGeminiGenerateContent(model, body);

    const candidate = response.candidates?.[0];
    if (!candidate) {
      throw new Error('Gemini returned no candidates. The prompt may be blocked by safety filters.');
    }

    checkFinishReason(candidate);
    const content = extractTextFromCandidate(candidate);
    const usage = response.usageMetadata ?? {};

    return {
      content,
      usage: {
        inputTokens: usage.promptTokenCount ?? 0,
        outputTokens: usage.candidatesTokenCount ?? 0,
      },
    };
  }, `Gemini ${model} text tenant=${params.tenantId}`);
}

/**
 * Generate images using Imagen 3 via Vertex AI.
 *
 * Generated images are uploaded to R2 storage and CDN URLs are returned.
 * Maximum 4 images per request (Imagen API limit).
 *
 * @param params - Description, aspect ratio, count, tenantId
 * @returns CDN URLs of generated images
 */
export async function generateImage(params: ImagenGenerateParams): Promise<ImagenGenerateResponse> {
  const count = Math.min(params.numberOfImages ?? 1, 4);

  return retryWithBackoff(async () => {
    const response = await callImagenPredict(params.description, count, params.aspectRatio);

    const predictions = response.predictions ?? [];
    const imageUrls: string[] = [];

    for (let i = 0; i < predictions.length; i++) {
      const b64 = predictions[i]?.bytesBase64Encoded;
      if (!b64) continue;

      const buffer = Buffer.from(b64, 'base64');
      const fileName = `imagen_${Date.now()}_${i}.png`;

      const result = await upload({
        fileName,
        fileBuffer: buffer,
        contentType: 'image/png',
        path: 'images',
        tenantId: params.tenantId,
      });

      imageUrls.push(result.url);
    }

    if (imageUrls.length === 0) {
      throw new Error('Imagen returned no valid images. The prompt may be blocked by safety filters.');
    }

    return { imageUrls };
  }, `Imagen 3 image gen tenant=${params.tenantId}`);
}
