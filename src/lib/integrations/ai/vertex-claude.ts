/**
 * VERTEX_AI_CLAUDE — Primary AI brain integration (REAL)
 *
 * PURPOSE: Content generation, onboarding interview, niche research,
 * call responses, safety checks, algorithm scoring, bubble database queries,
 * SEO blog generation, entity building, inspiration analysis.
 *
 * AUTH METHOD: Dual — Google Cloud service account (Vertex) or Anthropic API key (direct)
 * AI_PROVIDER env var switches between them with zero code changes.
 *   'vertex'  → @google-cloud/aiplatform (VERTEX_AI_CREDENTIALS + VERTEX_AI_PROJECT_ID)
 *   'anthropic' → @anthropic-ai/sdk (ANTHROPIC_API_KEY)
 *
 * WORKER: Worker 1 (content generation), inline for API routes
 * PHASE: 5 (real connection)
 * STATUS: connected
 */

import {
  AI_PROVIDER,
  VERTEX_AI_PROJECT_ID,
  VERTEX_AI_CREDENTIALS,
  ANTHROPIC_API_KEY,
} from '../../config/env';

// --- Types ---

/** Available Claude models on Vertex AI */
export type ClaudeModel = 'claude-sonnet-4-6' | 'claude-haiku-4-5' | 'claude-opus-4-6';

/** AI provider switch — zero code changes beyond this config */
export type AIProvider = 'vertex' | 'anthropic';

/** Parameters for Claude content generation */
export interface ClaudeGenerateParams {
  /** The user prompt / message content */
  prompt: string;
  /** System prompt controlling Claude's behaviour */
  systemPrompt?: string;
  /** Model to use — defaults to claude-sonnet-4-6 */
  model?: ClaudeModel;
  /** Maximum tokens in the response */
  maxTokens?: number;
  /** Temperature (0.0–1.0) */
  temperature?: number;
  /** Tenant ID for billing and logging */
  tenantId: string;
}

/** Response from Claude content generation */
export interface ClaudeGenerateResponse {
  /** Generated content text */
  content: string;
  /** Token usage for billing */
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  /** Model that was actually used */
  model: string;
}

// --- Vertex AI client (lazy singleton) ---

let vertexClient: InstanceType<
  typeof import('@google-cloud/aiplatform').PredictionServiceClient
> | null = null;

const VERTEX_LOCATION = 'us-central1';

function getVertexClient() {
  if (vertexClient) return vertexClient;

  if (!VERTEX_AI_CREDENTIALS || !VERTEX_AI_PROJECT_ID) {
    throw new Error(
      'Vertex AI not configured. Set VERTEX_AI_CREDENTIALS and VERTEX_AI_PROJECT_ID env vars.'
    );
  }

  // Parse service account JSON from env
  let credentials: { client_email: string; private_key: string };
  try {
    credentials = JSON.parse(VERTEX_AI_CREDENTIALS);
  } catch {
    throw new Error('VERTEX_AI_CREDENTIALS is not valid JSON.');
  }

  // Dynamic import to avoid loading the heavy SDK unless actually using Vertex
  const { PredictionServiceClient } = require('@google-cloud/aiplatform');
  vertexClient = new PredictionServiceClient({
    apiEndpoint: `${VERTEX_LOCATION}-aiplatform.googleapis.com`,
    credentials,
    projectId: VERTEX_AI_PROJECT_ID,
  });

  return vertexClient;
}

// --- Anthropic client (lazy singleton) ---

let anthropicClient: InstanceType<typeof import('@anthropic-ai/sdk').default> | null = null;

function getAnthropicClient() {
  if (anthropicClient) return anthropicClient;

  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic not configured. Set ANTHROPIC_API_KEY env var.');
  }

  const { default: Anthropic } = require('@anthropic-ai/sdk');
  anthropicClient = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  return anthropicClient;
}

// --- Retry logic ---

