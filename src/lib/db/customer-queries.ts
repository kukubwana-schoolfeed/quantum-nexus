/**
 * Customer Query Module
 * @module customer-queries
 * @description Typed Supabase query layer for customers, loyalty_transactions,
 * and birthday_tokens tables. Every query enforces tenant_id filtering.
 * RULE D-3: Customer DOB fields (birth_day, birth_month, birth_year) are NEVER
 * sent to the frontend in full. They are mapped to has_birthday,
 * birthdayThisMonth, and daysUntilBirthday via mapRowToDTO.
 */

import { getSupabaseAdmin } from '@/lib/db/client';
import type { CustomerRow, LoyaltyTransactionRow, BirthdayTokenRow } from '@/lib/db/types';
import type {
  CustomerDTO,
  LoyaltyBalanceDTO,
  LoyaltyTransactionDTO,
  BirthdayTokenDTO,
  BirthdayUpcomingDTO,
  ActionConfirmationDTO,
} from '@/lib/api/schema';

// ─── Internal helpers (not exported) ─────────────────────────────────

/**
 * Computes derived birthday fields from a CustomerRow without exposing
 * raw birth_day, birth_month, or birth_year values.
 *
 * @param row - The raw CustomerRow from Supabase
 * @returns An object with hasBirthday, birthdayThisMonth, and daysUntilBirthday
 */
function computeBirthdayFields(row: CustomerRow): {
  hasBirthday: boolean;
  birthdayThisMonth: boolean;
  daysUntilBirthday: number | null;
} {
  if (!row.birth_day || !row.birth_month) {
    return { hasBirthday: false, birthdayThisMonth: false, daysUntilBirthday: null };
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const hasBirthday = true;
  const birthdayThisMonth = row.birth_month === currentMonth;

  let daysUntilBirthday: number | null = null;
  const thisYear = now.getFullYear();
  let nextBirthday = new Date(thisYear, row.birth_month - 1, row.birth_day);
  if (nextBirthday < now) {
    nextBirthday = new Date(thisYear + 1, row.birth_month - 1, row.birth_day);
  }
  daysUntilBirthday = Math.ceil(
    (nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return { hasBirthday, birthdayThisMonth, daysUntilBirthday };
}

/**
 * Maps a CustomerRow to a CustomerDTO, applying RULE D-3 to strip
 * raw DOB fields and replace them with computed birthday fields.
 *
 * @param row - The raw CustomerRow from Supabase
 * @returns A CustomerDTO safe for frontend consumption
 */
function mapRowToDTO(row: CustomerRow): CustomerDTO {
  const birthday = computeBirthdayFields(row);
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phoneNumber: row.phone_number,
    email: row.email,
    source: row.source ?? 'manual',
    ...birthday,
    loyaltyPoints: row.loyalty_points,
    tier: row.tier,
    totalSpend: Number(row.total_spend),
    visitCount: row.visit_count,
    status: row.status,
  };
}

// ─── Exported query functions ────────────────────────────────────────

/**
 * List customers for a tenant with pagination and optional filters.
 * Supports filtering by status, tier, and a search term that matches
 * against first_name or phone_number (case-insensitive).
 *
 * @param tenantId - The tenant to scope results to
 * @param params - Pagination and filter parameters: page, pageSize, status, tier, search
 * @returns An object containing the mapped CustomerDTO array and total count
 */
export async function listCustomers(
  tenantId: string,
  params: Record<string, unknown>
): Promise<{ data: CustomerDTO[]; total: number }> {
  const supabase = getSupabaseAdmin();
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 20);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenantId);

  if (params.status) {
    query = query.eq('status', params.status as string);
  }

  if (params.tier) {
    query = query.eq('tier', params.tier as string);
  }

  if (params.search) {
    const term = `%${params.search}%`;
    query = query.or(`first_name.ilike.${term},phone_number.ilike.${term}`);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: (data as CustomerRow[]).map(mapRowToDTO),
    total: count ?? 0,
  };
}

/**
 * Fetch a single customer by ID within a tenant.
 *
 * @param tenantId - The tenant to scope the query to
 * @param customerId - The customer's unique ID
 * @returns The mapped CustomerDTO, or null if not found
 */
export async function getCustomer(
  tenantId: string,
  customerId: string
): Promise<CustomerDTO | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', customerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return mapRowToDTO(data as CustomerRow);
}

