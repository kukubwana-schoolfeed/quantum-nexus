import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { CustomerDTO, ActionConfirmationDTO, ImportResultDTO, BirthdayUpcomingDTO } from '@/lib/api/schema';

/** @module customer-database @description Customer CRUD, bulk import, and birthday lookup routes for tenant businesses */

/**
 * Retrieves a paginated list of customers for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to an array of customer entries
 */
export async function getCustomers(tenantId: string, params: Record<string, unknown>): Promise<ApiResponse<CustomerDTO[]>> {
  const { data } = await db.customerQueries.listCustomers(tenantId, params);
  return { success: true, data };
}

/**
 * Retrieves a single customer by their identifier.
 * @param tenantId - The unique identifier of the tenant
 * @param customerId - The unique identifier of the customer
 * @returns Promise resolving to the customer entry or null
 */
export async function getCustomer(tenantId: string, customerId: string): Promise<ApiResponse<CustomerDTO | null>> {
  const result = await db.customerQueries.getCustomer(tenantId, customerId);
  return { success: true, data: result };
}

/**
 * Creates a new customer record.
 * @param tenantId - The unique identifier of the tenant
 * @param data - The customer fields to create
 * @returns Promise resolving to the newly created customer
 */
export async function createCustomer(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<CustomerDTO>> {
  const result = await db.customerQueries.createCustomer(tenantId, data);
  return { success: true, data: result };
}

/**
 * Updates an existing customer record.
 * @param tenantId - The unique identifier of the tenant
 * @param customerId - The unique identifier of the customer to update
 * @param data - The fields to update on the customer
 * @returns Promise resolving to the update result
 */
export async function updateCustomer(tenantId: string, customerId: string, data: Record<string, unknown>): Promise<ApiResponse<ActionConfirmationDTO & Record<string, unknown>>> {
  const result = await db.customerQueries.updateCustomer(tenantId, customerId, data);
  return { success: true, data: { success: true, ...result } };
}

/**
 * Deletes a customer record.
 * @param tenantId - The unique identifier of the tenant
 * @param customerId - The unique identifier of the customer to delete
 * @returns Promise resolving to the deletion result
 */
export async function deleteCustomer(tenantId: string, customerId: string): Promise<ApiResponse<ActionConfirmationDTO>> {
  await db.customerQueries.deleteCustomer(tenantId, customerId);
  return { success: true, data: { success: true, message: 'Customer deleted' } };
}

/**
 * Imports customers in bulk from a file or data payload.
 * @param tenantId - The unique identifier of the tenant
 * @param data - The import payload including customer records and format options
 * @returns Promise resolving to the import result with success/failure counts
 */
export async function importCustomers(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<ImportResultDTO>> {
  const records = (data.records ?? []) as Record<string, unknown>[];
  let importedCount = 0;
  let failedCount = 0;
  const errors: Array<{ row: number; reason: string }> = [];

  for (let i = 0; i < records.length; i++) {
    try {
      await db.customerQueries.createCustomer(tenantId, records[i]);
      importedCount++;
    } catch (err) {
      failedCount++;
      errors.push({ row: i + 1, reason: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  return { success: true, data: { importedCount, failedCount, errors } };
}

/**
 * Retrieves customers with upcoming birthdays.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to upcoming birthday data
 */
export async function getBirthdayUpcoming(tenantId: string): Promise<ApiResponse<BirthdayUpcomingDTO>> {
  const result = await db.customerQueries.getUpcomingBirthdays(tenantId, 30);
  return { success: true, data: result };
}
