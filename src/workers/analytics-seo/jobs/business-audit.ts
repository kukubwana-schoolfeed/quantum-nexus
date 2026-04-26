/**
 * Job: Business Audit
 * Worker: 4 — Analytics and SEO
 */

import { Job } from 'bullmq';
import { generateContent } from '../../../lib/integrations/ai/vertex-claude';
import { BusinessAuditPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

export async function processBusinessAudit(job: Job<BusinessAuditPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, audit_type } = job.data;

  log.jobStart('business-audit', job.id, tenant_id, [`Run ${audit_type} audit`], { audit_type });

  try {
    const response = await generateContent({
      prompt: `Perform a ${audit_type} business audit. Evaluate: SEO presence, social media activity, review generation, backlink profile, Google Business Profile completeness, content frequency. Score overall 0-100. List gaps and strengths. Return structured JSON: { "score": number, "gaps": string[], "strengths": string[], "recommendations": string[] }`,
      systemPrompt: 'You are a business audit specialist. Provide objective, data-driven assessments with actionable recommendations.',
      model: 'claude-sonnet-4-6',
      maxTokens: 2048,
      temperature: 0.4,
      tenantId: tenant_id,
    });

    const result = { tenant_id, audit_id: `aud-${Date.now().toString(36)}`, audit_type, analysis: response.content, audited_at: new Date().toISOString() };
    const duration = Date.now() - start;
    log.jobComplete('business-audit', job.id, tenant_id, duration, `Audit complete`);
    return { success: true, data: result, tenant_id, job_type: 'business-audit', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('business-audit', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'business-audit', timestamp: new Date().toISOString() };
  }
}
