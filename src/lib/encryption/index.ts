/**
 * Quantum Nexus — Encryption Module Entry Point
 * Terminal 3 — Security, Auth, Middleware
 *
 * This directory is owned by Terminal 3 per CLAUDE.md terminal boundaries.
 * The actual AES-256-GCM implementation lives in /src/lib/security/encryption.ts
 * to keep the security module self-contained.
 *
 * This file re-exports from the security encryption module so that
 * /src/lib/encryption is a valid import path as documented in CLAUDE.md.
 *
 * PHASE 3: Real AES-256-GCM with ENCRYPTION_KEY env var. No mock fallbacks.
 *
 * @module encryption
 */

export type { EncryptionResult } from '../security/encryption';
export { encrypt, decrypt, generateIv, validateEncryptionKey } from '../security/encryption';

export type {
  InvoiceEncryptedFields,
  EncryptedInvoicePayload,
} from '../security/invoice-encryption';

export {
  encryptInvoiceFields,
  decryptInvoiceFields,
  encryptInvoiceField,
  decryptInvoiceField,
} from '../security/invoice-encryption';

export type {
  KeyRotationResult,
  KeyRotationPassResult,
} from '../security/key-rotation-scheduler';

export {
  executeKeyRotationPass,
  getRotatableKeyTypes,
  getRotationAgeDays,
} from '../security/key-rotation-scheduler';