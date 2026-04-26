/**
 * Quantum Nexus — AES-256-GCM Encryption Layer
 * Terminal 3 — Security, Auth, Middleware
 *
 * Handles encryption and decryption of business API keys stored in Supabase.
 * The ENCRYPTION_KEY env var must never be stored in the database (RULE S-2).
 * Decrypted values must not persist in memory beyond the request (RULE S-2).
 *
 * PHASE 2: Full AES-256-GCM implementation using Node.js crypto module.
 * Uses ENCRYPTION_KEY from centralised env config (RULE G-5).
 *
 * @module security/encryption
 */

import crypto from 'crypto';
import { ENCRYPTION_KEY } from '../config/env';

/** AES-256-GCM algorithm identifier */
const ALGORITHM = 'aes-256-gcm';

/** IV length in bytes — 12 bytes is standard for GCM */
const IV_LENGTH = 12;

/** Authentication tag length in bytes — 16 bytes is standard for GCM */
const AUTH_TAG_LENGTH = 16;

/** Result of an encryption operation */
export interface EncryptionResult {
  /** Base64-encoded ciphertext */
  encrypted: string;
  /** Base64-encoded IV (initialisation vector) */
  iv: string;
  /** Base64-encoded authentication tag */
  authTag: string;
}

/**
 * Derives a 32-byte key from the ENCRYPTION_KEY env var.
 * If the key is hex-encoded (64 chars), decodes directly.
 * Otherwise, hashes with SHA-256 to produce a valid 32-byte key.
 *
 * @returns {Buffer} 32-byte key buffer suitable for AES-256-GCM
 * @throws {Error} If ENCRYPTION_KEY is empty
 * @module security/encryption
 */
function getEncryptionKey(): Buffer {
  const key = ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY is not set. Cannot perform encryption operations.');
  }
  // If the key looks like a hex string (64 hex chars = 32 bytes), decode it
  if (/^[0-9a-fA-F]{64}$/.test(key)) {
    return Buffer.from(key, 'hex');
  }
  // Otherwise derive a key via SHA-256
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * The encryption key comes from ENCRYPTION_KEY env var (RULE G-5).
 * IV and auth tag are returned alongside ciphertext for storage in Supabase.
 * Each encryption call generates a unique IV — never reused.
 *
 * @param {string} plaintext - The raw API key or secret to encrypt
 * @returns {EncryptionResult} Object containing encrypted value, IV, and auth tag
 * @throws {Error} If ENCRYPTION_KEY is not configured
 * @module security/encryption
 */
export function encrypt(plaintext: string): EncryptionResult {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

/**
 * Decrypts an AES-256-GCM encrypted value.
 * Decrypted value must NOT persist in memory beyond the request (RULE S-2).
 * Used by key-manager to deliver decrypted keys to server-side processes only.
 *
 * @param {string} encrypted - Base64-encoded ciphertext from Supabase
 * @param {string} iv - Base64-encoded IV stored alongside ciphertext
 * @param {string} authTag - Base64-encoded authentication tag
 * @returns {string} The decrypted plaintext value
 * @throws {Error} If decryption fails (wrong key, corrupted data, or tampering)
 * @module security/encryption
 */
export function decrypt(encrypted: string, iv: string, authTag: string): string {
  const key = getEncryptionKey();
  const ivBuffer = Buffer.from(iv, 'base64');
  const authTagBuffer = Buffer.from(authTag, 'base64');
  const encryptedBuffer = Buffer.from(encrypted, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
  decipher.setAuthTag(authTagBuffer);

  const decrypted = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Generates a cryptographically secure random IV for AES-256-GCM.
 * Each encryption operation must use a unique IV — never reused.
 *
 * @returns {string} Base64-encoded 12-byte IV
 * @module security/encryption
 */
export function generateIv(): string {
  return crypto.randomBytes(IV_LENGTH).toString('base64');
}

/**
 * Validates that the ENCRYPTION_KEY environment variable is present and
 * the correct length (32 bytes / 256 bits for AES-256).
 * Called at startup via env.validateEnv() (RULE G-5).
 *
 * @returns {boolean} True if ENCRYPTION_KEY is valid
 * @throws {Error} If ENCRYPTION_KEY is missing or wrong length
 * @module security/encryption
 */
export function validateEncryptionKey(): boolean {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not set. All encryption operations will fail.');
  }
  // Validate that the key can produce a 32-byte buffer
  const keyBuffer = getEncryptionKey();
  if (keyBuffer.length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY must produce a 32-byte key for AES-256-GCM. Got ${keyBuffer.length} bytes.`
    );
  }
  return true;
}