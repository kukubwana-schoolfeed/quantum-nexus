/**
 * Quantum Nexus — API Key Manager
 * Terminal 3 — Security, Auth, Middleware
 *
 * Securely stores, retrieves, and rotates all business-level API keys.
 * Keys are encrypted with AES-256-GCM before storage in Supabase (RULE S-2).
 * Decrypted keys are delivered server-side only and never exposed to the client (RULE S-1).
 * Decrypted values must not persist in memory beyond the request (RULE S-2).
 *
 * PHASE 3: Real Supabase encrypted_keys table queries.
 * Uses the Supabase admin client (service role key) for server-side key operations
 * because these queries run in middleware/worker context, not in user sessions.
 * All queries filter by tenant_id (RULE MT-1).
 *
 * @module security/key-manager
 */

import { encrypt, decrypt } from './encryption';
import { getSupabaseAdminClient } from '../auth/supabase-auth';

/** Supported key types for business-level API keys */
export type KeyType =
  | 'anthropic_api_key'
  | 'meta_oauth_token'
  | 'tiktok_oauth_token'
  | 'linkedin_oauth_token'
  | 'youtube_oauth_token'
  | 'pinterest_oauth_token'
  | 'reddit_oauth_token'
  | 'gsc_oauth_token'
  | 'ga4_oauth_token'
  | 'gbp_oauth_token'
  | 'payment_credentials'
  | 'invoice_field';

/** Stored key record from the encrypted_keys table */
export interface StoredKeyRecord {
  /** Unique key record identifier */
  id: string;
  /** Tenant this key belongs to */
  tenant_id: string;
  /** Type of the key */
  key_type: KeyType;
  /** Platform identifier for multi-token platforms (e.g. 'facebook', 'instagram' for meta) */
  platform_id: string;
  /** Whether this key is currently active */
  is_active: boolean;
  /** When the key was last rotated */
  rotated_at: string | null;
}

/** Decrypted key returned to server-side processes only */
export interface DecryptedKey {
  /** The decrypted key value — must NOT persist in memory beyond the request (RULE S-2) */
  value: string;
  /** The key type */
  key_type: KeyType;
  /** When this key was last validated */
  last_validated: string | null;
}

/**
 * Stores a business API key after AES-256-GCM encryption.
 * Keys are NEVER stored unencrypted (RULE S-2).
 * Keys are NEVER logged (RULE S-1).
 * Keys are NEVER returned to the client (RULE S-1).
 *
 * @param {string} tenantId - The tenant UUID from JWT claims (RULE MT-2)
 * @param {KeyType} keyType - The type of key being stored
 * @param {string} rawValue - The raw API key or OAuth token to encrypt and store
 * @param {string} platformId - Platform identifier for multi-token platforms
 * @returns {StoredKeyRecord} The stored key record (without the decrypted value)
 * @throws {Error} If encryption or Supabase insert fails
 * @module security/key-manager
 */
export async function storeKey(
  tenantId: string,
  keyType: KeyType,
  rawValue: string,
  platformId: string
): Promise<StoredKeyRecord> {
  const encrypted = encrypt(rawValue);
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('encrypted_keys')
    .insert({
      tenant_id: tenantId,
      key_type: keyType,
      platform_id: platformId,
      encrypted_value: encrypted.encrypted,
      iv: encrypted.iv,
      auth_tag: encrypted.authTag,
      is_active: true,
    })
    .select('id, tenant_id, key_type, platform_id, is_active, rotated_at')
    .single();

  if (error) {
    console.error(`[KeyManager] Failed to store key for tenant ${tenantId}: ${error.message}`);
    throw new Error(`Failed to store encrypted key: ${error.message}`);
  }

  return data as StoredKeyRecord;
}

/**
 * Retrieves and decrypts a business API key.
 * Decrypted value must NOT persist in memory beyond the request (RULE S-2).
 * This function must NEVER be called from client-side code (RULE S-1).
 *
 * @param {string} tenantId - The tenant UUID from JWT claims (RULE MT-2)
 * @param {KeyType} keyType - The type of key to retrieve
 * @param {string} platformId - Platform identifier for multi-token platforms
 * @returns {DecryptedKey | null} The decrypted key, or null if not found
 * @throws {Error} If decryption fails (corrupted data or wrong key)
 * @module security/key-manager
 */
