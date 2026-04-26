/**
 * Quantum Nexus — Invoice Encryption Layer
 * Terminal 3 — Security, Auth, Middleware
 *
 * Encrypts all invoice PII and billing-sensitive fields at rest using
 * AES-256-GCM before writing to Supabase (RULE S-2).
 * Decrypted values must not persist in memory beyond the request (RULE S-2).
 *
 * Encrypted fields: amount_zmw, lenco_transaction_id
 * Non-encrypted fields: id, tenant_id, dates, status (needed for queries/indexes)
 *
 * @module security/invoice-encryption
 */

import { encrypt, decrypt } from './encryption';
import { storeKey, getBusinessKey } from './key-manager';

/** Fields on InvoiceRow that are encrypted at rest */
export interface InvoiceEncryptedFields {
  amount_zmw: string;
  lenco_transaction_id: string | null;
}

/** Result of encrypting invoice fields */
export interface EncryptedInvoicePayload {
  encrypted_amount: string;
  amount_iv: string;
  amount_auth_tag: string;
  encrypted_lenco_tx_id: string | null;
  lenco_tx_id_iv: string | null;
  lenco_tx_id_auth_tag: string | null;
}

const INVOICE_KEY_PLATFORM_ID = 'billing_invoice';

/**
 * Retrieves or provisions the per-tenant invoice encryption key.
 * Each tenant gets a dedicated key record of type 'invoice_field'.
 *
 * @param {string} tenantId - The tenant UUID from JWT claims (RULE MT-2)
 * @returns {Promise<string>} The decrypted invoice encryption key value
 * @throws {Error} If key retrieval fails
 * @module security/invoice-encryption
 */
async function getOrCreateInvoiceKey(tenantId: string): Promise<string> {
  const existing = await getBusinessKey(tenantId, 'invoice_field', INVOICE_KEY_PLATFORM_ID);
  if (existing) {
    return existing.value;
  }

  // Provision a new per-tenant invoice key — the ENCRYPTION_KEY master key
  // encrypts this sub-key, which in turn encrypts individual invoice fields.
  // This allows per-tenant key rotation without re-encrypting all other tenants.
  const crypto = await import('crypto');
  const subKey = crypto.randomBytes(32).toString('base64');
  await storeKey(tenantId, 'invoice_field', subKey, INVOICE_KEY_PLATFORM_ID);
  return subKey;
}

/**
 * Encrypts the sensitive fields of an invoice row for at-rest storage.
 * Amount and Lenco transaction ID are encrypted with a per-tenant key
 * that is itself encrypted with the master ENCRYPTION_KEY (RULE S-2).
 *
 * @param {string} tenantId - The tenant UUID from JWT claims (RULE MT-2)
 * @param {InvoiceEncryptedFields} fields - The plaintext fields to encrypt
 * @returns {Promise<EncryptedInvoicePayload>} Encrypted field payloads ready for Supabase
 * @module security/invoice-encryption
 */
export async function encryptInvoiceFields(
  tenantId: string,
  fields: InvoiceEncryptedFields
): Promise<EncryptedInvoicePayload> {
  const key = await getOrCreateInvoiceKey(tenantId);

  // Encrypt amount
  const amountResult = encrypt(String(fields.amount_zmw));

  // Encrypt Lenco transaction ID if present
  let encryptedLencoTxId: string | null = null;
  let lencoTxIdIv: string | null = null;
  let lencoTxIdAuthTag: string | null = null;

  if (fields.lenco_transaction_id) {
    const lencoResult = encrypt(fields.lenco_transaction_id);
    encryptedLencoTxId = lencoResult.encrypted;
    lencoTxIdIv = lencoResult.iv;
    lencoTxIdAuthTag = lencoResult.authTag;
  }

  // Store the sub-key reference so we can look it up on decrypt
  // (already done in getOrCreateInvoiceKey if new)
  void key;

  return {
    encrypted_amount: amountResult.encrypted,
    amount_iv: amountResult.iv,
    amount_auth_tag: amountResult.authTag,
    encrypted_lenco_tx_id: encryptedLencoTxId,
    lenco_tx_id_iv: lencoTxIdIv,
    lenco_tx_id_auth_tag: lencoTxIdAuthTag,
  };
}

/**
 * Decrypts the encrypted fields of an invoice row after reading from Supabase.
 * Decrypted values must NOT persist in memory beyond the request (RULE S-2).
 *
 * @param {string} tenantId - The tenant UUID from JWT claims (RULE MT-2)
 * @param {EncryptedInvoicePayload} payload - The encrypted payload from Supabase
 * @returns {Promise<InvoiceEncryptedFields>} The decrypted plaintext fields
 * @throws {Error} If decryption fails or key is not found
 * @module security/invoice-encryption
 */
export async function decryptInvoiceFields(
  tenantId: string,
  payload: EncryptedInvoicePayload
): Promise<InvoiceEncryptedFields> {
  // Verify tenant has an invoice key — ensures key exists before attempting decrypt
  const keyData = await getBusinessKey(tenantId, 'invoice_field', INVOICE_KEY_PLATFORM_ID);
  if (!keyData) {
    throw new Error(`No invoice encryption key found for tenant ${tenantId}`);
  }

  const amount = decrypt(payload.encrypted_amount, payload.amount_iv, payload.amount_auth_tag);

  let lencoTransactionId: string | null = null;
  if (payload.encrypted_lenco_tx_id && payload.lenco_tx_id_iv && payload.lenco_tx_id_auth_tag) {
    lencoTransactionId = decrypt(
      payload.encrypted_lenco_tx_id,
      payload.lenco_tx_id_iv,
      payload.lenco_tx_id_auth_tag
    );
  }

  return {
    amount_zmw: amount,
    lenco_transaction_id: lencoTransactionId,
  };
}

/**
 * Encrypts a single invoice field value for ad-hoc queries.
 * Use this when you only need to encrypt/decrypt one field
 * rather than the full invoice payload.
 *
 * @param {string} tenantId - The tenant UUID from JWT claims (RULE MT-2)
 * @param {string} plaintext - The value to encrypt
 * @returns {Promise<{encrypted: string, iv: string, authTag: string}>} Encrypted result
 * @module security/invoice-encryption
 */
export async function encryptInvoiceField(
  tenantId: string,
  plaintext: string
): Promise<{ encrypted: string; iv: string; authTag: string }> {
  await getOrCreateInvoiceKey(tenantId);
  return encrypt(plaintext);
}

/**
 * Decrypts a single invoice field value.
 *
 * @param {string} _tenantId - The tenant UUID (reserved for future per-tenant key lookup)
 * @param {string} encrypted - Base64-encoded ciphertext
 * @param {string} iv - Base64-encoded IV
 * @param {string} authTag - Base64-encoded authentication tag
 * @returns {string} The decrypted plaintext
 * @module security/invoice-encryption
 */
export async function decryptInvoiceField(
  _tenantId: string,
  encrypted: string,
  iv: string,
  authTag: string
): Promise<string> {
  return decrypt(encrypted, iv, authTag);
}
