import * as db from '@/lib/db';
import { AppError, internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { ApiKeyDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module platform-core/api-key-manager @description Manages third-party API keys and OAuth tokens for a tenant, including listing stored keys, adding new keys, removing keys, and testing whether a key's connection is valid. */

/**
 * Lists all API keys stored for the tenant, excluding secret values.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @returns ApiResponse wrapping an array of key entries with id, keyName, isConnected, and expiresAt
 */
export async function getKeys(tenantId: string): Promise<ApiResponse<ApiKeyDTO[]>> {
  try {
    const result = await db.billingQueries.listApiKeys(tenantId);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('API_KEYS_FETCH_FAILED');
  }
}

/**
 * Stores a new API key (or updates an existing one) for the tenant.
 * The key value is encrypted at rest and never returned in subsequent reads.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @param keyName - The identifier for the key (e.g. "anthropic_api_key")
 * @param keyValue - The secret key value to store (encrypted at rest)
 * @returns ApiResponse wrapping confirmation with the stored key's name
 */
export async function storeKey(tenantId: string, keyName: string, keyValue: string): Promise<ApiResponse<{ success: boolean; keyName: string }>> {
  try {
    const { encrypt } = await import('@/lib/security/encryption');
    const { encrypted, iv, authTag } = encrypt(keyValue);
    await db.billingQueries.upsertEncryptedKey(tenantId, keyName, encrypted, iv, authTag);
    return { success: true, data: { success: true, keyName } };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('API_KEY_STORE_FAILED');
  }
}

/**
 * Removes an API key from the tenant's stored credentials.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @param keyName - The identifier of the key to delete
 * @returns ApiResponse wrapping confirmation of deletion
 */
export async function deleteKey(tenantId: string, keyName: string): Promise<ApiResponse<ActionConfirmationDTO>> {
  try {
    await db.billingQueries.deleteEncryptedKey(tenantId, keyName);
    return { success: true, data: { success: true, message: 'Key deleted' } };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw internalError('API_KEY_DELETE_FAILED');
  }
}

/**
 * Tests whether a stored API key can successfully authenticate
 * with its corresponding third-party service.
 * @param tenantId - The tenant's UUID (from authenticated session)
 * @param keyName - The identifier of the key to test
 * @returns ApiResponse wrapping connection test result including the key name and validity flag
 */
export async function testConnection(tenantId: string, keyName: string): Promise<ApiResponse<{ success: boolean; keyName: string; valid: boolean }>> {
  throw internalError('INTEGRATION_PENDING');
}
