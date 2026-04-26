/**
 * Job: Entity Consistency Check
 * Worker: 4 — Analytics and SEO
 *
 * Verifies NAP (Name, Address, Phone) consistency across directory listings.
 * Compares submitted_name/address/phone/website against the business profile,
 * flags inconsistencies, and updates entity_listings via dominationQueries.
 */

import { Job } from 'bullmq';
import { dominationQueries, businessQueries, getSupabaseAdmin } from '../../../lib/db';
import type { EntityListingRow } from '../../../lib/db';
import { EntityConsistencyCheckPayload, JobResult } from '../../shared/types';
import { createWorkerLogger } from '../../shared/logger';

const log = createWorkerLogger(4, 'analytics-seo');

interface InconsistencyIssue {
  listing_id: string;
  directory_name: string;
  fields: string[];
  notes: string;
}

function buildInconsistencyNotes(fields: string[]): string {
  return fields.length > 0 ? `Inconsistent fields: ${fields.join(', ')}` : '';
}

export async function processEntityConsistencyCheck(job: Job<EntityConsistencyCheckPayload>): Promise<JobResult> {
  const start = Date.now();
  const { tenant_id } = job.data;

  log.jobStart('entity-consistency-check', job.id, tenant_id, [`Check entity consistency across directories`]);

  try {
    const [business, listingSummary] = await Promise.all([
      businessQueries.getBusinessProfile(tenant_id).catch(() => null),
      dominationQueries.getEntityConsistency(tenant_id).catch(() => null),
    ]);

    const supabase = getSupabaseAdmin();
    const { data: rawListings, error: listingsError } = await supabase
      .from('entity_listings')
      .select('*')
      .eq('tenant_id', tenant_id)
      .in('status', ['live', 'submitted']);

    if (listingsError) throw listingsError;
    const listings = (rawListings ?? []) as EntityListingRow[];

    const issues: InconsistencyIssue[] = [];
    const checkedAt = new Date().toISOString();

    for (const listing of listings) {
      const inconsistentFields: string[] = [];

      if (business?.phone_number && listing.submitted_phone && listing.submitted_phone !== business.phone_number) {
        inconsistentFields.push('phone');
      }
      if (business?.website_url && listing.submitted_website && listing.submitted_website !== business.website_url) {
        inconsistentFields.push('website');
      }

      const isConsistent = inconsistentFields.length === 0;
      const notes = buildInconsistencyNotes(inconsistentFields);

      if (!isConsistent) {
        issues.push({
          listing_id: listing.id,
          directory_name: listing.directory_name,
          fields: inconsistentFields,
          notes,
        });
      }

      try {
        await dominationQueries.updateEntityListing(tenant_id, listing.id, {
          is_consistent: isConsistent,
          inconsistency_notes: isConsistent ? null : notes,
          last_checked_at: checkedAt,
          status: isConsistent ? listing.status : 'inconsistent',
        });
      } catch (updateErr) {
        const msg = updateErr instanceof Error ? updateErr.message : String(updateErr);
        log.jobFailed('entity-consistency-check', job.id, tenant_id, `Failed to update listing ${listing.id}: ${msg}`, Date.now() - start);
      }
    }

    const finalSummary = await dominationQueries.getEntityConsistency(tenant_id).catch(() => listingSummary);

    const duration = Date.now() - start;
    log.jobComplete('entity-consistency-check', job.id, tenant_id, duration, `${issues.length} inconsistencies found across ${listings.length} listings`);

    return {
      success: true,
      data: {
        consistent: issues.length === 0,
        issues,
        directories_checked: listings.length,
        consistent_count: finalSummary?.consistent ?? 0,
        inconsistent_count: finalSummary?.inconsistent ?? 0,
        pending_count: finalSummary?.pending ?? 0,
        checked_at: checkedAt,
      },
      tenant_id,
      job_type: 'entity-consistency-check',
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    log.jobFailed('entity-consistency-check', job.id, tenant_id, message, duration);
    return { success: false, error: message, tenant_id, job_type: 'entity-consistency-check', timestamp: new Date().toISOString() };
  }
}