/**
 * Create a new customer within a tenant.
 *
 * @param tenantId - The tenant the customer belongs to
 * @param data - Partial CustomerRow fields to insert
 * @returns The newly created customer mapped to CustomerDTO
 */
export async function createCustomer(
  tenantId: string,
  data: Partial<CustomerRow>
): Promise<CustomerDTO> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('customers')
    .insert({ ...data, tenant_id: tenantId })
    .select()
    .single();

  if (error) throw error;

  return mapRowToDTO(row as CustomerRow);
}

/**
 * Update an existing customer within a tenant.
 *
 * @param tenantId - The tenant the customer belongs to
 * @param customerId - The customer's unique ID
 * @param data - Partial CustomerRow fields to update
 * @returns The updated customer mapped to CustomerDTO
 */
export async function updateCustomer(
  tenantId: string,
  customerId: string,
  data: Partial<CustomerRow>
): Promise<CustomerDTO> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('customers')
    .update(data)
    .eq('tenant_id', tenantId)
    .eq('id', customerId)
    .select()
    .single();

  if (error) throw error;

  return mapRowToDTO(row as CustomerRow);
}

/**
 * Delete a customer from a tenant.
 *
 * @param tenantId - The tenant the customer belongs to
 * @param customerId - The customer's unique ID
 * @returns An ActionConfirmationDTO indicating success or failure
 */
export async function deleteCustomer(
  tenantId: string,
  customerId: string
): Promise<ActionConfirmationDTO> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('id', customerId);

  if (error) throw error;

  return { success: true, message: 'Customer deleted' };
}

/**
 * Count the number of customers created today for a tenant.
 *
 * @param tenantId - The tenant to scope the count to
 * @returns The number of customers created since the start of today
 */
export async function countCustomersToday(tenantId: string): Promise<number> {
  const supabase = getSupabaseAdmin();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const { count, error } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('created_at', startOfToday);

  if (error) throw error;

  return count ?? 0;
}

/**
 * Get upcoming birthdays within a given number of days for a tenant.
 * Queries customers that have birth_month and birth_day set, then
 * filters in JavaScript to find those whose next birthday falls
 * within the specified window.
 *
 * @param tenantId - The tenant to scope the query to
 * @param days - The number of days ahead to look for upcoming birthdays
 * @returns A BirthdayUpcomingDTO with the list of upcoming birthdays and count
 */
export async function getUpcomingBirthdays(
  tenantId: string,
  days: number
): Promise<BirthdayUpcomingDTO> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('customers')
    .select('id, first_name, birth_day, birth_month')
    .eq('tenant_id', tenantId)
    .not('birth_month', 'is', null)
    .not('birth_day', 'is', null);

  if (error) throw error;

  const now = new Date();
  const thisYear = now.getFullYear();

  const upcoming = (data as Pick<CustomerRow, 'id' | 'first_name' | 'birth_day' | 'birth_month'>[])
    .filter((row) => {
      if (!row.birth_day || !row.birth_month) return false;

      let nextBirthday = new Date(thisYear, row.birth_month - 1, row.birth_day);
      if (nextBirthday < now) {
        nextBirthday = new Date(thisYear + 1, row.birth_month - 1, row.birth_day);
      }

      const daysUntil = Math.ceil(
        (nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntil <= days;
    })
    .map((row) => {
      let nextBirthday = new Date(thisYear, row.birth_month! - 1, row.birth_day!);
      if (nextBirthday < now) {
        nextBirthday = new Date(thisYear + 1, row.birth_month! - 1, row.birth_day!);
      }
      const daysUntil = Math.ceil(
        (nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        customerId: row.id,
        firstName: row.first_name,
        daysUntil,
      };
    });

  return { upcoming, count: upcoming.length };
}

/**
 * Get the loyalty balance (points and tier) for a customer.
 *
 * @param tenantId - The tenant the customer belongs to
 * @param customerId - The customer's unique ID
 * @returns A LoyaltyBalanceDTO with points and tier
 */
export async function getLoyaltyBalance(
  tenantId: string,
  customerId: string
): Promise<LoyaltyBalanceDTO> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('customers')
    .select('loyalty_points, tier')
    .eq('tenant_id', tenantId)
    .eq('id', customerId)
    .single();

  if (error) throw error;

  const row = data as Pick<CustomerRow, 'loyalty_points' | 'tier'>;
  return {
    points: row.loyalty_points,
    tier: row.tier,
  };
}

/**
 * List loyalty transactions for a customer with optional pagination.
 *
 * @param tenantId - The tenant to scope the query to
 * @param customerId - The customer whose transactions to fetch
 * @param params - Optional pagination parameters: page, pageSize
 * @returns An array of LoyaltyTransactionDTO objects
 */
export async function listLoyaltyTransactions(
  tenantId: string,
  customerId: string,
  params?: Record<string, unknown>
): Promise<LoyaltyTransactionDTO[]> {
  const supabase = getSupabaseAdmin();

  const page = Number(params?.page ?? 1);
  const pageSize = Number(params?.pageSize ?? 20);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return (data as LoyaltyTransactionRow[]).map((row) => ({
    id: row.id,
    type: row.type,
    points: row.points,
    balanceAfter: row.balance_after,
    description: row.description,
    createdAt: row.created_at,
  }));
}

/**
 * Create a new loyalty transaction for a customer.
 *
 * @param tenantId - The tenant the transaction belongs to
 * @param customerId - The customer the transaction is for
 * @param data - Partial LoyaltyTransactionRow fields to insert
 * @returns The raw LoyaltyTransactionRow as inserted
 */
export async function createLoyaltyTransaction(
  tenantId: string,
  customerId: string,
  data: Partial<LoyaltyTransactionRow>
): Promise<LoyaltyTransactionRow> {
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from('loyalty_transactions')
    .insert({ ...data, tenant_id: tenantId, customer_id: customerId })
    .select()
    .single();

  if (error) throw error;

  return row as LoyaltyTransactionRow;
}

/**
 * Look up a birthday token by its token string.
 * The token is globally unique, but tenant_id is still verified.
 *
 * @param tenantId - The tenant to scope the query to
 * @param token - The unique token string to look up
 * @returns The BirthdayTokenRow if found, or null
 */
export async function getBirthdayToken(
  tenantId: string,
  token: string
): Promise<BirthdayTokenRow | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('birthday_tokens')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('token', token)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as BirthdayTokenRow;
}

