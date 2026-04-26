import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { EntityListingDTO, EntityConsistencyDTO } from '@/lib/api/schema';

/** @module entity-builder @description Entity listing management and NAP consistency checking routes */

/**
 * Retrieves all directory listings for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @param params - Optional filter and pagination parameters
 * @returns Promise resolving to the list of directory listings
 */
export async function getListings(tenantId: string, params?: Record<string, unknown>): Promise<ApiResponse<EntityListingDTO[]>> {
  const result = await db.dominationQueries.listEntityListings(tenantId, params ?? {});
  return { success: true, data: result };
}

/**
 * Retrieves a single directory listing by its identifier.
 * @param tenantId - The unique identifier of the tenant
 * @param listingId - The unique identifier of the listing
 * @returns Promise resolving to the listing data or null if not found
 */
export async function getListing(tenantId: string, listingId: string): Promise<ApiResponse<EntityListingDTO | null>> {
  const supabase = db.getSupabaseAdmin();
  const { data } = await supabase
    .from('entity_listings')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', listingId)
    .single();

  if (!data) {
    return { success: true, data: null };
  }

  const row = data as db.EntityListingRow;
  const listing: EntityListingDTO = {
    id: row.id,
    directoryName: row.directory_name,
    directoryUrl: row.directory_url,
    listingUrl: row.listing_url,
    status: row.status,
    isConsistent: row.is_consistent,
    submittedName: row.submitted_name,
    submittedAddress: row.submitted_address,
    submittedPhone: row.submitted_phone,
  };

  return { success: true, data: listing };
}

/**
 * Submits a new directory listing for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @param data - The listing submission payload
 * @returns Promise resolving to the created entity listing
 */
export async function submitListing(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<EntityListingDTO>> {
  const row = await db.dominationQueries.createEntityListing(tenantId, data as Partial<db.EntityListingRow>);

  const listing: EntityListingDTO = {
    id: row.id,
    directoryName: row.directory_name,
    directoryUrl: row.directory_url,
    listingUrl: row.listing_url,
    status: row.status,
    isConsistent: row.is_consistent,
    submittedName: row.submitted_name,
    submittedAddress: row.submitted_address,
    submittedPhone: row.submitted_phone,
  };

  return { success: true, data: listing };
}

/**
 * Checks NAP (Name, Address, Phone) consistency across all listings for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to the consistency check results
 */
export async function checkConsistency(tenantId: string): Promise<ApiResponse<EntityConsistencyDTO>> {
  const result = await db.dominationQueries.getEntityConsistency(tenantId);
  return { success: true, data: result };
}
