/**
 * Job: Algorithm Scoring
 * Worker: 1 — Content Generation
 *
 * Scores content against target platform algorithm criteria using Claude.
 * PLACEHOLDER: Full algorithm scoring engine in Phase 4.
 * Phase 3: Uses Claude to evaluate content against scoring rubric.
 */

import { Job } from 'bullmq';
import { generateContent } from '../../../lib/integrations/ai/vertex-claude';
import { AlgorithmScoringPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(1, 'content-generation');

const PLATFORM_RUBRICS: Record<string, { threshold: number; criteria: string }> = {
  tiktok: { threshold: 70, criteria: 'Hook strength (0-25), completion likelihood (0-25), caption curiosity gap (0-15), trending sound/format alignment (0-15), rewatch likelihood (0-20)' },
  youtube: { threshold: 65, criteria: 'Thumbnail curiosity gap (0-20), title keyword placement (0-20), first 30s delivery (0-20), chapters defined (0-15), description keyword density (0-25)' },
  instagram: { threshold: 70, criteria: 'Save-worthy element (0-30), comment trigger in caption (0-25), first 3 caption lines strength (0-25), visual quality (0-20)' },
  facebook: { threshold: 60, criteria: 'Emotional response trigger (0-30), discussion prompt (0-25), subtitle presence (0-20), sharing likelihood (0-25)' },
  linkedin: { threshold: 65, criteria: 'Professional value delivery (0-30), personal insight/story (0-25), clear call to action (0-20), engagement hook in opening line (0-25)' },
};

export async function processAlgorithmScoring(job: Job<AlgorithmScoringPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, content_id, target_platform, content_text } = job.data;

  const rubric = PLATFORM_RUBRICS[target_platform] ?? PLATFORM_RUBRICS.instagram;
  log.jobStart('algorithm-scoring', job.id, tenant_id, [
    `Score content ${content_id} against ${target_platform} algorithm (threshold: ${rubric.threshold})`,
    `Criteria: ${rubric.criteria}`,
  ], { content_id, target_platform });

  try {
    const prompt = `Evaluate this ${target_platform} content and score each criterion. Return JSON only: {"scores": {"criterion_name": score}, "total": number, "passed": boolean}\n\nContent:\n${content_text}`;
    const systemPrompt = `You are a ${target_platform} algorithm scoring engine. Score the content against these criteria: ${rubric.criteria}. Threshold to pass: ${rubric.threshold}/100. Return only valid JSON.`;

    const response = await generateContent({
      prompt,
      systemPrompt,
      model: 'claude-haiku-4-5',
      maxTokens: 512,
      temperature: 0.3,
      tenantId: tenant_id,
    });

    let parsed: { scores: Record<string, number>; total: number; passed: boolean };
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON object found in response');
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      log.warn('algorithm-scoring JSON parse failed — using conservative fallback', {
        job_name: 'algorithm-scoring',
        tenant_id,
        payload_summary: { raw_response_preview: response.content.substring(0, 200) },
      });
      const fallbackScore = Math.floor(rubric.threshold * 0.7);
      parsed = { scores: { fallback: fallbackScore }, total: fallbackScore, passed: false };
    }

    const result = {
      tenant_id,
      content_id,
      target_platform,
      score: parsed.total,
      threshold: rubric.threshold,
      passed: parsed.passed,
      breakdown: parsed.scores,
      scored_at: new Date().toISOString(),
    };

    const duration = Date.now() - start;
    log.jobComplete('algorithm-scoring', job.id, tenant_id, duration, `Score: ${result.score}/${result.threshold} — ${result.passed ? 'PASSED' : 'FAILED'}`);

    return { success: true, data: result, tenant_id, job_type: 'algorithm-scoring', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('algorithm-scoring', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'algorithm-scoring', timestamp: new Date().toISOString() };
  }
}
