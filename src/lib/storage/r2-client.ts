/**
 * CLOUDFLARE_R2 — Media storage integration (REAL)
 *
 * PURPOSE: All video and media storage. Zero egress fees.
 * All media served via R2 URLs through Cloudflare CDN.
 * Includes temporary bubble upload storage.
 *
 * AUTH METHOD: R2 access key and secret
 * (CLOUDFLARE_R2_ACCESS_KEY, CLOUDFLARE_R2_SECRET_KEY env vars).
 * Bucket name (CLOUDFLARE_R2_BUCKET env var).
 * Endpoint (CLOUDFLARE_R2_ENDPOINT env var).
 *
 * R2 SDK: @aws-sdk/client-s3 with custom endpoint (R2 is S3-compatible)
 *
 * BUCKET STRUCTURE:
 *   /[tenant_id]/videos/raw/        — original uploaded videos
 *   /[tenant_id]/videos/renders/    — rendered clips and episodes
 *   /[tenant_id]/images/            — generated images
 *   /[tenant_id]/audio/             — ElevenLabs generated audio
 *   /[tenant_id]/assets/            — brand assets (logo, fonts)
 *   /[tenant_id]/exports/           — platform-optimised exports ready for posting
 *   /[tenant_id]/bubble-uploads/    — temporary files uploaded via AI bubble
 *                                     (deleted after analysis)
 *
 * WORKER: Worker 1 (uploads), Worker 2 (retrieval for posting)
 * PHASE: 3 (REAL — connected to Cloudflare R2 via S3-compatible API)
 * STATUS: connected
 *
 * ERROR HANDLING: All operations use retryWithBackoff with 3 retries.
 * On final failure, error is logged with tenant context and re-thrown
 * so BullMQ can mark the job as failed for the dead queue.
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl as getPresignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  CLOUDFLARE_R2_ACCESS_KEY,
  CLOUDFLARE_R2_SECRET_KEY,
  CLOUDFLARE_R2_BUCKET,
  CLOUDFLARE_R2_ENDPOINT,
  CLOUDFLARE_R2_PUBLIC_URL,
} from '../config/env';

// --- Types ---

/** R2 storage path segments matching bucket structure */
export type R2PathSegment = 'videos/raw' | 'videos/renders' | 'images' | 'audio' | 'assets' | 'exports' | 'bubble-uploads';

/** Parameters for uploading a file to R2 */
export interface R2UploadParams {
  /** File name (will be prefixed with tenant path) */
  fileName: string;
  /** File content as Buffer */
  fileBuffer: Buffer;
  /** MIME content type */
  contentType: string;
  /** Storage path segment */
  path: R2PathSegment;
  /** Tenant ID (becomes the top-level folder) */
  tenantId: string;
  /** Whether this is a temporary bubble upload (auto-deleted after analysis) */
  isTemporary?: boolean;
}

/** Parameters for retrieving a file from R2 */
export interface R2GetParams {
  /** Full object key in R2 */
  key: string;
  /** Tenant ID (for access validation) */
  tenantId: string;
}

/** Parameters for deleting a file from R2 */
export interface R2DeleteParams {
  /** Full object key in R2 */
  key: string;
  /** Tenant ID (for access validation) */
  tenantId: string;
}

/** Parameters for listing files in an R2 path */
export interface R2ListParams {
  /** Storage path segment */
  path: R2PathSegment;
  /** Tenant ID */
  tenantId: string;
  /** Maximum number of results */
  maxKeys?: number;
  /** Continuation token for pagination */
  continuationToken?: string;
}

/** Parameters for getting a signed/temporary URL */
export interface R2GetSignedUrlParams {
  /** Full object key */
  key: string;
  /** Tenant ID */
  tenantId: string;
  /** URL expiry in seconds (default: 3600) */
  expiresIn?: number;
  /** Operation type */
  operation?: 'get' | 'put';
}

