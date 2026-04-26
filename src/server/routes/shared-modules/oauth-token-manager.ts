import * as db from '@/lib/db';
import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { OAuthTokenDTO, ExpiringTokenDTO } from '@/lib/api/schema';

/** @module oauth-token-manager @description OAuth Token Manager route handlers for retrieving, refreshing, validating, and monitoring expiration of platform OAuth tokens */

/**
 * Retrieves the current OAuth token for a given platform.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param platform - The social platform name (e.g., 'facebook', 'instagram')
 * @returns Promise resolving to the token data including validity and expiration
 */
export async function getToken(
  tenantId: string,
  platform: string,
): Promise<ApiResponse<OAuthTokenDTO>> {
  const key = await db.billingQueries.getEncryptedKey(tenantId, platform);

  return {
    success: true,
    data: {
      platform,
      isValid: !!key,
      expiresAt: key?.expires_at ?? null,
    },
  };
}

/**
 * Refreshes the OAuth token for a given platform, obtaining a new access token
 * using the stored refresh token.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param platform - The social platform name to refresh the token for
 * @returns Promise resolving to the refreshed token with a new expiration date
 */
export async function refreshToken(
  tenantId: string,
  platform: string,
): Promise<ApiResponse<{ success: boolean; platform: string; expiresAt: string }>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Validates whether the current OAuth token for a platform is still valid
 * and has not expired.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param platform - The social platform name to validate the token for
 * @returns Promise resolving to the validation result
 */
export async function validateToken(
  tenantId: string,
  platform: string,
): Promise<ApiResponse<{ valid: boolean; platform: string }>> {
  const key = await db.billingQueries.getEncryptedKey(tenantId, platform);
  const isValid = !!key && (!key.expires_at || new Date(key.expires_at) > new Date());

  return {
    success: true,
    data: {
      valid: isValid,
      platform,
    },
  };
}

/**
 * Retrieves all OAuth tokens that will expire within the specified time window,
 * enabling proactive refresh before expiration.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param withinHours - The number of hours within which to find expiring tokens
 * @returns Promise resolving to the list of tokens expiring within the window
 */
export async function getExpiringTokens(
  tenantId: string,
  withinHours: number,
): Promise<ApiResponse<ExpiringTokenDTO[]>> {
  const keys = await db.billingQueries.listApiKeys(tenantId);
  const expiring = keys.filter(
    k => k.expiresAt && new Date(k.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );

  return {
    success: true,
    data: expiring.map(k => ({
      id: k.id,
      keyName: k.keyName,
      platform: k.keyName,
      expiresAt: k.expiresAt ?? '',
      hoursUntilExpiry: k.expiresAt ? Math.max(0, (new Date(k.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)) : 0,
    })),
  };
}
