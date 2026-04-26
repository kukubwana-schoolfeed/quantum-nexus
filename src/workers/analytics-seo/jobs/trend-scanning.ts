/**
 * Job: Trend Scanning
 * Worker: 4 — Analytics and SEO
 */

import { Job } from 'bullmq';
import { getRisingQueries } from '../../../lib/integrations/seo/google-trends';
import { generateText } from '../../../lib/integrations/ai/vertex-gemini';
import { TrendScanningPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processTrendScanning(job: Job<TrendScanningPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, niche } = job.data;

  log.jobStart('trend-scanning', job.id, tenant_id, [`Scan trends for "${niche}"`], { niche });

  try {
    const [trendsResponse, geminiResponse] = await Promise.all([
      getRisingQueries({ niche, tenantId: tenant_id }),
      generateText({ prompt: `Identify the top 3 emerging trends in the "${niche}" niche right now. For each trend, provide: name, relevance score (0-100), source. Return JSON array.`, systemPrompt: 'You are a trend scanning engine. Use Gemini 2.0 Flash for fast bulk trend scanning.', tenantId: tenant_id }),
    ]);

    const result = { tenant_id, niche, google_trends_data: trendsResponse, ai_trends: geminiResponse.content, scanned_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('trend-scanning', job.id, tenant_id, duration, `Trend scan complete`);
    return { success: true, data: result, tenant_id, job_type: 'trend-scanning', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('trend-scanning', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'trend-scanning', timestamp: new Date().toISOString() };
  }
}