export async function getBusinessKey(
  tenantId: string,
  keyType: KeyType,
  platformId: string
): Promise<DecryptedKey | null> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('encrypted_keys')
    .select('id, key_type, encrypted_value, iv, auth_tag, is_active, last_validated')
    .eq('tenant_id', tenantId)
    .eq('key_type', keyType)
    .eq('platform_id', platformId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(`[KeyManager] Failed to retrieve key for tenant ${tenantId}: ${error.message}`);
    return null;
  }

  if (!data) {
    return null;
  }

  // Decrypt immediately before use — must not persist beyond request (RULE S-2)
  const value = decrypt(data.encrypted_value, data.iv, data.auth_tag);

  return {
    value,
    key_type: data.key_type as KeyType,
    last_validated: data.last_validated,
  };
}

/**
 * Retrieves all active keys for a tenant.
 * Used by server-side processes that need multiple keys at once.
 * Each decrypted value must NOT persist in memory beyond the request (RULE S-2).
 *
 * @param {string} tenantId - The tenant UUID from JWT claims (RULE MT-2)
 * @returns {DecryptedKey[]} Array of decrypted keys for the tenant
 * @module security/key-manager
 */
export async function getAllBusinessKeys(tenantId: string): Promise<DecryptedKey[]> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('encrypted_keys')
    .select('key_type, encrypted_value, iv, auth_tag, last_validated')
    .eq('tenant_id', tenantId)
    .eq('is_active', true);

  if (error) {
    console.error(`[KeyManager] Failed to retrieve keys for tenant ${tenantId}: ${error.message}`);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map((row) => ({
    value: decrypt(row.encrypted_value, row.iv, row.auth_tag),
    key_type: row.key_type as KeyType,
    last_validated: row.last_validated,
  }));
}

/**
 * Rotates a business API key — encrypts the new value and deactivates the old one.
 * Old key record is kept for audit trail but marked inactive (RULE D-2 soft delete).
 *
 * @param {string} tenantId - The tenant UUID from JWT claims (RULE MT-2)
 * @param {KeyType} keyType - The type of key to rotate
 * @param {string} newRawValue - The new raw key value to encrypt and store
 * @param {string} platformId - Platform identifier
 * @returns {StoredKeyRecord} The new key record
 * @throws {Error} If rotation fails
 * @module security/key-manager
 */
export async function rotateKey(
  tenantId: string,
  keyType: KeyType,
  newRawValue: string,
  platformId: string
): Promise<StoredKeyRecord> {
  const supabase = getSupabaseAdminClient();

  // Deactivate all existing active keys for this tenant/type/platform
  const { error: deactivateError } = await supabase
    .from('encrypted_keys')
    .update({
      is_active: false,
      rotated_at: new Date().toISOString(),
    })
    .eq('tenant_id', tenantId)
    .eq('key_type', keyType)
    .eq('platform_id', platformId)
    .eq('is_active', true);

  if (deactivateError) {
    console.error(`[KeyManager] Failed to deactivate old key during rotation: ${deactivateError.message}`);
    throw new Error(`Key rotation failed: could not deactivate old key`);
  }

  // Store the new key
  const newRecord = await storeKey(tenantId, keyType, newRawValue, platformId);

  // Update rotated_at timestamp on the new record
  await supabase
    .from('encrypted_keys')
    .update({ rotated_at: new Date().toISOString() })
    .eq('id', newRecord.id);

  newRecord.rotated_at = new Date().toISOString();

  return newRecord;
}

/**
 * Deactivates a business API key without removing it (soft delete per RULE D-2).
 *
 * @param {string} tenantId - The tenant UUID from JWT claims (RULE MT-2)
 * @param {string} keyId - The key record ID to deactivate
 * @returns {boolean} True if the key was successfully deactivated
 * @module security/key-manager
 */
export async function deactivateKey(tenantId: string, keyId: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from('encrypted_keys')
    .update({ is_active: false })
    .eq('id', keyId)
    .eq('tenant_id', tenantId); // RULE MT-1: always filter by tenant_id

  if (error) {
    console.error(`[KeyManager] Failed to deactivate key ${keyId}: ${error.message}`);
    return false;
  }

  return true;
}