/** Response from file upload */
export interface R2UploadResponse {
  /** Public CDN URL for the uploaded file */
  url: string;
  /** R2 object key */
  key: string;
  /** File size in bytes */
  size: number;
}

/** Response from file retrieval */
export interface R2GetResponse {
  /** File content as Buffer */
  body: Buffer;
  /** Content type */
  contentType: string;
  /** File size */
  size: number;
}

/** Response from file deletion */
export interface R2DeleteResponse {
  /** Whether the deletion succeeded */
  deleted: boolean;
  /** Object key that was deleted */
  key: string;
}

/** Response from file listing */
export interface R2ListResponse {
  /** Objects in the requested path */
  objects: Array<{
    /** Object key */
    key: string;
    /** File size in bytes */
    size: number;
    /** Last modified timestamp (ISO 8601) */
    lastModified: string;
    /** Public CDN URL */
    url: string;
  }>;
  /** Whether more results are available */
  isTruncated: boolean;
  /** Token to pass for the next page of results */
  continuationToken?: string;
}

/** Response from signed URL generation */
export interface R2SignedUrlResponse {
  /** The signed URL */
  url: string;
  /** When the URL expires (ISO 8601) */
  expiresAt: string;
}

// --- S3 Client Initialization ---

/**
 * Lazy-initialised S3 client configured for Cloudflare R2.
 * R2 is fully S3-compatible — we point the endpoint at the R2 account URL.
 */
let r2Client: S3Client | null = null;

/**
 * Get or create the S3 client for R2.
 * @returns Configured S3Client instance
 * @throws Error if R2 credentials or endpoint are not configured
 */
function getR2Client(): S3Client {
  if (r2Client) return r2Client;

  if (!CLOUDFLARE_R2_ACCESS_KEY || !CLOUDFLARE_R2_SECRET_KEY || !CLOUDFLARE_R2_ENDPOINT) {
    throw new Error(
      'Cloudflare R2 is not configured. Set CLOUDFLARE_R2_ACCESS_KEY, CLOUDFLARE_R2_SECRET_KEY, and CLOUDFLARE_R2_ENDPOINT environment variables.'
    );
  }

  r2Client = new S3Client({
    region: 'auto',
    endpoint: CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: CLOUDFLARE_R2_ACCESS_KEY,
      secretAccessKey: CLOUDFLARE_R2_SECRET_KEY,
    },
    // R2 does not need path-style — it uses virtual-hosted-style by default
    // but we set forcePathStyle to false explicitly for clarity
    forcePathStyle: false,
  });

  return r2Client;
}

// --- Retry Logic ---

/** Default retry configuration */
const RETRY_CONFIG = {
  /** Maximum number of retry attempts */
  maxRetries: 3,
  /** Base delay in milliseconds for exponential backoff */
  baseDelayMs: 500,
  /** Maximum delay cap in milliseconds */
  maxDelayMs: 10000,
} as const;

