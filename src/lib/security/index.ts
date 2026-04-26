/**
 * Quantum Nexus — Security Module Barrel Exports
 * Terminal 3 — Security, Auth, Middleware
 *
 * Re-exports all security module public APIs.
 *
 * @module security
 */

export type {
  EncryptionResult,
} from './encryption';

export {
  encrypt,
  decrypt,
  generateIv,
  validateEncryptionKey,
} from './encryption';

export type {
  KeyType,
  StoredKeyRecord,
  DecryptedKey,
} from './key-manager';

export {
  storeKey,
  getBusinessKey,
  getAllBusinessKeys,
  rotateKey,
  deactivateKey,
} from './key-manager';

export type {
  TokenValidationResult,
  TokenRefreshResult,
  OAuthPlatform,
} from './oauth-token-manager';

export {
  validateToken,
  refreshToken,
  supportsAutoRefresh,
  requiresManualRefresh,
  checkExpiringTokens,
  holdPostForTokenExpiry,
  retryHeldPosts,
} from './oauth-token-manager';

export type {
  ContentSafetyResult,
  ContentSafetyCheck,
  ContentSafetyCategory,
  ContentContentType,
} from './content-safety';

export {
  checkContentSafety,
  isSafetyServiceAvailable,
  holdPostForSafetyFailure,
} from './content-safety';

export type {
  RateLimitedPlatform,
  RateLimitResult,
  RateLimitConfig,
} from './rate-limiter';

export {
  checkRateLimit,
  incrementRateLimit,
  getRateLimitConfig,
  getNextAvailableWindow,
} from './rate-limiter';

export type {
  InvoiceEncryptedFields,
  EncryptedInvoicePayload,
} from './invoice-encryption';

export {
  encryptInvoiceFields,
  decryptInvoiceFields,
  encryptInvoiceField,
  decryptInvoiceField,
} from './invoice-encryption';

export type {
  KeyRotationResult,
  KeyRotationPassResult,
} from './key-rotation-scheduler';

export {
  executeKeyRotationPass,
  getRotatableKeyTypes,
  getRotationAgeDays,
} from './key-rotation-scheduler';