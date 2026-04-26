import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { KnowledgeBaseEntryDTO, ActionConfirmationDTO } from '@/lib/api/schema';
import type { KnowledgeBaseRow } from '@/lib/db/types';

/** @module knowledge-base-builder @description Knowledge base builder — CRUD operations for knowledge base entries. */

/**
 * Map a database row to a KnowledgeBaseEntryDTO.
 * @param row - The raw database row from the knowledge_base table.
 * @returns The mapped KnowledgeBaseEntryDTO.
 */
function mapToDTO(row: KnowledgeBaseRow): KnowledgeBaseEntryDTO {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    source: row.source ?? 'manual',
    isActive: row.is_active,
  };
}

/**
 * Retrieve knowledge base entries for a tenant with optional filter parameters.
 * @param tenantId - The unique identifier of the tenant.
 * @param params - Optional filter and pagination parameters.
 * @returns A list of knowledge base entries.
 */
export async function getEntries(tenantId: string, params: Record<string, unknown>): Promise<ApiResponse<KnowledgeBaseEntryDTO[]>> {
  const result = await db.businessQueries.listKnowledgeBase(tenantId, params);
  const entries = (result as KnowledgeBaseRow[]).map(mapToDTO);
  return { success: true, data: entries };
}

/**
 * Retrieve a single knowledge base entry by its identifier.
 * @param tenantId - The unique identifier of the tenant.
 * @param entryId - The unique identifier of the knowledge base entry.
 * @returns The requested knowledge base entry, or null if not found.
 */
export async function getEntry(tenantId: string, entryId: string): Promise<ApiResponse<KnowledgeBaseEntryDTO | null>> {
  const result = await db.businessQueries.getKnowledgeBaseEntry(tenantId, entryId);
  if (!result) {
    return { success: true, data: null };
  }
  return { success: true, data: mapToDTO(result as KnowledgeBaseRow) };
}

/**
 * Create a new knowledge base entry for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @param data - The data for the new knowledge base entry.
 * @returns The newly created knowledge base entry.
 */
export async function createEntry(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<KnowledgeBaseEntryDTO>> {
  const result = await db.businessQueries.createKnowledgeBaseEntry(tenantId, data);
  return { success: true, data: mapToDTO(result as KnowledgeBaseRow) };
}

/**
 * Update an existing knowledge base entry for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @param entryId - The unique identifier of the knowledge base entry to update.
 * @param data - The fields to update on the entry.
 * @returns The update confirmation with modified fields.
 */
export async function updateEntry(tenantId: string, entryId: string, data: Record<string, unknown>): Promise<ApiResponse<ActionConfirmationDTO & Record<string, unknown>>> {
  const result = await db.businessQueries.updateKnowledgeBaseEntry(tenantId, entryId, data);
  return { success: true, data: { ...mapToDTO(result as KnowledgeBaseRow), success: true } };
}

/**
 * Delete a knowledge base entry for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @param entryId - The unique identifier of the knowledge base entry to delete.
 * @returns The deletion confirmation.
 */
export async function deleteEntry(tenantId: string, entryId: string): Promise<ApiResponse<ActionConfirmationDTO>> {
  await db.businessQueries.deleteKnowledgeBaseEntry(tenantId, entryId);
  return { success: true, data: { success: true, message: 'Entry deleted' } };
}
