import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { CannibalisationReportDTO } from '@/lib/api/schema';

/** @module keyword-cannibalisation-detector @description Keyword cannibalisation detection, scanning, and action resolution routes */

/**
 * Retrieves all keyword cannibalisation reports for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @param params - Optional filter and pagination parameters
 * @returns Promise resolving to the list of cannibalisation reports
 */
export async function getReports(tenantId: string, params?: Record<string, unknown>): Promise<ApiResponse<CannibalisationReportDTO[]>> {
  const result = await db.seoQueries.listCannibalisationReports(tenantId, params);
  return { success: true, data: result };
}

/**
 * Runs a keyword cannibalisation scan for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to the scan results with conflict count and reports
 */
export async function runScan(tenantId: string): Promise<ApiResponse<{ conflictsFound: number; reports: CannibalisationReportDTO[] }>> {
  const supabase = db.getSupabaseAdmin();
  const { data } = await supabase
    .from('content_posts')
    .select('id, target_keyword')
    .eq('tenant_id', tenantId)
    .not('target_keyword', 'is', null);

  const rows = (data ?? []) as Array<{ id: string; target_keyword: string | null }>;

  const keywordGroups: Record<string, string[]> = {};
  for (const row of rows) {
    const kw = row.target_keyword!;
    if (!keywordGroups[kw]) {
      keywordGroups[kw] = [];
    }
    keywordGroups[kw].push(row.id);
  }

  const reports: CannibalisationReportDTO[] = [];
  for (const [keyword, postIds] of Object.entries(keywordGroups)) {
    if (postIds.length < 2) continue;

    const report = await db.seoQueries.createCannibalisationReport(tenantId, {
      conflicting_keyword: keyword,
      strong_post_id: postIds[0],
      weak_post_id: postIds[1],
      strong_post_url: `/posts/${postIds[0]}`,
      weak_post_url: `/posts/${postIds[1]}`,
      recommended_action: 'consolidate',
      status: 'pending',
    });

    reports.push({
      id: report.id,
      conflictingKeyword: report.conflicting_keyword,
      strongPostUrl: report.strong_post_url ?? '',
      weakPostUrl: report.weak_post_url ?? '',
      recommendedAction: report.recommended_action,
      status: report.status,
    });
  }

  return { success: true, data: { conflictsFound: reports.length, reports } };
}

/**
 * Approves a recommended action on a cannibalisation report.
 * @param tenantId - The unique identifier of the tenant
 * @param reportId - The unique identifier of the report to approve
 * @returns Promise resolving to the approval result with success and status
 */
export async function approveAction(tenantId: string, reportId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
  await db.seoQueries.updateCannibalisationReportStatus(tenantId, reportId, 'approved');
  return { success: true, data: { success: true, message: 'Action approved' } };
}

/**
 * Dismisses a recommended action on a cannibalisation report.
 * @param tenantId - The unique identifier of the tenant
 * @param reportId - The unique identifier of the report to dismiss
 * @param reason - The reason for dismissing the action
 * @returns Promise resolving to the dismissal result with success and status
 */
export async function dismissAction(tenantId: string, reportId: string, _reason: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
  await db.seoQueries.updateCannibalisationReportStatus(tenantId, reportId, 'dismissed');
  return { success: true, data: { success: true, message: 'Action dismissed' } };
}
