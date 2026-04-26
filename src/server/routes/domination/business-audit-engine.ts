import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { BusinessAuditDTO } from '@/lib/api/schema';

/** @module business-audit-engine @description Business audit lifecycle routes including initial and monthly refresh audits */

/**
 * Retrieves all audits for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to the list of business audits
 */
export async function getAudits(tenantId: string): Promise<ApiResponse<BusinessAuditDTO[]>> {
  const result = await db.dominationQueries.listBusinessAudits(tenantId, {});
  return { success: true, data: result };
}

/**
 * Retrieves a single audit by its identifier.
 * @param tenantId - The unique identifier of the tenant
 * @param auditId - The unique identifier of the audit
 * @returns Promise resolving to the audit data or null if not found
 */
export async function getAudit(tenantId: string, auditId: string): Promise<ApiResponse<BusinessAuditDTO | null>> {
  const supabase = db.getSupabaseAdmin();
  const { data } = await supabase
    .from('business_audits')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', auditId)
    .single();

  if (!data) {
    return { success: true, data: null };
  }

  const row = data as db.BusinessAuditRow;
  const audit: BusinessAuditDTO = {
    id: row.id,
    auditType: row.audit_type,
    domainAuthority: row.domain_authority ?? 0,
    totalIndexedPages: row.total_indexed_pages ?? 0,
    backlinkCount: row.backlink_count ?? 0,
    gscImpressions90d: row.gsc_impressions_90d ?? 0,
    gscClicks90d: row.gsc_clicks_90d ?? 0,
    gbpCompleteness: row.gbp_completeness ?? 0,
    reviewCount: row.review_count ?? 0,
    averageRating: row.average_rating ?? 0,
    socialPresence: row.social_presence,
    competitorData: row.competitor_data,
    recommendedPriority: row.recommended_priority ?? [],
    summary: row.summary ?? '',
    createdAt: row.created_at,
  };

  return { success: true, data: audit };
}

/**
 * Runs an initial audit for a tenant, producing baseline metrics.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to the newly created initial audit
 */
export async function runInitialAudit(tenantId: string): Promise<ApiResponse<BusinessAuditDTO>> {
  const row = await db.dominationQueries.createBusinessAudit(tenantId, {
    audit_type: 'initial',
    domain_authority: 0,
    total_indexed_pages: 0,
    backlink_count: 0,
    gsc_impressions_90d: 0,
    gsc_clicks_90d: 0,
    gbp_completeness: 0,
    review_count: 0,
    average_rating: 0,
    social_presence: {},
    competitor_data: [],
    recommended_priority: [],
    summary: 'Initial audit created — awaiting DataForSEO integration',
  });

  const audit: BusinessAuditDTO = {
    id: row.id,
    auditType: row.audit_type,
    domainAuthority: row.domain_authority ?? 0,
    totalIndexedPages: row.total_indexed_pages ?? 0,
    backlinkCount: row.backlink_count ?? 0,
    gscImpressions90d: row.gsc_impressions_90d ?? 0,
    gscClicks90d: row.gsc_clicks_90d ?? 0,
    gbpCompleteness: row.gbp_completeness ?? 0,
    reviewCount: row.review_count ?? 0,
    averageRating: row.average_rating ?? 0,
    socialPresence: row.social_presence,
    competitorData: row.competitor_data,
    recommendedPriority: row.recommended_priority ?? [],
    summary: row.summary ?? '',
    createdAt: row.created_at,
  };

  return { success: true, data: audit };
}

/**
 * Runs a monthly refresh audit for a tenant, updating existing metrics.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to the refreshed audit data
 */
export async function runMonthlyRefresh(tenantId: string): Promise<ApiResponse<BusinessAuditDTO>> {
  const row = await db.dominationQueries.createBusinessAudit(tenantId, {
    audit_type: 'monthly_refresh',
    domain_authority: 0,
    total_indexed_pages: 0,
    backlink_count: 0,
    gsc_impressions_90d: 0,
    gsc_clicks_90d: 0,
    gbp_completeness: 0,
    review_count: 0,
    average_rating: 0,
    social_presence: {},
    competitor_data: [],
    recommended_priority: [],
    summary: 'Monthly refresh audit created — awaiting DataForSEO integration',
  });

  const audit: BusinessAuditDTO = {
    id: row.id,
    auditType: row.audit_type,
    domainAuthority: row.domain_authority ?? 0,
    totalIndexedPages: row.total_indexed_pages ?? 0,
    backlinkCount: row.backlink_count ?? 0,
    gscImpressions90d: row.gsc_impressions_90d ?? 0,
    gscClicks90d: row.gsc_clicks_90d ?? 0,
    gbpCompleteness: row.gbp_completeness ?? 0,
    reviewCount: row.review_count ?? 0,
    averageRating: row.average_rating ?? 0,
    socialPresence: row.social_presence,
    competitorData: row.competitor_data,
    recommendedPriority: row.recommended_priority ?? [],
    summary: row.summary ?? '',
    createdAt: row.created_at,
  };

  return { success: true, data: audit };
}
