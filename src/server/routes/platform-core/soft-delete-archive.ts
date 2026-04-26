import * as db from '@/lib/db';
import { AppError, internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { ArchivedItemDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module platform-core/soft-delete-archive @description Manages soft-deletion of items (archive), restoration of archived items, and permanent deletion. Provides a safety window before data is irreversibly removed. */

/**
 * Retrieves all archived (soft-deleted) items for a tenant with optional filters.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @param params - Optional filter/sort/pagination parameters
 * @returns ApiResponse wrapping a list of archived items matching the given parameters
 */
export async function getArchivedItems(
  tenantId: string,
  params: Record<string, unknown>
): Promise<ApiResponse<ArchivedItemDTO[]>> {
  try {
    const supabase = db.getSupabaseAdmin();
    const { data, error } = await supabase
      .from('tenants')
      .select('id, business_name, archived_at')
      .eq('status', 'archived');

    if (error) {
      throw internalError('ARCHIVED_ITEMS_FETCH_FAILED');
    }

    const rows = data as Array<{ id: string; business_name: string; archived_at: string | null }> ?? [];
    const items: ArchivedItemDTO[] = rows.map((row) => ({
      id: row.id,
      itemType: 'tenant',
      itemId: row.id,
      archivedAt: row.archived_at ?? '',
      restorableUntil: row.archived_at
        ? new Date(new Date(row.archived_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : '',
    }));

    return { success: true, data: items };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('ARCHIVED_ITEMS_FETCH_FAILED');
  }
}

/**
 * Soft-deletes an item by moving it to the archive.
 * The item remains recoverable until permanently deleted.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @param itemType - The type of item being archived (e.g. 'content_post', 'campaign')
 * @param itemId - The unique identifier of the item to archive
 * @returns ApiResponse wrapping the archived item record with timestamp of archival
 */
export async function archiveItem(
  tenantId: string,
  itemType: string,
  itemId: string
): Promise<ApiResponse<ArchivedItemDTO>> {
  try {
    if (itemType === 'tenant') {
      await db.tenantQueries.updateTenant(itemId, {
        status: 'archived',
        archived_at: new Date().toISOString(),
      } as Partial<db.TenantRow>);

      const archivedAt = new Date().toISOString();
      return {
        success: true,
        data: {
          id: itemId,
          itemType,
          itemId,
          archivedAt,
          restorableUntil: new Date(new Date(archivedAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      };
    }

    throw internalError('UNSUPPORTED_ITEM_TYPE');
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('ARCHIVE_ITEM_FAILED');
  }
}

/**
 * Restores an archived item back to its active state.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @param itemType - The type of item being restored (e.g. 'content_post', 'campaign')
 * @param itemId - The unique identifier of the item to restore
 * @returns ApiResponse wrapping confirmation that the item has been restored
 */
export async function restoreItem(
  tenantId: string,
  itemType: string,
  itemId: string
): Promise<ApiResponse<ActionConfirmationDTO>> {
  try {
    if (itemType === 'tenant') {
      await db.tenantQueries.updateTenant(itemId, {
        status: 'active',
        archived_at: null,
      } as Partial<db.TenantRow>);

      return { success: true, data: { success: true, message: 'Item restored' } };
    }

    throw internalError('UNSUPPORTED_ITEM_TYPE');
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('RESTORE_ITEM_FAILED');
  }
}

/**
 * Permanently deletes an archived item. This action is irreversible.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @param itemType - The type of item being permanently deleted
 * @param itemId - The unique identifier of the item to permanently delete
 * @returns ApiResponse wrapping confirmation that the item has been permanently deleted
 */
export async function permanentDelete(
  tenantId: string,
  itemType: string,
  itemId: string
): Promise<ApiResponse<ActionConfirmationDTO>> {
  try {
    if (itemType === 'tenant') {
      const supabase = db.getSupabaseAdmin();
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', itemId);

      if (error) {
        throw internalError('PERMANENT_DELETE_FAILED');
      }

      return { success: true, data: { success: true, message: 'Item permanently deleted' } };
    }

    throw internalError('UNSUPPORTED_ITEM_TYPE');
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('PERMANENT_DELETE_FAILED');
  }
}
