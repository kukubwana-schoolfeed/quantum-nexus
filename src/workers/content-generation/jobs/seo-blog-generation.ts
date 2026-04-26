/**
 * Job: SEO Blog Generation
 * Worker: 1 — Content Generation
 *
 * Generates SEO-optimised blog posts via Claude Sonnet 4.6 with keyword
 * and trend injection. Internal linker adds links to related existing posts.
 * Parses structured front-matter from AI response for title and meta description.
 */

import { Job } from 'bullmq';
import { generateContent } from '../../../lib/integrations/ai/vertex-claude';
import { SeoBlogGenerationPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(1, 'content-generation');

/** Extract title and meta description from structured front-matter block. */
function parseFrontMatter(content: string, keyword: string): { title: string; metaDescription: string } {
  const fmMatch = content.match(/---\s*\n([\s\S]*?)\n---/);
  let title = '';
  let metaDescription = '';

  if (fmMatch) {
    const fm = fmMatch[1];
    const titleMatch = fm.match(/^title:\s*(.+)$/m);
    const metaMatch = fm.match(/^meta_description:\s*(.+)$/m);
    if (titleMatch) title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
    if (metaMatch) metaDescription = metaMatch[1].trim().replace(/^["']|["']$/g, '');
  }

  // Fallback: extract from first heading or first line
  if (!title) {
    const headingMatch = content.match(/^#+\s+(.+)$/m);
    title = headingMatch?.[1]?.trim() ?? `Guide to ${keyword}`;
  }
  if (!metaDescription) {
    metaDescription = `Everything you need to know about ${keyword}. Expert tips, actionable strategies, and the latest insights.`;
  }

  return { title, metaDescription };
}

export async function processSeoBlogGeneration(job: Job<SeoBlogGenerationPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id, keyword, niche_profile_id } = job.data;

  log.jobStart('seo-blog-generation', job.id, tenant_id, [
    `Generate SEO blog targeting keyword: "${keyword}"`,
    `Niche Profile: ${niche_profile_id}`,
  ], { keyword, niche_profile_id });

  try {
    const response = await generateContent({
      prompt: `Write a comprehensive, SEO-optimised blog post targeting the keyword "${keyword}". Start with YAML front-matter in this exact format:\n---\ntitle: "Your SEO Title With Keyword"\nmeta_description: "Compelling meta description under 160 chars with keyword"\n---\n\nThen write the full blog post. Include: an engaging H1 title with the keyword, naturally distributed keyword usage, internal link placeholders [INTERNAL_LINK:related-topic], and a compelling conclusion with CTA. Minimum 1200 words.`,
      systemPrompt: `You are an SEO content specialist. Write blog posts that rank. Follow best practices: keyword in title, H1, first paragraph, and naturally throughout. Use short paragraphs, bullet points, and headers. Include schema-friendly structure. Never keyword stuff. Always start with YAML front-matter containing title and meta_description.`,
      model: 'claude-sonnet-4-6',
      maxTokens: 4096,
      temperature: 0.7,
      tenantId: tenant_id,
    });

    const { title, metaDescription } = parseFrontMatter(response.content, keyword);
    const internalLinkMatches = response.content.match(/\[INTERNAL_LINK:(.*?)\]/g) ?? [];
    const internalLinks = internalLinkMatches.map(m => m.replace('[INTERNAL_LINK:', '').replace(']', ''));

    const result = {
      id: `seo-${Date.now().toString(36)}`,
      tenant_id,
      keyword,
      niche_profile_id,
      title,
      body: response.content,
      word_count: response.content.split(/\s+/).length,
      internal_links: internalLinks,
      meta_description: metaDescription,
      status: 'draft',
      token_usage: response.usage,
      generated_at: new Date().toISOString(),
    };

    const duration = Date.now() - start;
    log.jobComplete('seo-blog-generation', job.id, tenant_id, duration, `Blog generated (${result.word_count} words, ${internalLinks.length} internal links)`);

    return { success: true, data: result, tenant_id, job_type: 'seo-blog-generation', timestamp: new Date().toISOString() };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('seo-blog-generation', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'seo-blog-generation', timestamp: new Date().toISOString() };
  }
}
