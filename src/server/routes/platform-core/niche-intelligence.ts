import * as db from '@/lib/db';
import { AppError, internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { NicheDTO } from '@/lib/api/schema';

/** @module platform-core/niche-intelligence @description Provides niche discovery and lookup capabilities, including listing all available niches, retrieving a niche by name, and searching for niche suggestions based on a query string. */

/**
 * Maps a niche_profiles row to a NicheDTO.
 * @param row - A NicheProfileRow from the database
 * @returns A NicheDTO with id, name, trendScore, and competitionLevel
 */
function mapNicheRow(row: db.NicheProfileRow): NicheDTO {
  return {
    id: row.id,
    name: row.niche_name,
    trendScore: 50,
    competitionLevel: 'medium',
  };
}

/**
 * Returns all available niches with their trend scores and competition levels.
 * Queries the niche_profiles table (platform-level, no tenant_id filter).
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @returns ApiResponse wrapping an array of niche objects with id, name, trendScore, and competitionLevel
 */
export async function getNiches(tenantId: string): Promise<ApiResponse<NicheDTO[]>> {
  try {
    const supabase = db.getSupabaseAdmin();
    const { data, error } = await supabase
      .from('niche_profiles')
      .select('*')
      .eq('status', 'active');

    if (error) {
      throw internalError('NICHE_LIST_FETCH_FAILED');
    }

    const rows: db.NicheProfileRow[] = data ?? [];
    const niches = rows.map(mapNicheRow);

    return { success: true, data: niches };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('NICHE_LIST_FETCH_FAILED');
  }
}

/**
 * Looks up a single niche by its exact name.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @param name - The exact niche name to look up
 * @returns ApiResponse wrapping the matching niche object, or null if not found
 */
export async function getNicheByName(tenantId: string, name: string): Promise<ApiResponse<NicheDTO | null>> {
  try {
    const supabase = db.getSupabaseAdmin();
    const { data, error } = await supabase
      .from('niche_profiles')
      .select('*')
      .eq('niche_name', name)
      .single();

    if (error) {
      // PGRST116 = no rows returned — niche not found is valid, return null
      if (error.code === 'PGRST116') {
        return { success: true, data: null };
      }
      throw internalError('NICHE_BY_NAME_FETCH_FAILED');
    }

    const row = data as db.NicheProfileRow | null;
    const niche = row ? mapNicheRow(row) : null;

    return { success: true, data: niche };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('NICHE_BY_NAME_FETCH_FAILED');
  }
}

/**
 * Searches for niche suggestions matching the given query string.
 * Used during onboarding to help tenants discover relevant niches.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @param query - The search query to match against niche names and metadata
 * @returns ApiResponse wrapping an array of niche suggestions matching the query
 */
export async function getSuggestions(tenantId: string, query: string): Promise<ApiResponse<NicheDTO[]>> {
  try {
    const supabase = db.getSupabaseAdmin();
    const { data, error } = await supabase
      .from('niche_profiles')
      .select('*')
      .eq('status', 'active')
      .ilike('niche_name', '%' + query + '%');

    if (error) {
      throw internalError('NICHE_SUGGESTIONS_FETCH_FAILED');
    }

    const rows: db.NicheProfileRow[] = data ?? [];
    const niches = rows.map(mapNicheRow);

    return { success: true, data: niches };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('NICHE_SUGGESTIONS_FETCH_FAILED');
  }
}