const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 10000,
} as const;

async function retryWithBackoff<T>(operation: () => Promise<T>, context: string): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (!isRetryableError(error) || attempt === RETRY_CONFIG.maxRetries) {
        console.error(`[Claude] All attempts failed for ${context}`, { error: lastError.message });
        throw lastError;
      }

      const delay = Math.min(RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt), RETRY_CONFIG.maxDelayMs);
      const jitter = Math.random() * delay * 0.1;

      console.warn(
        `[Claude] Attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1} failed for ${context}. ` +
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

// --- Vertex AI model path mapping ---

function vertexModelPath(model: ClaudeModel): string {
  return `projects/${VERTEX_AI_PROJECT_ID}/locations/${VERTEX_LOCATION}/publishers/anthropic/models/${model}`;
}

// --- Internal routing functions ---

async function callVertexClaude(params: ClaudeGenerateParams): Promise<ClaudeGenerateResponse> {
  const model = params.model || 'claude-sonnet-4-6';

  return retryWithBackoff(async () => {
    const client = getVertexClient();

    const instance = {
      anthropic_version: 'vertex-2023-10-16',
      messages: [{ role: 'user' as const, content: params.prompt }],
      max_tokens: params.maxTokens ?? 4096,
      temperature: params.temperature ?? 0.7,
      ...(params.systemPrompt ? { system: params.systemPrompt } : {}),
    };

    const [response] = await client!.predict({
      endpoint: vertexModelPath(model),
      instances: [{ structValue: { fields: Object.fromEntries(
        Object.entries(instance).map(([k, v]) => [k, { stringValue: typeof v === 'string' ? v : JSON.stringify(v) }])
      ) } }],
      parameters: { structValue: { fields: {} } },
    });

    // Extract the prediction text
    const predictions = response.predictions ?? [];
    if (predictions.length === 0) {
      throw new Error('Vertex AI returned no predictions');
    }

    const prediction = predictions[0];
    const structFields = prediction.structValue?.fields ?? {};
    const content = structFields.content?.stringValue ?? '';
    const inputTokens = parseInt(structFields.usage?.structValue?.fields?.input_tokens?.stringValue ?? '0', 10);
    const outputTokens = parseInt(structFields.usage?.structValue?.fields?.output_tokens?.stringValue ?? '0', 10);

    return {
      content,
      usage: { inputTokens, outputTokens },
      model,
    };
  }, `Vertex Claude ${model} tenant=${params.tenantId}`);
}

async function callDirectAnthropic(params: ClaudeGenerateParams): Promise<ClaudeGenerateResponse> {
  const model = params.model || 'claude-sonnet-4-6';

  return retryWithBackoff(async () => {
    const client = getAnthropicClient();

    const response = await client!.messages.create({
      model,
      max_tokens: params.maxTokens ?? 4096,
      temperature: params.temperature ?? 0.7,
      system: params.systemPrompt ?? undefined,
      messages: [{ role: 'user', content: params.prompt }],
    });

    const content = response.content
      .filter((block) => block.type === 'text')
      .map((block) => ('text' in block ? (block as { type: 'text'; text: string }).text : ''))
      .join('');

    return {
      content,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      model: response.model,
    };
  }, `Anthropic ${model} tenant=${params.tenantId}`);
}

// --- Main export ---

/**
 * Generate content using Claude via Vertex AI (switchable to direct Anthropic).
 *
 * This is the primary AI function used across the entire platform.
 * Routes to Vertex AI or direct Anthropic based on AI_PROVIDER env var.
 *
 * @param params - Generation parameters including prompt, systemPrompt, model, tenantId
 * @returns Generated content with usage metadata
 */
export async function generateContent(params: ClaudeGenerateParams): Promise<ClaudeGenerateResponse> {
  if (AI_PROVIDER === 'vertex') {
    return callVertexClaude(params);
  }
  return callDirectAnthropic(params);
}

