/**
 * Quantum Nexus — Key Rotation Scheduler
 * Terminal 3 — Security, Auth, Middleware
 *
 * Scheduled key rotation for all encrypted_keys records.
 * Iterates active keys and rotates those that are expired or due for
 * rotation based on age. Runs as a BullMQ cron job (Worker 4).
 *
 * Rotation creates a new encrypted record and deactivates the old one (RULE D-2).
 * Decrypted values must not persist in memory beyond the request (RULE S-2).
 *
 * PHASE 5: Scheduler stub — real cron wiring via Worker 4 job registration.
 *
 * @module security/key-rotation-scheduler
 */

import { getSupabaseAdminClient } from '../auth/supabase-auth';
import { rotateKey } from './key-manager';
import type { KeyType } from './key-manager';

/** Result of a key rotation pass for a single key */
export interface KeyRotationResult {
  /** The key record ID that was evaluated */
  keyId: string;
  /** The tenant that owns the key */
  tenantId: string;
  /** The key type that was rotated */
  keyType: KeyType;
  /** Whether rotation was performed */
  rotated: boolean;
  /** Reason if rotation was skipped */
  skipReason?: string;
}

/** Result of a full rotation pass */
export interface KeyRotationPassResult {
  /** Total active keys evaluated */
  evaluated: number;
  /** Number of keys rotated */
  rotated: number;
  /** Number of keys skipped */
  skipped: number;
  /** Errors encountered */
  errors: string[];
  /** Per-key details */
  details: KeyRotationResult[];
}

/** Key types eligible for automatic rotation */
const ROTATABLE_KEY_TYPES: KeyType[] = [
  'meta_oauth_token',
  'tiktok_oauth_token',
  'linkedin_oauth_token',
  'youtube_oauth_token',
  'pinterest_oauth_token',
  'reddit_oauth_token',
  'gsc_oauth_token',
  'ga4_oauth_token',
  'gbp_oauth_token',
  'payment_credentials',
  'invoice_field',
];

/** Maximum age in days before a key is due for rotation */
const ROTATION_AGE_DAYS = 90;

/** Active key record shape from Supabase */
interface ActiveKeyRow {
  id: string;
  tenant_id: string;
  key_type: KeyType;
  platform_id: string;
  created_at: string;
  rotated_at: string | null;
}

/**
 * Determines whether a key is due for rotation based on age.
 * Keys older than ROTATION_AGE_DAYS since last rotation (or creation)
 * are candidates for rotation.
 *
 * @param {ActiveKeyRow} key - The active key record to evaluate
 * @returns {boolean} True if the key should be rotated
 * @module security/key-rotation-scheduler
 */
function isKeyDueForRotation(key: ActiveKeyRow): boolean {
  const lastRotated = key.rotated_at ?? key.created_at;
  const rotatedDate = new Date(lastRotated);
  const ageMs = Date.now() - rotatedDate.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return ageDays >= ROTATION_AGE_DAYS;
}

/**
 * Executes a key rotation pass across all tenants and active keys.
 * Called by the BullMQ 'key-rotation' cron job (Worker 4, monthly).
 *
 * This function:
 * 1. Queries all active keys of rotatable types
 * 2. Evaluates each key's age against the rotation threshold
 * 3. Rotates keys that are due by generating a new encrypted record
 *    and deactivating the old one
 * 4. Returns a summary of the rotation pass
 *
 * NOTE: OAuth token keys cannot be auto-rotated with a new value —
 * they must be refreshed via the OAuth flow. The rotation here
 * re-encrypts the existing value with a fresh IV, which provides
 * cryptographic hygiene (new ciphertext, new IV) without changing
 * the underlying secret.
 *
 * @returns {Promise<KeyRotationPassResult>} Summary of the rotation pass
 * @module security/key-rotation-scheduler
 */
export async function executeKeyRotationPass(): Promise<KeyRotationPassResult> {
  const supabase = getSupabaseAdminClient();
  const result: KeyRotationPassResult = {
    evaluated: 0,
    rotated: 0,
    skipped: 0,
    errors: [],
    details: [],
  };

  for (const keyType of ROTATABLE_KEY_TYPES) {
    const { data, error } = await supabase
      .from('encrypted_keys')
      .select('id, tenant_id, key_type, platform_id, created_at, rotated_at')
      .eq('key_type', keyType)
      .eq('is_active', true);

    if (error) {
      result.errors.push(`Failed to query ${keyType}: ${error.message}`);
      continue;
    }

    if (!data || data.length === 0) {
      continue;
    }

    for (const row of data as ActiveKeyRow[]) {
      result.evaluated++;

      if (!isKeyDueForRotation(row)) {
        result.skipped++;
        result.details.push({
          keyId: row.id,
          tenantId: row.tenant_id,
          keyType: row.key_type as KeyType,
          rotated: false,
          skipReason: 'not_due',
        });
        continue;
      }

      try {
        // Retrieve the current decrypted value to re-encrypt with fresh IV
        const { getBusinessKey } = await import('./key-manager');
        const currentKey = await getBusinessKey(row.tenant_id, row.key_type as KeyType, row.platform_id);

        if (!currentKey) {
          result.skipped++;
          result.details.push({
            keyId: row.id,
            tenantId: row.tenant_id,
            keyType: row.key_type as KeyType,
            rotated: false,
            skipReason: 'decrypt_failed',
          });
          continue;
        }

        // Re-encrypt with fresh IV — rotateKey deactivates old, stores new
        await rotateKey(
          row.tenant_id,
          row.key_type as KeyType,
          currentKey.value,
          row.platform_id
        );

        result.rotated++;
        result.details.push({
          keyId: row.id,
          tenantId: row.tenant_id,
          keyType: row.key_type as KeyType,
          rotated: true,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push(`Rotation failed for key ${row.id}: ${msg}`);
        result.details.push({
          keyId: row.id,
          tenantId: row.tenant_id,
          keyType: row.key_type as KeyType,
          rotated: false,
          skipReason: `error: ${msg}`,
        });
      }
    }
  }

  console.log(
    `[KeyRotation] Pass complete. Evaluated: ${result.evaluated}, ` +
    `Rotated: ${result.rotated}, Skipped: ${result.skipped}, ` +
    `Errors: ${result.errors.length}`
  );

  return result;
}

/**
 * Returns the list of key types eligible for rotation.
 * Useful for admin dashboards and rotation preview.
 *
 * @returns {KeyType[]} The rotatable key types
 * @module security/key-rotation-scheduler
 */
export function getRotatableKeyTypes(): KeyType[] {
  return [...ROTATABLE_KEY_TYPES];
}

/**
 * Returns the rotation age threshold in days.
 *
 * @returns {number} The number of days before a key is due for rotation
 * @module security/key-rotation-scheduler
 */
export function getRotationAgeDays(): number {
  return ROTATION_AGE_DAYS;
}
