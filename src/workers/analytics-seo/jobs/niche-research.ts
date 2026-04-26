/**
 * Job: Niche Research
 * Worker: 4 — Analytics and SEO
 */

import { Job } from 'bullmq';
import { generateContent } from '../../../lib/integrations/ai/vertex-claude';
import { getRisingQueries } from '../../../lib/integrations/seo/google-trends';
import { NicheResearchPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processNicheResearch(job: Job<NicheResearchPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, niche, location } = job.data;

  log.jobStart('niche-research', job.id, tenant_id, [`Research niche: "${niche}" in ${location}`], { niche, location });

  try {
    // Get trend data from Google Trends
    const trends = await getRisingQueries({ niche, location: parseInt(location, 10) || undefined, tenantId: tenant_id });

    // Use Claude for deep analysis
    const response = await generateContent({
      prompt: `Perform niche research for "${niche}" in ${location}. Identify: top 3 trends, top 2 competitors, and top 2 keyword opportunities with search volume and difficulty estimates. Return structured JSON.`,
      systemPrompt: 'You are a niche research specialist. Provide actionable, data-driven insights for business strategy.',
      model: 'claude-sonnet-4-6',
      maxTokens: 2048,
      temperature: 0.5,
      tenantId: tenant_id,
    });

    const result = { tenant_id, niche, location, ai_model: 'Claude Sonnet 4.6 + Google Trends', analysis: response.content, trend_data: trends, researched_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('niche-research', job.id, tenant_id, duration, `Niche research complete`);
    return { success: true, data: result, tenant_id, job_type: 'niche-research', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('niche-research', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'niche-research', timestamp: new Date().toISOString() };
  }
}
