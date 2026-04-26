/**
 * @module notification-queries
 * @description Typed Supabase query module for tenant-scoped notification
 * management including listing, marking as read, counting unread,
 * and creating notifications.
 */

import { getSupabaseAdmin } from '@/lib/db/client';
import type { NotificationRow } from '@/lib/db/types';
import type { NotificationDTO, UnreadCountDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/**
 * Lists notifications for a tenant with optional filtering and pagination.
 * Results are ordered by creation date descending.
 *
 * @param tenantId - The tenant identifier to scope the query.
 * @param params - Filters and pagination (e.g. `{ read: false, type: 'alert', priority: 'high', page: 1, pageSize: 20 }`).
 * @returns An array of `NotificationDTO` objects.
 * @throws If the Supabase query returns an error.
 */
export async function listNotifications(
  tenantId: string,
  params: Record<string, unknown>,
): Promise<NotificationDTO[]> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (params.read !== undefined) {
    query = query.eq('read', Boolean(params.read));
  }

  if (params.type) {
    query = query.eq('type', params.type as string);
  }

  if (params.priority) {
    query = query.eq('priority', params.priority as string);
  }

  const page = typeof params.page === 'number' ? params.page : 1;
  const pageSize = typeof params.pageSize === 'number' ? params.pageSize : 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows: NotificationRow[] = data ?? [];

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    read: row.read,
    readAt: row.read_at,
    actionUrl: row.action_url,
    priority: row.priority,
    createdAt: row.created_at,
  }));
}

/**
 * Marks a single notification as read for a tenant.
 *
 * @param tenantId - The tenant identifier to scope the query.
 * @param notificationId - The notification identifier to mark as read.
 * @returns An `ActionConfirmationDTO` confirming the update.
 * @throws If the Supabase query returns an error.
 */
export async function markNotificationRead(
  tenantId: string,
  notificationId: string,
): Promise<ActionConfirmationDTO> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('tenant_id', tenantId)
    .eq('id', notificationId);

  if (error) {
    throw error;
  }

  return { success: true };
}

/**
 * Marks all unread notifications as read for a tenant.
 *
 * @param tenantId - The tenant identifier to scope the update.
 * @returns An `ActionConfirmationDTO` confirming the bulk update.
 * @throws If the Supabase query returns an error.
 */
export async function markAllNotificationsRead(
  tenantId: string,
): Promise<ActionConfirmationDTO> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('tenant_id', tenantId)
    .eq('read', false);

  if (error) {
    throw error;
  }

  return { success: true };
}

/**
 * Gets the count of unread notifications for a tenant.
 *
 * @param tenantId - The tenant identifier to scope the query.
 * @returns An `UnreadCountDTO` with the exact unread count.
 * @throws If the Supabase query returns an error.
 */
export async function getUnreadCount(
  tenantId: string,
): Promise<UnreadCountDTO> {
  const supabase = getSupabaseAdmin();

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('read', false);

  if (error) {
    throw error;
  }

  return { count: count ?? 0 };
}

/**
 * Creates a new notification for a tenant.
 *
 * @param tenantId - The tenant identifier to associate with the notification.
 * @param data - Partial notification data to insert.
 * @returns The created `NotificationRow`.
 * @throws If the Supabase query returns an error.
 */
export async function createNotification(
  tenantId: string,
  data: Partial<NotificationRow>,
): Promise<NotificationRow> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('notifications')
    .insert({
      ...data,
      tenant_id: tenantId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return row;
}

/**
 * Creates multiple notifications in a single batch insert.
 * Used by system events that generate notifications for many tenants at once.
 *
 * @param notifications - Array of { tenantId, data } objects
 * @returns The number of notifications created
 */
export async function batchCreateNotifications(
  notifications: Array<{ tenantId: string; data: Partial<NotificationRow> }>,
): Promise<number> {
  if (notifications.length === 0) return 0;

  const supabase = getSupabaseAdmin();

  const rows = notifications.map(({ tenantId, data }) => ({
    ...data,
    tenant_id: tenantId,
  }));

  const { data: inserted, error } = await supabase
    .from('notifications')
    .insert(rows)
    .select();

  if (error) {
    throw error;
  }

  return inserted?.length ?? 0;
}

/**
 * Gets notifications by priority for a tenant. Used for delivery routing:
 * urgent notifications should be delivered immediately, while low-priority
 * ones can be batched into a daily digest.
 *
 * @param tenantId - The tenant identifier to scope the query
 * @param priority - The priority level to filter by
 * @returns Array of NotificationDTO matching the priority
 */
export async function getNotificationsByPriority(
  tenantId: string,
  priority: 'urgent' | 'high' | 'normal' | 'low',
): Promise<NotificationDTO[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('read', false)
    .eq('priority', priority)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as NotificationRow[]).map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    read: row.read,
    readAt: row.read_at,
    actionUrl: row.action_url,
    priority: row.priority,
    createdAt: row.created_at,
  }));
}

/**
 * Delete old read notifications past a retention window.
 *
 * @param tenantId - The tenant identifier to scope the deletion
 * @param olderThanDays - Delete read notifications older than this many days
 * @returns The number of notifications deleted
 */
export async function purgeOldReadNotifications(
  tenantId: string,
  olderThanDays: number,
): Promise<number> {
  const supabase = getSupabaseAdmin();

  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('read', true)
    .lt('read_at', cutoff)
    .select();

  if (error) {
    throw error;
  }

  return data?.length ?? 0;
}
