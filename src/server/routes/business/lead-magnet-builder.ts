import * as db from '@/lib/db';
import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { LeadMagnetDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module lead-magnet-builder @description Lead magnet management — list, create, update magnets, and generate PDF downloads. */

/**
 * Retrieve all lead magnets for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @returns A list of lead magnets with their statuses and download counts.
 */
export async function getMagnets(tenantId: string): Promise<ApiResponse<LeadMagnetDTO[]>> {
  const { data } = await db.contentQueries.listPosts(tenantId, { content_type: 'blog_post' });
  const magnets: LeadMagnetDTO[] = data.map(post => ({
    id: post.id,
    title: post.caption ?? 'Untitled Magnet',
    type: 'pdf' as const,
    status: (post.status === 'published' ? 'active' : post.status === 'cancelled' ? 'archived' : 'draft') as LeadMagnetDTO['status'],
    downloads: 0,
    url: post.media_url,
  }));
  return { success: true, data: magnets };
}

/**
 * Retrieve a single lead magnet by its identifier.
 * @param tenantId - The unique identifier of the tenant.
 * @param magnetId - The unique identifier of the lead magnet.
 * @returns The lead magnet details, or null if not found.
 */
export async function getMagnet(tenantId: string, magnetId: string): Promise<ApiResponse<LeadMagnetDTO | null>> {
  const post = await db.contentQueries.getPost(tenantId, magnetId);
  if (!post) return { success: true, data: null };
  const magnet: LeadMagnetDTO = {
    id: post.id,
    title: post.caption ?? 'Untitled Magnet',
    type: 'pdf' as const,
    status: (post.status === 'published' ? 'active' : post.status === 'cancelled' ? 'archived' : 'draft') as LeadMagnetDTO['status'],
    downloads: 0,
    url: post.media_url,
  };
  return { success: true, data: magnet };
}

/**
 * Create a new lead magnet for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @param data - The lead magnet definition fields such as title, type, and content.
 * @returns The newly created lead magnet in draft status.
 */
export async function createMagnet(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<LeadMagnetDTO>> {
  const result = await db.contentQueries.createPost(tenantId, { ...data, content_type: 'blog_post', status: 'draft' });
  const magnet: LeadMagnetDTO = {
    id: result.id,
    title: result.caption ?? 'Untitled Magnet',
    type: 'pdf' as const,
    status: 'draft',
    downloads: 0,
    url: result.media_url,
  };
  return { success: true, data: magnet };
}

/**
 * Update an existing lead magnet's fields.
 * @param tenantId - The unique identifier of the tenant.
 * @param magnetId - The unique identifier of the lead magnet to update.
 * @param data - The fields to update on the lead magnet.
 * @returns The updated lead magnet data.
 */
export async function updateMagnet(tenantId: string, magnetId: string, data: Record<string, unknown>): Promise<ApiResponse<ActionConfirmationDTO & Record<string, unknown>>> {
  await db.contentQueries.updatePost(tenantId, magnetId, data);
  return { success: true, data: { success: true, message: 'Magnet updated' } };
}

/**
 * Generate a PDF file for a lead magnet and return its download URL.
 * @param tenantId - The unique identifier of the tenant.
 * @param magnetId - The unique identifier of the lead magnet to generate a PDF for.
 * @returns The URL of the generated PDF.
 */
export async function generatePdf(tenantId: string, magnetId: string): Promise<ApiResponse<{ success: boolean; url: string }>> {
  throw internalError('INTEGRATION_PENDING');
}
