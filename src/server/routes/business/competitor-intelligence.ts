import * as db from '@/lib/db';
import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { CompetitorDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module competitor-intelligence @description Competitor intelligence — monitor competitor domains, authority scores, and refresh data. */

/**
 * Retrieve all tracked competitors for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @returns A list of competitors with domain authority and backlink data.
 */
export async function getCompetitors(tenantId: string): Promise<ApiResponse<CompetitorDTO[]>> {
  const audit = await db.dominationQueries.getLatestAudit(tenantId);
  if (!audit) return { success: true, data: [] };
  const competitors = (audit.competitorData ?? []) as Array<Record<string, unknown>>;
  const data: CompetitorDTO[] = competitors!.map(c => ({
    domain: (c.domain as string) ?? '',
    domainAuthority: (c.domainAuthority as number) ?? (c.domain_authority as number) ?? 0,
    indexedPages: (c.indexedPages as number) ?? (c.indexed_pages as number) ?? 0,
    backlinks: (c.backlinks as number) ?? (c.backlink_count as number) ?? 0,
  }));
  return { success: true, data };
}

/**
 * Retrieve intelligence data for a specific competitor domain.
 * @param tenantId - The unique identifier of the tenant.
 * @param domain - The competitor's domain name.
 * @returns The competitor details, or null if not tracked.
 */
export async function getCompetitor(tenantId: string, domain: string): Promise<ApiResponse<CompetitorDTO | null>> {
  const competitors = (await getCompetitors(tenantId)).data;
  const found = competitors!.find(c => c.domain === domain);
  return { success: true, data: found ?? null };
}

/**
 * Trigger a refresh of competitor intelligence data for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @returns The refresh initiation confirmation.
 */
export async function refreshData(tenantId: string): Promise<ApiResponse<ActionConfirmationDTO>> {
  throw internalError('INTEGRATION_PENDING');
}

