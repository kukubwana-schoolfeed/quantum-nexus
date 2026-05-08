import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { ConnectedPlatformDTO, ContentPostDTO } from '@/lib/api/schema';
import * as db from '@/lib/db';

/** @module social-media-layer @description Social platform connection management and post history routes for tenant businesses */

/**
 * Retrieves all connected social media platforms for a tenant.
 * Queries the connected_platforms table directly via Supabase admin client.
 */
export async function getConnectedPlatforms(tenantId: string): Promise<ApiResponse<ConnectedPlatformDTO[]>> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('connected_platforms')
    .select('platform, connected, token_expires_at')
    .eq('tenant_id', tenantId);

  if (error) {
    console.error(`[SocialMediaLayer] Failed to fetch connected platforms for tenant ${tenantId}: ${error.message}`);
    return { success: false, data: [], error: error.message };
  }

  const platforms: ConnectedPlatformDTO[] = (data ?? []).map((row: { platform: string; connected: boolean; token_expires_at: string | null }) => ({
    platform: row.platform,
    connected: row.connected,
    username: null,
    tokenExpiresAt: row.token_expires_at,
  }));

  return { success: true, data: platforms };
}

/**
 * Connects a social media platform using an OAuth authorization code.
 */
export async function connectPlatform(tenantId: string, platform: string, authCode: string): Promise<ApiResponse<{ success: boolean; platform: string }>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Disconnects a social media platform from the tenant.
 */
export async function disconnectPlatform(tenantId: string, platform: string): Promise<ApiResponse<{ success: boolean; platform: string }>> {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from('connected_platforms')
    .update({ connected: false })
    .eq('tenant_id', tenantId)
    .eq('platform', platform);

  if (error) {
    console.error(`[SocialMediaLayer] Failed to disconnect platform ${platform} for tenant ${tenantId}: ${error.message}`);
    return { success: false, data: { success: false, platform }, error: error.message };
  }

  return { success: true, data: { success: true, platform } };
}

/**
 * Retrieves the post history across connected social platforms.
 */
export async function getPostHistory(tenantId: string, params: Record<string, unknown>): Promise<ApiResponse<ContentPostDTO[]>> {
  const { data } = await db.contentQueries.listPosts(tenantId, params);
  return { success: true, data: data as unknown as ContentPostDTO[] };
}