/**
 * Execute an async operation with exponential backoff retry logic.
 *
 * Retries on transient errors (network timeouts, 5xx responses, throttling).
 * Does NOT retry on authentication errors (4xx except 429) or client errors.
 *
 * @param operation - The async function to execute
 * @param context - Description for logging (e.g. "R2 upload tenant_xxx/images")
 * @returns The result of the operation
 * @throws The last error if all retries are exhausted
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on client errors (except 429 Too Many Requests)
      const isRetryable = isRetryableError(error);
      if (!isRetryable) {
        throw lastError;
      }

      // If this was the last attempt, throw
      if (attempt === RETRY_CONFIG.maxRetries) {
        console.error(`[R2] All ${RETRY_CONFIG.maxRetries + 1} attempts failed for ${context}`, {
          error: lastError.message,
        });
        throw lastError;
      }

      // Calculate exponential backoff delay
      const delay = Math.min(
        RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt),
        RETRY_CONFIG.maxDelayMs
      );
      const jitter = Math.random() * delay * 0.1; // Add 10% jitter

      console.warn(
        `[R2] Attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1} failed for ${context}. ` +
        `Retrying in ${Math.round(delay + jitter)}ms. Error: ${lastError.message}`
      );

      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Determine if an error is retryable (transient network/server errors).
 * Non-retryable: auth failures, bad requests, not found, etc.
 * @param error - The error to check
 * @returns Whether the error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return true; // Unknown errors are retryable

  const message = error.message.toLowerCase();
  const name = error.constructor.name.toLowerCase();

  // Retry on throttling
  if (message.includes('slow down') || message.includes('429') || message.includes('throttl')) {
    return true;
  }

  // Retry on server errors
  if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
    return true;
  }

  // Retry on network/transient errors
  if (
    message.includes('econnreset') ||
    message.includes('econnrefused') ||
    message.includes('etimedout') ||
    message.includes('socket hang up') ||
    message.includes('network error') ||
    name.includes('timeouterror') ||
    name.includes('networkerror') ||
    name.includes('aborterror')
  ) {
    return true;
  }

  // Retry on AWS SDK service exceptions that are transient
  if (name.includes('serviceexception') || name.includes('internalerror')) {
    return true;
  }

  // Don't retry on client errors (access denied, not found, bad request, etc.)
  if (
    message.includes('403') ||
    message.includes('access denied') ||
    message.includes('404') ||
    message.includes('not found') ||
    message.includes('400') ||
    message.includes('nosuchbucket') ||
    message.includes('nosuchkey')
  ) {
    return false;
  }

  // Default to retryable for unknown errors
  return true;
}

// --- Key Construction ---

/**
 * Build an R2 object key from tenant ID, path segment, and file name.
 * Format: {tenant_id}/{path}/{fileName}
 *
 * @param tenantId - Tenant identifier
 * @param path - Storage path segment
 * @param fileName - File name
 * @returns Full R2 object key
 */
function buildKey(tenantId: string, path: R2PathSegment, fileName: string): string {
  return `${tenantId}/${path}/${fileName}`;
}

/**
 * Build a public CDN URL for an R2 object key.
 *
 * @param key - Full R2 object key
 * @returns Public URL via Cloudflare CDN
 */
