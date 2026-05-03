/**
 * @module business-queries
 * @description Typed Supabase query module for business_profiles and knowledge_base
 * tables. Every tenant-scoped query includes an .eq('tenant_id', tenantId) filter
 * to enforce row-level isolation at the application layer. Uses the service role
 * Supabase client via getSupabaseAdmin().
 */

import { getSupabaseAdmin } from '@/lib/db/client';
import type { BusinessProfileRow, KnowledgeBaseRow } from '@/lib/db/types';
import type { CompletenessScoreDTO, ActionConfirmationDTO, KnowledgeBaseEntryDTO } from '@/lib/api/schema';

// ---------------------------------------------------------------------------
// Business Profile Queries
// ---------------------------------------------------------------------------

/**
 * Fetches the business profile for a given tenant.
 *
 * @param tenantId - The tenant identifier to filter on
 * @returns The full business profile row, or null if not found
 * @throws Error if the Supabase query fails
 */
export async function getBusinessProfile(
  tenantId: string,
): Promise<BusinessProfileRow | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch business profile: ${error.message}`);
  }

  return data;
}

/**
 * Creates or updates the business profile for a given tenant.
 * Performs an upsert on the tenant_id column — if a row already exists it is
 * updated; otherwise a new row is inserted.
 *
 * @param tenantId - The tenant identifier (used as the conflict key)
 * @param data - Partial business profile fields to insert or update
 * @returns The resulting business profile row
 * @throws Error if the Supabase query fails
 */
export async function upsertBusinessProfile(
  tenantId: string,
  data: Partial<BusinessProfileRow>,
): Promise<BusinessProfileRow> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('business_profiles')
    .upsert({ tenant_id: tenantId, ...data }, { onConflict: 'tenant_id' })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert business profile: ${error.message}`);
  }

  return row;
}

// ---------------------------------------------------------------------------
// Completeness Score Queries
// ---------------------------------------------------------------------------

/**
 * Calculates and returns the completeness score for a tenant, including
 * section-level breakdowns and feature unlocks.
 *
 * Section scoring logic:
 * - profile: 60 if a business profile row exists, else 0
 * - api_keys: 20 if the tenant has any encrypted keys, else 0
 * - onboarding: 20 if the tenant has activated_at set, else 0
 *
 * @param tenantId - The tenant identifier
 * @returns A CompletenessScoreDTO with overall score, section breakdown, and unlocks
 * @throws Error if any Supabase query fails
 */
