import * as db from '@/lib/db';
import { AppError, internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { NicheResearchDTO } from '@/lib/api/schema';

/** @module platform-core/niche-research @description Provides deep research data for a specific niche, including keywords, content formats, tone, platforms, target audience, posting frequency, regulatory flags, SEO clusters, and competitor domains. */

/**
 * Maps a niche_profiles row to a NicheResearchDTO.
 * @param row - A NicheProfileRow from the database
 * @returns A NicheResearchDTO with all research fields populated from the row
 */
function mapNicheResearch(row: db.NicheProfileRow): NicheResearchDTO {
  return {
    nicheName: row.niche_name,
    keywords: row.primary_keywords ?? [],
    contentFormats: row.content_formats ?? [],
    tone: row.tone ?? '',
    platforms: row.platforms ?? [],
    targetAudience: row.target_audience ?? '',
    postingFrequency: row.posting_frequency ?? {},
    regulatoryFlags: row.regulatory_flags ?? [],
    contentRestrictions: row.content_restrictions ?? [],
    seoKeywordClusters: row.seo_keyword_clusters ?? [],
    competitorDomains: row.competitor_domains ?? [],
  };
}

/**
 * Retrieves the cached research data for a specific niche.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @param nicheName - The name of the niche to research
 * @returns ApiResponse wrapping research result containing keywords, content formats, tone, platforms, target audience, posting frequency, regulatory flags, content restrictions, SEO keyword clusters, and competitor domains
 */
export async function getResearch(tenantId: string, nicheName: string): Promise<ApiResponse<NicheResearchDTO>> {
  try {
    const supabase = db.getSupabaseAdmin();
    const { data, error } = await supabase
      .from('niche_profiles')
      .select('*')
      .eq('niche_name', nicheName)
      .single();

    if (error) {
      throw internalError('NICHE_RESEARCH_FETCH_FAILED');
    }

    const row = data as db.NicheProfileRow;
    const research = mapNicheResearch(row);

    return { success: true, data: research };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('NICHE_RESEARCH_FETCH_FAILED');
  }
}

/**
 * Triggers a fresh research run for a niche, regenerating all research data.
 * This is a long-running operation; the returned data reflects the previous
 * cache until the new research completes. Currently returns cached data
 * (actual refresh requires DataForSEO integration).
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @param nicheName - The name of the niche to refresh research for
 * @returns ApiResponse wrapping the research result (currently returns cached data)
 */
export async function refreshResearch(tenantId: string, nicheName: string): Promise<ApiResponse<NicheResearchDTO>> {
  try {
    const supabase = db.getSupabaseAdmin();
    const { data, error } = await supabase
      .from('niche_profiles')
      .select('*')
      .eq('niche_name', nicheName)
      .single();

    if (error) {
      throw internalError('NICHE_RESEARCH_REFRESH_FAILED');
    }

    const row = data as db.NicheProfileRow;
    const research = mapNicheResearch(row);

    return { success: true, data: research };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('NICHE_RESEARCH_REFRESH_FAILED');
  }
}
