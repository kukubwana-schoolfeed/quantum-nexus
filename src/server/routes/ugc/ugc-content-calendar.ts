import * as db from '@/lib/db';
import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { CalendarEntryDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module ugc-content-calendar @description Manages the scheduling and organisation of UGC content across platforms with calendar entries for publish times and dates */

/**
 * Retrieves a list of calendar entries for the tenant.
 * @param tenantId - The tenant's UUID from the authenticated session
 * @param params - Query and filter parameters such as dateRange, platform, and status
 * @returns Promise resolving to an array of calendar entry objects
 */
export async function getEntries(tenantId: string, params: Record<string, unknown>): Promise<ApiResponse<CalendarEntryDTO[]>> {
  const { data } = await db.contentQueries.listPosts(tenantId, { content_type: 'reel' });
  const entries: CalendarEntryDTO[] = data.map((row) => ({
    id: row.id,
    clipId: row.id,
    platform: row.platform ?? 'unknown',
    scheduledFor: row.scheduled_for ?? row.created_at,
    status: (row.status === 'published' ? 'published' : row.status === 'failed' ? 'failed' : 'scheduled') as CalendarEntryDTO['status'],
  }));
  return { success: true, data: entries };
}

/**
 * Adds a new calendar entry for scheduling UGC content.
 * @param tenantId - The tenant's UUID from the authenticated session
 * @param data - Entry payload including clipId, platform, scheduledAt, and caption
 * @returns Promise resolving to the newly created calendar entry
 */
export async function addEntry(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<CalendarEntryDTO>> {
  const result = await db.contentQueries.createPost(tenantId, {
    ...data,
    content_type: 'reel',
    status: 'scheduled',
  } as Partial<import('@/lib/db/types').ContentPostRow>);
  const entry: CalendarEntryDTO = {
    id: result.id,
    clipId: result.id,
    platform: result.platform ?? 'unknown',
    scheduledFor: result.scheduled_for ?? result.created_at,
    status: 'scheduled',
  };
  return { success: true, data: entry };
}

/**
 * Updates an existing calendar entry with new data.
 * @param tenantId - The tenant's UUID from the authenticated session
 * @param entryId - The calendar entry's unique identifier
 * @param data - Updated fields such as scheduledAt, caption, and platform
 * @returns Promise resolving to confirmation of the update with echoed data
 */
export async function updateEntry(tenantId: string, entryId: string, data: Record<string, unknown>): Promise<ApiResponse<ActionConfirmationDTO & Record<string, unknown>>> {
  await db.contentQueries.updatePost(tenantId, entryId, data as Partial<import('@/lib/db/types').ContentPostRow>);
  return { success: true, data: { success: true, message: 'Entry updated' } };
}

/**
 * Removes a calendar entry from the schedule.
 * @param tenantId - The tenant's UUID from the authenticated session
 * @param entryId - The calendar entry's unique identifier
 * @returns Promise resolving to confirmation of removal
 */
export async function removeEntry(tenantId: string, entryId: string): Promise<ApiResponse<ActionConfirmationDTO>> {
  await db.contentQueries.deletePost(tenantId, entryId);
  return { success: true, data: { success: true, message: 'Entry removed' } };
}
