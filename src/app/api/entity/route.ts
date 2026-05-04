import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { EntityListingDTO, EntityConsistencyDTO } from '@/lib/api/schema';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('entity_listings')
      .select(
        'id, directory_name, directory_url, listing_url, status, is_consistent, submitted_name, submitted_address, submitted_phone'
      )
      .eq('tenant_id', tid);

    if (error) {
      console.error('[Entity] Failed to fetch listings:', error.message);
      return apiResponse({
        listings: [] as EntityListingDTO[],
        consistency: { consistent: 0, inconsistent: 0, pending: 0 } as EntityConsistencyDTO,
      });
    }

    const listings: EntityListingDTO[] = (data ?? []).map((row) => ({
      id: row.id,
      directoryName: row.directory_name,
      directoryUrl: row.directory_url,
      listingUrl: row.listing_url,
      status: row.status,
      isConsistent: row.is_consistent,
      submittedName: row.submitted_name,
      submittedAddress: row.submitted_address,
      submittedPhone: row.submitted_phone,
    }));

    // Compute consistency summary from the listings
    let consistent = 0;
    let inconsistent = 0;
    let pending = 0;
    for (const listing of listings) {
      if (listing.isConsistent === true) {
        consistent++;
      } else if (listing.isConsistent === false) {
        inconsistent++;
      } else {
        pending++;
      }
    }

    const consistency: EntityConsistencyDTO = { consistent, inconsistent, pending };

    return apiResponse({ listings, consistency });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load entity data');
  }
}