/**
 * Redeem a birthday token by marking it as redeemed.
 *
 * @param tenantId - The tenant the token belongs to
 * @param tokenId - The birthday token's unique ID
 * @returns An ActionConfirmationDTO indicating success or failure
 */
export async function redeemBirthdayToken(
  tenantId: string,
  tokenId: string
): Promise<ActionConfirmationDTO> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('birthday_tokens')
    .update({ redeemed: true, redeemed_at: new Date().toISOString() })
    .eq('tenant_id', tenantId)
    .eq('id', tokenId);

  if (error) throw error;

  return { success: true, message: 'Birthday token redeemed' };
}

// ─── Retention-layer query functions ──────────────────────────────────

/**
 * Atomically adjust a customer's loyalty_points and update their tier.
 * Returns the new balance after the update.
 *
 * @param tenantId - The tenant the customer belongs to
 * @param customerId - The customer's unique ID
 * @param pointsDelta - The points to add (positive) or subtract (negative)
 * @returns The new loyalty_points balance
 */
export async function adjustLoyaltyPoints(
  tenantId: string,
  customerId: string,
  pointsDelta: number,
): Promise<number> {
  const supabase = getSupabaseAdmin();

  // Use an RPC-like pattern: read current, compute new, update
  const { data: customer, error: fetchError } = await supabase
    .from('customers')
    .select('loyalty_points, tier')
    .eq('tenant_id', tenantId)
    .eq('id', customerId)
    .single();

  if (fetchError) throw fetchError;

  const currentPoints = (customer as Pick<CustomerRow, 'loyalty_points' | 'tier'>).loyalty_points;
  const newPoints = Math.max(0, currentPoints + pointsDelta);

  // Auto tier upgrade based on points thresholds
  let newTier: CustomerRow['tier'] = (customer as Pick<CustomerRow, 'loyalty_points' | 'tier'>).tier;
  if (newPoints >= 5000) newTier = 'vip';
  else if (newPoints >= 1000) newTier = 'priority';
  else newTier = 'standard';

  const { error: updateError } = await supabase
    .from('customers')
    .update({ loyalty_points: newPoints, tier: newTier })
    .eq('tenant_id', tenantId)
    .eq('id', customerId);

  if (updateError) throw updateError;

  return newPoints;
}

