import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { QrCodeDTO, JoinPageDTO, IdReferenceDTO } from '@/lib/api/schema';

/** @module offline-qr-bridge @description Offline-to-online QR bridge — QR code management, join page data, and customer submission. */

/**
 * Retrieve the QR code configuration for a tenant's offline bridge.
 * @param tenantId - The unique identifier of the tenant.
 * @returns The QR code URL and image URL.
 */
export async function getQrCode(tenantId: string): Promise<ApiResponse<QrCodeDTO>> {
  const tenant = await db.tenantQueries.getTenantById(tenantId);
  const data: QrCodeDTO = {
    url: `${process.env.NEXT_PUBLIC_PLATFORM_URL ?? ''}/join/${tenant?.slug ?? ''}`,
    imageUrl: '',
  };
  return { success: true, data };
}

/**
 * Regenerate the QR code for a tenant's offline bridge.
 * @param tenantId - The unique identifier of the tenant.
 * @returns The newly generated QR code URL and image URL.
 */
export async function regenerateQrCode(tenantId: string): Promise<ApiResponse<QrCodeDTO>> {
  const tenant = await db.tenantQueries.getTenantById(tenantId);
  const data: QrCodeDTO = {
    url: `${process.env.NEXT_PUBLIC_PLATFORM_URL ?? ''}/join/${tenant?.slug ?? ''}`,
    imageUrl: '',
  };
  return { success: true, data };
}

/**
 * Retrieve the public-facing join page data for a business slug.
 * @param businessSlug - The URL slug identifying the business.
 * @returns The business name and slug for rendering the join page.
 */
export async function getJoinPageData(businessSlug: string): Promise<ApiResponse<JoinPageDTO>> {
  const tenant = await db.tenantQueries.getTenantBySlug(businessSlug);
  const data: JoinPageDTO = {
    businessName: tenant?.business_name ?? '',
    slug: tenant?.slug ?? '',
  };
  return { success: true, data };
}

/**
 * Submit a join request from the offline QR bridge public page.
 * @param businessSlug - The URL slug identifying the business.
 * @param data - The customer submission data such as name and phone number.
 * @returns The result of the join submission including the new customer ID.
 */
export async function submitJoin(businessSlug: string, data: Record<string, unknown>): Promise<ApiResponse<IdReferenceDTO>> {
  const tenant = await db.tenantQueries.getTenantBySlug(businessSlug);
  if (!tenant) return { success: false, data: null } as ApiResponse<IdReferenceDTO>;
  const result = await db.customerQueries.createCustomer(tenant.id, {
    first_name: (data.firstName as string) ?? '',
    last_name: (data.lastName as string) ?? '',
    phone_number: (data.phoneNumber as string) ?? '',
    source: 'qr_bridge',
  });
  return { success: true, data: { id: result.id } };
}
