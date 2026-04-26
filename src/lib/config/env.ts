/**
 * Centralised Environment Configuration
 * @module config
 * @description Validates and exports all environment variables.
 * RULE G-5: No direct process.env access outside this file.
 * All env vars must be accessed through this module.
 */

/** AI provider switch: 'vertex' or 'anthropic' */
export const AI_PROVIDER = (process.env.AI_PROVIDER ?? 'vertex') as 'vertex' | 'anthropic';

/** Supabase */
export const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

/** Vertex AI */
export const VERTEX_AI_PROJECT_ID = process.env.VERTEX_AI_PROJECT_ID ?? '';
export const VERTEX_AI_CREDENTIALS = process.env.VERTEX_AI_CREDENTIALS ?? '';

/** Anthropic Direct */
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? '';

/** Google AI Studio (Gemini direct — alternative to Vertex AI) */
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';

/** Platform Integrations */
export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY ?? '';
export const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY ?? '';
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? '';
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? '';

/** Cloudflare R2 */
export const CLOUDFLARE_R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY ?? '';
export const CLOUDFLARE_R2_SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_KEY ?? '';
export const CLOUDFLARE_R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET ?? 'quantum-nexus-media';
export const CLOUDFLARE_R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT ?? '';
export const CLOUDFLARE_R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL ?? '';

/** Whisper (self-hosted on Hetzner) */
export const WHISPER_SERVICE_URL = process.env.WHISPER_SERVICE_URL ?? '';

/** DataForSEO */
export const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN ?? '';
export const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD ?? '';

/** Redis */
export const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
export const REDIS_HOST = process.env.REDIS_HOST ?? 'localhost';

/** Encryption */
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ?? '';

/** Platform */
export const NEXT_PUBLIC_PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL ?? 'http://localhost:3000';

/** Meta (Facebook + Instagram) OAuth — platform-level app credentials */
export const META_APP_ID = process.env.META_APP_ID ?? '';
export const META_APP_SECRET = process.env.META_APP_SECRET ?? '';

/** LinkedIn OAuth — platform-level app credentials */
export const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID ?? '';
export const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET ?? '';

/** TikTok OAuth — platform-level app credentials */
export const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY ?? '';
export const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET ?? '';

/** Google OAuth (YouTube, GSC, GA4, GBP) — platform-level app credentials */
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? '';

/** Pinterest OAuth — platform-level app credentials */
export const PINTEREST_APP_ID = process.env.PINTEREST_APP_ID ?? '';
export const PINTEREST_APP_SECRET = process.env.PINTEREST_APP_SECRET ?? '';

/** Reddit OAuth — platform-level app credentials */
export const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID ?? '';
export const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET ?? '';

/**
 * Validates that all critical environment variables are present.
 * Called on server startup. Throws descriptive error if any are missing.
 * @throws Error with list of missing variables
 */
export function validateEnv(): void {
  const requiredVars: Record<string, string> = {
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY,
    REDIS_URL,
    ENCRYPTION_KEY,
  };

  const missing = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Please set them in your Coolify/Railway environment or .env.local file.'
    );
  }
}