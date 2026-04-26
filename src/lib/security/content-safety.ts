/**
 * Quantum Nexus — Content Safety Checker
 * Terminal 3 — Security, Auth, Middleware
 *
 * Mandatory AI safety check on every post before publishing (RULE S-3).
 * Cannot be disabled by any business, reseller, or admin setting (RULE S-3).
 * Cannot be skipped for any content type (RULE S-3).
 * If the safety check service is unavailable, the post is HELD — not published (RULE S-3).
 * Fail safe always means hold, never publish.
 *
 * Uses Claude Haiku 4.5 for speed and cost efficiency via the AI integration layer
 * at /src/lib/integrations/ai/vertex-claude.ts (RULE AI-1: switchable Vertex/Anthropic).
 * Checks: harmful content, false claims, legally sensitive content, platform policy violations.
 *
 * PHASE 3: Real Claude Haiku classification via the AI integration layer.
 * Safety check result is never exposed to the client (RULE G-3).
 *
 * @module security/content-safety
 */

import { generateContent } from '../integrations/ai/vertex-claude';
import { getSupabaseAdminClient } from '../auth/supabase-auth';

/** Result of a content safety check */
export interface ContentSafetyResult {
  /** Whether the content passed the safety check */
  passed: boolean;
  /** Safety classification categories checked */
  checks: ContentSafetyCheck[];
  /** Reason if the content failed (never exposed to client — logged internally only) */
  reason?: string;
}

/** Individual safety check within a content safety result */
export interface ContentSafetyCheck {
  /** The category of safety check */
  category: ContentSafetyCategory;
  /** Whether this specific check passed */
  passed: boolean;
  /** Confidence score 0-1 for the check result */
  confidence: number;
}

/** Categories of content safety checks performed */
export type ContentSafetyCategory =
  | 'harmful_content'
  | 'false_claims'
  | 'legally_sensitive'
  | 'platform_policy'
  | 'hate_speech'
  | 'misinformation'
  | 'spam_indicator';

/** Content types that must pass safety checks before publishing */
export type ContentContentType =
  | 'social_post'
  | 'blog_post'
  | 'comment_reply'
  | 'dm_reply'
  | 'gbp_post'
  | 'qa_answer'
  | 'ad_copy'
  | 'video_script';

/**
 * System prompt for the Claude Haiku content safety classifier.
 * Instructs the model to return a structured JSON safety assessment.
 * This prompt is fixed — it cannot be modified by any business setting (RULE S-3).
 *
 * @module security/content-safety
 */
const SAFETY_SYSTEM_PROMPT = `You are a content safety classifier for a business marketing platform. You must classify the following content across these safety categories:

1. harmful_content - Content that promotes violence, self-harm, or dangerous activities
2. false_claims - Content making unsubstantiated medical, financial, or legal claims
3. legally_sensitive - Content that could expose the business to legal liability (defamation, copyright violation, regulatory non-compliance)
4. platform_policy - Content that violates the target platform's terms of service
5. hate_speech - Content that discriminates against or attacks protected groups
6. misinformation - Content that spreads false or misleading information
7. spam_indicator - Content that appears as spam, clickbait, or deceptive marketing

Respond with ONLY a JSON object in this exact format:
{
  "checks": [
    {"category": "harmful_content", "passed": true/false, "confidence": 0.0-1.0},
    {"category": "false_claims", "passed": true/false, "confidence": 0.0-1.0},
    {"category": "legally_sensitive", "passed": true/false, "confidence": 0.0-1.0},
    {"category": "platform_policy", "passed": true/false, "confidence": 0.0-1.0},
    {"category": "hate_speech", "passed": true/false, "confidence": 0.0-1.0},
    {"category": "misinformation", "passed": true/false, "confidence": 0.0-1.0},
    {"category": "spam_indicator", "passed": true/false, "confidence": 0.0-1.0}
  ],
  "overall_passed": true/false,
  "reason": "brief reason if failed, empty string if passed"
}

Be strict but fair. Business marketing content that is promotional but truthful should pass. Only flag genuinely problematic content.`;

/**
 * Performs a content safety check on content before publishing (RULE S-3).
 * This is the FIRST gate in the content pipeline (RULE C-1).
 * Order: safety check -> algorithm scoring -> approval queue -> scheduling -> publishing.
 *
 * Uses Claude Haiku 4.5 via the AI integration layer for real classification.
 *
 * @param {string} tenantId - The tenant UUID from JWT claims (RULE MT-2)
 * @param {string} content - The content text to check for safety
 * @param {ContentContentType} contentType - The type of content being checked
 * @param {string} targetPlatform - The platform the content will be published to
 * @returns {ContentSafetyResult} Result indicating pass/fail and check details
 * @module security/content-safety
 */
