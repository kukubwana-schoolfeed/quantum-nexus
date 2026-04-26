/**
 * Job: Daily Report Generation
 * Worker: 4 — Analytics and SEO
 */

import { Job } from 'bullmq';
import { generateContent } from '../../../lib/integrations/ai/vertex-claude';
import { DailyReportGenerationPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processDailyReportGeneration(job: Job<DailyReportGenerationPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, report_date, channels } = job.data;

  log.jobStart('daily-report-generation', job.id, tenant_id, [`Generate report for ${report_date}`], { report_date, channels });

  try {
    const response = await generateContent({
      prompt: `Generate a concise daily performance report for ${report_date}. Include: posts published count, engagement rate, SEO progress summary, revenue estimate, new customer count, and any alerts or issues.`,
      systemPrompt: 'You are a business reporting assistant. Generate clear, concise daily reports with key metrics and actionable insights.',
      model: 'claude-haiku-4-5',
      maxTokens: 1024,
      temperature: 0.3,
      tenantId: tenant_id,
    });

    const result = { tenant_id, report_date, channels, report_content: response.content, generated_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('daily-report-generation', job.id, tenant_id, duration, `Report generated`);
    return { success: true, data: result, tenant_id, job_type: 'daily-report-generation', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('daily-report-generation', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'daily-report-generation', timestamp: new Date().toISOString() };
  }
}