function buildPublicUrl(key: string): string {
  return `${CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
}

/**
 * Validate that an object key belongs to the specified tenant.
 * Prevents cross-tenant access by ensuring the key starts with the tenant's prefix.
 *
 * @param key - Object key to validate
 * @param tenantId - Expected tenant ID
 * @throws Error if the key does not belong to this tenant
 */
function validateTenantAccess(key: string, tenantId: string): void {
  if (!key.startsWith(`${tenantId}/`)) {
    throw new Error(
      `Tenant access violation: key "${key}" does not belong to tenant "${tenantId}"`
    );
  }
}

// --- Main Exports ---

/**
 * Upload a file to Cloudflare R2.
 *
 * Files are organized by tenant_id and path segment.
 * Zero egress — all media served via R2 public URLs through Cloudflare CDN.
 *
 * @param params - File name, buffer, content type, path, tenantId
 * @returns CDN URL and object key
 * @throws Error if upload fails after retries
 */
export async function upload(params: R2UploadParams): Promise<R2UploadResponse> {
  const key = buildKey(params.tenantId, params.path, params.fileName);

  return retryWithBackoff(async () => {
    const client = getR2Client();

    await client.send(
      new PutObjectCommand({
        Bucket: CLOUDFLARE_R2_BUCKET,
        Key: key,
        Body: params.fileBuffer,
        ContentType: params.contentType,
        ContentLength: params.fileBuffer.length,
        // Tag temporary uploads for lifecycle cleanup
        ...(params.isTemporary ? { Tagging: 'temporary=true' } : {}),
      })
    );

    return {
      url: buildPublicUrl(key),
      key,
      size: params.fileBuffer.length,
    };
  }, `R2 upload ${key}`);
}

/**
 * Retrieve a file from Cloudflare R2.
 *
 * Validates tenant access before retrieval to prevent cross-tenant data leaks.
 *
 * @param params - Object key, tenantId
 * @returns File buffer, content type, and size
 * @throws Error if retrieval fails after retries or tenant validation fails
 */
export async function get(params: R2GetParams): Promise<R2GetResponse> {
  validateTenantAccess(params.key, params.tenantId);

  return retryWithBackoff(async () => {
    const client = getR2Client();

    const response = await client.send(
      new GetObjectCommand({
        Bucket: CLOUDFLARE_R2_BUCKET,
        Key: params.key,
      })
    );

    if (!response.Body) {
      throw new Error(`R2 object body is empty for key: ${params.key}`);
    }

    // Convert the ReadableStream to a Buffer
    const bodyBytes = await response.Body.transformToByteArray();
    const body = Buffer.from(bodyBytes);

    return {
      body,
      contentType: response.ContentType ?? 'application/octet-stream',
      size: response.ContentLength ?? body.length,
    };
  }, `R2 get ${params.key}`);
}

/**
 * Delete a file from Cloudflare R2.
 *
 * Used for bubble-uploads cleanup after analysis.
 * Validates tenant access before deletion.
 *
 * @param params - Object key, tenantId
 * @returns Deletion confirmation
 * @throws Error if deletion fails after retries or tenant validation fails
 */
export async function deleteFile(params: R2DeleteParams): Promise<R2DeleteResponse> {
  validateTenantAccess(params.key, params.tenantId);

  return retryWithBackoff(async () => {
    const client = getR2Client();

    await client.send(
      new DeleteObjectCommand({
        Bucket: CLOUDFLARE_R2_BUCKET,
        Key: params.key,
      })
    );

    return { deleted: true, key: params.key };
  }, `R2 delete ${params.key}`);
}

/**
 * List files in an R2 path for a tenant.
 *
 * Results include public CDN URLs for each object.
 * Supports pagination via continuationToken.
 *
 * @param params - Path segment, tenantId, max results, continuation token
 * @returns Object list with URLs and metadata
 * @throws Error if listing fails after retries
 */
export async function list(params: R2ListParams): Promise<R2ListResponse> {
  const prefix = `${params.tenantId}/${params.path}/`;

  return retryWithBackoff(async () => {
    const client = getR2Client();

    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: CLOUDFLARE_R2_BUCKET,
        Prefix: prefix,
        MaxKeys: params.maxKeys ?? 20,
        ContinuationToken: params.continuationToken,
      })
    );

    const objects = (response.Contents ?? []).map((obj) => ({
      key: obj.Key ?? '',
      size: obj.Size ?? 0,
      lastModified: obj.LastModified?.toISOString() ?? '',
      url: buildPublicUrl(obj.Key ?? ''),
    }));

    return {
      objects,
      isTruncated: response.IsTruncated ?? false,
      continuationToken: response.NextContinuationToken,
    };
  }, `R2 list ${prefix}`);
}

/**
 * Generate a signed URL for temporary access to an R2 object.
 *
 * Used for direct upload URLs (put) or temporary download links (get).
 * Validates tenant access before generating the URL.
 *
 * @param params - Object key, tenantId, expiry, operation type
 * @returns Signed URL and expiry time
 * @throws Error if URL generation fails or tenant validation fails
 */
export async function getSignedUrl(params: R2GetSignedUrlParams): Promise<R2SignedUrlResponse> {
  validateTenantAccess(params.key, params.tenantId);
  const expiresIn = params.expiresIn ?? 3600;

  return retryWithBackoff(async () => {
    const client = getR2Client();

    const command =
      params.operation === 'put'
        ? new PutObjectCommand({
            Bucket: CLOUDFLARE_R2_BUCKET,
            Key: params.key,
          })
        : new GetObjectCommand({
            Bucket: CLOUDFLARE_R2_BUCKET,
            Key: params.key,
          });

    const url = await getPresignedUrl(client, command, { expiresIn });

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    return { url, expiresAt };
  }, `R2 signed URL ${params.key}`);
}
