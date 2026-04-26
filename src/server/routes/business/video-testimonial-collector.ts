import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { TestimonialRequestDTO } from '@/lib/api/schema';

/** @module video-testimonial-collector @description Video testimonial request management — list requests, create new requests, and retrieve submitted testimonials. */

/**
 * Retrieve all video testimonial requests for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @returns A list of testimonial requests with their statuses.
 */
export async function getRequests(tenantId: string): Promise<ApiResponse<TestimonialRequestDTO[]>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Create a new video testimonial request to send to a customer.
 * @param tenantId - The unique identifier of the tenant.
 * @param data - The request details such as customer target and message.
 * @returns The newly created testimonial request.
 */
export async function createRequest(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<TestimonialRequestDTO>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Retrieve all submitted video testimonials for a tenant.
 * @param tenantId - The unique identifier of the tenant.
 * @returns A list of completed video testimonials.
 */
export async function getTestimonials(tenantId: string): Promise<ApiResponse<TestimonialRequestDTO[]>> {
  throw internalError('INTEGRATION_PENDING');
}
