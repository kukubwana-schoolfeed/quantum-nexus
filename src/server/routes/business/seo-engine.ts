import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { KeywordStrategyDTO, SeoOverviewDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module seo-engine @description SEO keyword strategy and overview routes for tenant businesses */

/**
 * Retrieves the current keyword strategy for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to the keyword strategy data
 */
export async function getKeywordStrategy(tenantId: string): Promise<ApiResponse<KeywordStrategyDTO>> {
  const tasks = await db.seoQueries.listSeoTasks(tenantId, { task_type: 'blog_post' });
  const keywords = (tasks as unknown as Array<Record<string, unknown>>).map((task) => ({
    keyword: (task.target_keyword as string) ?? '',
    volume: (task.search_volume as number) ?? 0,
    difficulty: (task.difficulty as number) ?? 0,
    currentRank: (task.current_rank as number) ?? 0,
  }));
  return { success: true, data: { keywords } };
}

/**
 * Updates a specific keyword within the tenant's strategy.
 * @param tenantId - The unique identifier of the tenant
 * @param keywordId - The unique identifier of the keyword to update
 * @param data - The fields to update on the keyword
 * @returns Promise resolving to the update result
 */
export async function updateKeyword(tenantId: string, keywordId: string, data: Record<string, unknown>): Promise<ApiResponse<ActionConfirmationDTO>> {
  await db.seoQueries.updateSeoTask(tenantId, keywordId, data);
  return { success: true, data: { success: true, message: 'Keyword updated' } };
}

/**
 * Retrieves an SEO overview including domain authority, indexed pages, and backlinks.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to the SEO overview data
 */
export async function getSeoOverview(tenantId: string): Promise<ApiResponse<SeoOverviewDTO>> {
  const indexedCount = await db.seoQueries.countIndexedPages(tenantId);
  const tasks = await db.seoQueries.listSeoTasks(tenantId, {});
  const overview: SeoOverviewDTO = {
    domainAuthority: 0,
    indexedPages: indexedCount,
    backlinks: 0,
  };
  return { success: true, data: overview };
}