export async function checkContentSafety(
  tenantId: string,
  content: string,
  contentType: ContentContentType,
  targetPlatform: string
): Promise<ContentSafetyResult> {
  try {
    const response = await generateContent({
      prompt: `Content type: ${contentType}\nTarget platform: ${targetPlatform}\n\nContent to check:\n${content}`,
      systemPrompt: SAFETY_SYSTEM_PROMPT,
      model: 'claude-haiku-4-5',
      maxTokens: 1024,
      temperature: 0,
      tenantId,
    });

    // Parse the structured JSON response from Claude Haiku
    const parsed = parseSafetyResponse(response.content);

    if (!parsed) {
      // If we can't parse the response, fail safe — hold the post (RULE S-3)
      console.error(
        `[ContentSafety] Could not parse AI safety response for tenant ${tenantId}. ` +
        `Holding post as fail-safe.`
      );
      return {
        passed: false,
        checks: defaultFailedChecks('AI response unparseable'),
        reason: 'Safety classification failed — post held as fail-safe',
      };
    }

    // Log internally for audit trail — never expose reason to client (RULE G-3)
    if (!parsed.passed) {
      const reasons = parsed.checks
        .filter((c) => !c.passed)
        .map((c) => c.category)
        .join(', ');
      console.error(
        `[ContentSafety] Content FAILED for tenant ${tenantId}. ` +
        `Type: ${contentType}, Platform: ${targetPlatform}. ` +
        `Failed categories: ${reasons}`
      );
    }

    return parsed;
  } catch (err) {
    // AI call failed — fail safe: hold the post (RULE S-3)
    console.error(
      `[ContentSafety] AI safety check failed for tenant ${tenantId}:`,
      err instanceof Error ? err.message : err
    );
    return {
      passed: false,
      checks: defaultFailedChecks('AI service error'),
      reason: 'Safety check service error — post held as fail-safe',
    };
  }
}

/**
 * Checks whether the content safety service is available.
 * If unavailable, posts must be HELD — never published (RULE S-3).
 * Fail safe always means hold, never publish.
 *
 * Makes a lightweight Claude Haiku call to verify the AI endpoint is reachable.
 *
 * @returns {boolean} True if the safety check service (Claude Haiku) is reachable
 * @module security/content-safety
 */
export async function isSafetyServiceAvailable(): Promise<boolean> {
  try {
    const response = await generateContent({
      prompt: 'Reply with the word OK',
      systemPrompt: 'Reply with only the word OK.',
      model: 'claude-haiku-4-5',
      maxTokens: 10,
      temperature: 0,
      tenantId: 'system-health-check',
    });
    return response.content.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Marks a post as held because it failed the content safety check.
 * Held posts are never deleted and can be reviewed by the business owner (RULE C-3).
 * Updates the content_posts table in Supabase with status='held'.
 *
 * @param {string} tenantId - The tenant UUID from JWT claims
 * @param {string} postId - The content post ID to hold
 * @param {string} reason - The safety check failure reason (logged internally only)
 * @returns {boolean} True if the post was successfully marked as held
 * @module security/content-safety
 */
export async function holdPostForSafetyFailure(
  tenantId: string,
  postId: string,
  reason: string
): Promise<boolean> {
  // Log the hold — never expose reason to client (RULE G-3)
  console.error(
    `[ContentSafety] Post HELD for tenant ${tenantId}. Post ID: ${postId}. Reason: ${reason}`
  );

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from('content_posts')
      .update({ status: 'held' })
      .eq('id', postId)
      .eq('tenant_id', tenantId); // RULE MT-1: always filter by tenant_id

    if (error) {
      console.error(
        `[ContentSafety] Failed to hold post ${postId} in Supabase: ${error.message}`
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[ContentSafety] Exception holding post ${postId}:`, err);
    return false;
  }
}

/**
 * Parses the structured JSON response from the Claude Haiku safety classifier.
 * Returns null if the response cannot be parsed.
 *
 * @param {string} responseContent - The raw text response from Claude Haiku
 * @returns {ContentSafetyResult | null} Parsed safety result, or null if unparseable
 * @module security/content-safety
 */
function parseSafetyResponse(responseContent: string): ContentSafetyResult | null {
  try {
    // Extract JSON from the response (may be wrapped in markdown code blocks)
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed.checks)) {
      return null;
    }

    const checks: ContentSafetyCheck[] = parsed.checks.map(
      (check: Record<string, unknown>) => ({
        category: check.category as ContentSafetyCategory,
        passed: Boolean(check.passed),
        confidence: Number(check.confidence) || 0,
      })
    );

    const failedChecks = checks.filter((c) => !c.passed);
    const passed = parsed.overall_passed === true || failedChecks.length === 0;

    return {
      passed,
      checks,
      reason: passed ? undefined : (parsed.reason as string ?? `Failed categories: ${failedChecks.map((c) => c.category).join(', ')}`),
    };
  } catch {
    return null;
  }
}

/**
 * Generates default failed checks for fail-safe scenarios.
 * When the AI service is unavailable or returns unparseable results,
 * we mark all checks as failed to ensure the post is held (RULE S-3).
 *
 * @param {string} reason - The reason for the fail-safe
 * @returns {ContentSafetyCheck[]} All categories marked as failed
 * @module security/content-safety
 */
function defaultFailedChecks(reason: string): ContentSafetyCheck[] {
  const categories: ContentSafetyCategory[] = [
    'harmful_content',
    'false_claims',
    'legally_sensitive',
    'platform_policy',
    'hate_speech',
    'misinformation',
    'spam_indicator',
  ];

  void reason;
  return categories.map((category) => ({
    category,
    passed: false,
    confidence: 0,
  }));
}