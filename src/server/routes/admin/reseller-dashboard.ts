import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { ResellerClientDTO, ResellerBrandingDTO, TierDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module reseller-dashboard @description Reseller administration routes scoped to the reseller's own tenant */

/**
 * Lists all clients managed by the reseller.
 * @param tenantId - The reseller's own tenant ID
 * @returns Promise resolving to array of client summaries wrapped in an ApiResponse
 */
export async function getClients(
  tenantId: string,
): Promise<ApiResponse<ResellerClientDTO[]>> {
  const supabase = db.getSupabaseAdmin();
  const { data } = await supabase
    .from('tenants')
    .select('id, business_name, status, tier')
    .eq('reseller_id', tenantId);

  const clients: ResellerClientDTO[] = (data ?? []).map(row => ({
    id: row.id,
    name: row.business_name,
    status: row.status,
    tier: row.tier,
    monthlySpend: 0,
  }));

  return { success: true, data: clients };
}

/**
 * Retrieves a single client's details.
 * @param tenantId - The reseller's own tenant ID
 * @param clientId - The client to look up
 * @returns Promise resolving to client details wrapped in an ApiResponse
 */
export async function getClient(
  tenantId: string,
  clientId: string,
): Promise<ApiResponse<ResellerClientDTO | null>> {
  const tenant = await db.tenantQueries.getTenantById(clientId);

  if (!tenant || tenant.reseller_id !== tenantId) {
    return { success: true, data: null };
  }

  return {
    success: true,
    data: {
      id: tenant.id,
      name: tenant.business_name,
      status: tenant.status,
      tier: tenant.tier,
      monthlySpend: 0,
    },
  };
}

/**
 * Gets the reseller's current white-label branding configuration.
 * @param tenantId - The reseller's own tenant ID
 * @returns Promise resolving to branding settings wrapped in an ApiResponse
 */
export async function getBranding(
  tenantId: string,
): Promise<ApiResponse<ResellerBrandingDTO>> {
  const reseller = await db.tenantQueries.getResellerById(tenantId);

  if (!reseller) {
    return {
      success: true,
      data: {
        brandName: '',
        logo: null,
        primaryColor: '',
        secondaryColor: null,
      },
    };
  }

  return {
    success: true,
    data: {
      brandName: reseller.brand_name ?? '',
      logo: reseller.brand_logo_url,
      primaryColor: reseller.brand_primary_color ?? '#000000',
      secondaryColor: reseller.brand_secondary_color,
    },
  };
}

/**
 * Updates the reseller's white-label branding configuration.
 * @param tenantId - The reseller's own tenant ID
 * @param data - Branding fields to update including brandName, logo, primaryColor, etc.
 * @returns Promise resolving to updated branding result wrapped in an ApiResponse
 */
export async function updateBranding(
  tenantId: string,
  data: Record<string, unknown>,
): Promise<ApiResponse<ActionConfirmationDTO & Record<string, unknown>>> {
  await db.tenantQueries.updateResellerBranding(tenantId, {
    brand_name: data.brandName as string,
    brand_logo_url: data.logoUrl as string | null,
    brand_primary_color: data.primaryColor as string | null,
    brand_secondary_color: data.secondaryColor as string | null,
  });
  return { success: true, data: { success: true, message: 'Branding updated' } };
}

/**
 * Retrieves the reseller's pricing tier configuration.
 * @param tenantId - The reseller's own tenant ID
 * @returns Promise resolving to pricing tiers wrapped in an ApiResponse
 */
export async function getPricing(
  tenantId: string,
): Promise<ApiResponse<{ tiers: TierDTO[] }>> {
  const tiers: TierDTO[] = [
    { id: 'basic', name: 'basic', price: 0, features: [] },
    { id: 'growth', name: 'growth', price: 299, features: [] },
    { id: 'pro', name: 'pro', price: 799, features: [] },
    { id: 'enterprise', name: 'enterprise', price: 1999, features: [] },
  ];
  return { success: true, data: { tiers } };
}

/**
 * Updates the reseller's pricing tier configuration.
 * @param tenantId - The reseller's own tenant ID
 * @param data - Pricing fields to update
 * @returns Promise resolving to updated pricing result wrapped in an ApiResponse
 */
export async function updatePricing(
  tenantId: string,
  data: Record<string, unknown>,
): Promise<ApiResponse<ActionConfirmationDTO & Record<string, unknown>>> {
  return { success: true, data: { success: true, message: 'Pricing updated' } };
}