export async function getCompletenessScore(
  tenantId: string,
): Promise<CompletenessScoreDTO> {
  const supabase = getSupabaseAdmin();

  // Fetch tenant row for overall score and unlocks
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('completeness_score, content_generation_unlocked, publishing_unlocked, analytics_unlocked, activated_at')
    .eq('id', tenantId)
    .maybeSingle();

  if (tenantError) {
    throw new Error(`Failed to fetch tenant for completeness score: ${tenantError.message}`);
  }

  if (!tenant) {
    return {
      overall: 0,
      sections: { profile: 0, api_keys: 0, onboarding: 0 },
      unlocks: { content_generation: false, publishing: false, analytics: false },
    };
  }

  // Fetch business profile to determine profile section score
  const { data: profile, error: profileError } = await supabase
    .from('business_profiles')
    .select('id')
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Failed to fetch business profile for completeness score: ${profileError.message}`);
  }

  // Fetch encrypted keys to determine api_keys section score
  const { data: keys, error: keysError } = await supabase
    .from('encrypted_keys')
    .select('id')
    .eq('tenant_id', tenantId)
    .limit(1);

  if (keysError) {
    throw new Error(`Failed to fetch encrypted keys for completeness score: ${keysError.message}`);
  }

  // Calculate section scores
  const profileScore = profile ? 60 : 0;
  const apiKeysScore = keys && keys.length > 0 ? 20 : 0;
  const onboardingScore = tenant.activated_at ? 20 : 0;

  return {
    overall: tenant.completeness_score,
    sections: {
      profile: profileScore,
      api_keys: apiKeysScore,
      onboarding: onboardingScore,
    },
    unlocks: {
      content_generation: tenant.content_generation_unlocked,
      publishing: tenant.publishing_unlocked,
      analytics: tenant.analytics_unlocked,
    },
  };
}

/**
 * Updates the completeness score and feature unlock flags for a tenant.
 *
 * @param tenantId - The tenant identifier
 * @param score - The new overall completeness score
 * @param unlocks - Partial object of unlock flags to update
 * @returns An ActionConfirmationDTO indicating success
 * @throws Error if the Supabase query fails
 */
export async function updateCompletenessScore(
  tenantId: string,
  score: number,
  unlocks: Partial<{
    content_generation_unlocked: boolean;
    publishing_unlocked: boolean;
    analytics_unlocked: boolean;
  }>,
): Promise<ActionConfirmationDTO> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('tenants')
    .update({ completeness_score: score, ...unlocks })
    .eq('id', tenantId);

  if (error) {
    throw new Error(`Failed to update completeness score: ${error.message}`);
  }

  return { success: true, message: 'Completeness score updated.' };
}

// ---------------------------------------------------------------------------
// Knowledge Base Queries
// ---------------------------------------------------------------------------

/**
 * Lists knowledge base entries for a tenant with optional filters.
 *
 * @param tenantId - The tenant identifier
 * @param params - Optional filters (category, is_active)
 * @returns An array of knowledge base rows matching the filters
 * @throws Error if the Supabase query fails
 */
export async function listKnowledgeBase(
  tenantId: string,
  params?: Record<string, unknown>,
): Promise<KnowledgeBaseRow[]> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('knowledge_base')
    .select('*')
    .eq('tenant_id', tenantId);

  if (params?.category !== undefined && params?.category !== null) {
    query = query.eq('category', params.category as string);
  }

  if (params?.is_active !== undefined && params?.is_active !== null) {
    query = query.eq('is_active', params.is_active as boolean);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list knowledge base entries: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Fetches a single knowledge base entry by ID, scoped to the given tenant.
 *
 * @param tenantId - The tenant identifier
 * @param entryId - The knowledge base entry ID
 * @returns The knowledge base row, or null if not found
 * @throws Error if the Supabase query fails
 */
export async function getKnowledgeBaseEntry(
  tenantId: string,
  entryId: string,
): Promise<KnowledgeBaseRow | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', entryId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch knowledge base entry: ${error.message}`);
  }

  return data;
}

/**
 * Creates a new knowledge base entry for a tenant.
 *
 * @param tenantId - The tenant identifier (assigned to the new row)
 * @param data - Partial knowledge base fields to insert
 * @returns The newly created knowledge base row
 * @throws Error if the Supabase query fails
 */
export async function createKnowledgeBaseEntry(
  tenantId: string,
  data: Partial<KnowledgeBaseRow>,
): Promise<KnowledgeBaseRow> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('knowledge_base')
    .insert({ tenant_id: tenantId, ...data })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create knowledge base entry: ${error.message}`);
  }

  return row;
}

/**
 * Updates an existing knowledge base entry scoped to the given tenant.
 *
 * @param tenantId - The tenant identifier (enforces ownership)
 * @param entryId - The knowledge base entry ID to update
 * @param data - Partial knowledge base fields to update
 * @returns The updated knowledge base row
 * @throws Error if the Supabase query fails
 */
export async function updateKnowledgeBaseEntry(
  tenantId: string,
  entryId: string,
  data: Partial<KnowledgeBaseRow>,
): Promise<KnowledgeBaseRow> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('knowledge_base')
    .update(data)
    .eq('tenant_id', tenantId)
    .eq('id', entryId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update knowledge base entry: ${error.message}`);
  }

  return row;
}

/**
 * Deletes a knowledge base entry scoped to the given tenant.
 *
 * @param tenantId - The tenant identifier (enforces ownership)
 * @param entryId - The knowledge base entry ID to delete
 * @returns An ActionConfirmationDTO indicating success
 * @throws Error if the Supabase query fails
 */
export async function deleteKnowledgeBaseEntry(
  tenantId: string,
  entryId: string,
): Promise<ActionConfirmationDTO> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('knowledge_base')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('id', entryId);

  if (error) {
    throw new Error(`Failed to delete knowledge base entry: ${error.message}`);
  }

  return { success: true, message: 'Knowledge base entry deleted.' };
}
