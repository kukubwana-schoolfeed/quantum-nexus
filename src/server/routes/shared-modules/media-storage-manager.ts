import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { MediaUploadDTO, ActionConfirmationDTO, SignedUrlDTO } from '@/lib/api/schema';

/** @module media-storage-manager @description Media Storage Manager route handlers for uploading, deleting, and generating signed URLs for media assets stored in R2/object storage */

/**
 * Uploads a media file to the tenant's storage bucket and returns
 * the public URL and storage key.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param data - The upload payload including file metadata, name, and content type
 * @returns Promise resolving to the upload result with URL and storage key
 */
export async function upload(
  tenantId: string,
  data: Record<string, unknown>,
): Promise<ApiResponse<MediaUploadDTO>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Deletes a media file from the tenant's storage bucket by its key.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param key - The storage key of the media file to delete
 * @returns Promise resolving to the deletion confirmation
 */
export async function deleteMedia(
  tenantId: string,
  key: string,
): Promise<ApiResponse<ActionConfirmationDTO>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Generates a time-limited signed URL for accessing a private media file.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param key - The storage key of the media file
 * @param expiresIn - The number of seconds until the signed URL expires
 * @returns Promise resolving to the signed URL and its expiration timestamp
 */
export async function getSignedUrl(
  tenantId: string,
  key: string,
  expiresIn: number,
): Promise<ApiResponse<SignedUrlDTO>> {
  throw internalError('INTEGRATION_PENDING');
}
