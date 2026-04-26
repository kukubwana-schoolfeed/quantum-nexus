/**
 * Job: Inspiration Analysis
 * Worker: 1 — Content Generation
 *
 * Routes to Gemini 2.5 Pro (video) or Sonnet 4.6 vision (image/PDF)
 * for AI Bubble inspiration analysis. Parses structured content plan
 * from AI response.
 */

import { Job } from 'bullmq';
import { generateContent } from '../../../lib/integrations/ai/vertex-claude';
import { analyzeVideo, generateText } from '../../../lib/integrations/ai/vertex-gemini';
import { InspirationAnalysisPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(1, 'content-generation');

/** Prompt suffix requesting structured JSON content plan from AI. */
const CONTENT_PLAN_INSTRUCTION = `\n\nAfter your analysis, include a content plan as a JSON block in this exact format:
\`\`\`json
{
  "posts": <number of recommended posts>,
  "formats": [<list of format types like "carousel", "reel", "story", "single-image">],
  "suggested_hooks": [<list of specific hook strategies>],
  "estimated_engagement": <"low" | "medium" | "high">
}
\`\`\``;

/** Parse structured content plan JSON from AI response text. */
function parseContentPlan(text: string): { posts: number; formats: string[]; suggested_hooks: string[]; estimated_engagement: string } {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\`\`\`/);
    if (!jsonMatch) {
      return { posts: 3, formats: ['carousel', 'reel'], suggested_hooks: [], estimated_engagement: 'medium' };
    }
    const parsed = JSON.parse(jsonMatch[1].trim());
    return {
      posts: typeof parsed.posts === 'number' ? parsed.posts : 3,
      formats: Array.isArray(parsed.formats) ? parsed.formats : ['carousel', 'reel'],
      suggested_hooks: Array.isArray(parsed.suggested_hooks) ? parsed.suggested_hooks : [],
      estimated_engagement: parsed.estimated_engagement ?? 'medium',
    };
  } catch {
    return { posts: 3, formats: ['carousel', 'reel'], suggested_hooks: [], estimated_engagement: 'medium' };
  }
}

export async function processInspirationAnalysis(job: Job<InspirationAnalysisPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, file_url, file_type } = job.data;

  log.jobStart('inspiration-analysis', job.id, tenant_id, [
    `Analyse inspiration ${file_type} from ${file_url}`,
    `Route to ${file_type === 'video' ? 'Gemini 2.5 Pro' : 'Sonnet 4.6 vision'}`,
  ], { file_type });

  try {
    let analysisText: string;

    if (file_type === 'video') {
      const response = await analyzeVideo({
        videoUrl: file_url,
        prompt: `Analyse this video for content style, format structure, audience hooks, and engagement signals. Provide specific, actionable recommendations.${CONTENT_PLAN_INSTRUCTION}`,
        tenantId: tenant_id,
      });
      analysisText = response.analysis;
    } else {
      const response = await generateContent({
        prompt: `Analyse this ${file_type} at ${file_url} for visual style, composition, content strategy, and engagement potential. Provide specific, actionable recommendations.${CONTENT_PLAN_INSTRUCTION}`,
        systemPrompt: 'You are an expert content strategist. Analyse the provided inspiration material and generate an actionable content plan with specific, creative hooks tailored to the content style you observe.',
        model: 'claude-sonnet-4-6',
        maxTokens: 2048,
        temperature: 0.7,
        tenantId: tenant_id,
      });
      analysisText = response.content;
    }

    const contentPlan = parseContentPlan(analysisText);

    const result = {
      analysis_id: `ins-${Date.now().toString(36)}`,
      tenant_id,
      file_url,
      file_type,
      ai_model: file_type === 'video' ? 'Gemini 2.5 Pro' : 'Claude Sonnet 4.6 (vision)',
      summary: analysisText.substring(0, 200),
      full_analysis: analysisText,
      content_plan: contentPlan,
      analysed_at: new Date().toISOString(),
    };

    const duration = Date.now() - start;
    log.jobComplete('inspiration-analysis', job.id, tenant_id, duration, `Analysis complete via ${result.ai_model}`);

    return { success: true, data: result, tenant_id, job_type: 'inspiration-analysis', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('inspiration-analysis', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'inspiration-analysis', timestamp: new Date().toISOString() };
  }
}