/**
 * Check if a birthday token already exists for a customer in the current year.
 * Prevents duplicate token generation.
 *
 * @param tenantId - The tenant the customer belongs to
 * @param customerId - The customer's unique ID
 * @param year - The year to check for
 * @returns The existing BirthdayTokenRow if found, or null
 */
export async function getBirthdayTokenForYear(
  tenantId: string,
  customerId: string,
  year: number,
): Promise<BirthdayTokenRow | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('birthday_tokens')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('customer_id', customerId)
    .eq('birth_year_this_run', year)
    .maybeSingle();

  if (error) throw error;

  return data as BirthdayTokenRow | null;
}

/**
 * Create a birthday token for a customer with explicit parameters.
 *
 * @param tenantId - The tenant the token belongs to
 * @param customerId - The customer the token is for
 * @param offerDescription - The offer text for the token
 * @param expiresAt - ISO timestamp when the token expires
 * @param birthYearThisRun - The year this birthday run is for
 * @returns The created BirthdayTokenRow
 */
export async function createBirthdayToken(
  tenantId: string,
  customerId: string,
  offerDescription: string,
  expiresAt: string,
  birthYearThisRun: number,
): Promise<BirthdayTokenRow> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('birthday_tokens')
    .insert({
      tenant_id: tenantId,
      customer_id: customerId,
      offer_description: offerDescription,
      expires_at: expiresAt,
      birth_year_this_run: birthYearThisRun,
    })
    .select()
    .single();

  if (error) throw error;

  return data as BirthdayTokenRow;
}

/**
 * Expire all un-redeemed, non-expired birthday tokens that are past their
 * expires_at timestamp. Returns count of expired tokens.
 *
 * @param tenantId - The tenant to expire tokens for
 * @returns The number of tokens expired
 */
export async function expireOutstandingBirthdayTokens(
  tenantId: string,
): Promise<number> {
  const supabase = getSupabaseAdmin();

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('birthday_tokens')
    .update({ redeemed: true })
    .eq('tenant_id', tenantId)
    .eq('redeemed', false)
    .lt('expires_at', now)
    .select();

  if (error) throw error;

  return data?.length ?? 0;
}

/**
 * Get customers whose birthday falls within the next N days AND who do not
 * already have a token generated for this year.
 *
 * @param tenantId - The tenant to query
 * @param days - The lookahead window in days
 * @returns Array of customers needing birthday tokens
 */
export async function getCustomersNeedingBirthdayTokens(
  tenantId: string,
  days: number,
): Promise<Array<{ id: string; first_name: string; birth_day: number; birth_month: number }>> {
  const supabase = getSupabaseAdmin();
  const thisYear = new Date().getFullYear();

  // Get customers with birthdays in the window
  const { data: customers, error: custError } = await supabase
    .from('customers')
    .select('id, first_name, birth_day, birth_month')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .not('birth_month', 'is', null)
    .not('birth_day', 'is', null);

  if (custError) throw custError;

  // Get tokens already generated this year
  const { data: existingTokens, error: tokenError } = await supabase
    .from('birthday_tokens')
    .select('customer_id')
    .eq('tenant_id', tenantId)
    .eq('birth_year_this_run', thisYear);

  if (tokenError) throw tokenError;

  const alreadyHasToken = new Set((existingTokens ?? []).map(t => t.customer_id));

  const now = new Date();

  const needingTokens = (customers ?? [])
    .filter(c => {
      if (!c.birth_day || !c.birth_month) return false;
      if (alreadyHasToken.has(c.id)) return false;

      let nextBirthday = new Date(thisYear, c.birth_month - 1, c.birth_day);
      if (nextBirthday < now) {
        nextBirthday = new Date(thisYear + 1, c.birth_month - 1, c.birth_day);
      }

      const daysUntil = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= days;
    });

  return needingTokens as Array<{ id: string; first_name: string; birth_day: number; birth_month: number }>;
}

/**
 * Update a customer's total_spend and visit_count atomically.
 *
 * @param tenantId - The tenant the customer belongs to
 * @param customerId - The customer's unique ID
 * @param spendAmount - The amount to add to total_spend
 * @returns The updated CustomerRow
 */
export async function incrementCustomerSpend(
  tenantId: string,
  customerId: string,
  spendAmount: number,
): Promise<CustomerRow> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('customers')
    .update({
      total_spend: spendAmount,
      visit_count: 1,
    })
    .eq('tenant_id', tenantId)
    .eq('id', customerId)
    .select()
    .single();

  if (error) throw error;

  return data as CustomerRow;
}
