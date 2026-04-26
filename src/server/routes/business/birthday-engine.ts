import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { BirthdayConfigDTO, BirthdayUpcomingDTO, BirthdayTokenDTO, BirthdayRedemptionStatsDTO, ActionConfirmationDTO } from '@/lib/api/schema';

/** @module birthday-engine @description Birthday reward automation — config-driven token generation with duplicate prevention, batch generation for upcoming birthdays, token expiry management, and staff-audited redemption. */

/** Default token expiry in days from generation date */
const DEFAULT_TOKEN_EXPIRY_DAYS = 7;

/** Default number of days before birthday to generate token */
const DEFAULT_DAYS_BEFORE = 7;

/** Default offer template */
const DEFAULT_OFFER_TEMPLATE = 'Happy Birthday! Enjoy a special treat on us.';

/**
 * Retrieve the birthday automation configuration for a tenant.
 * Reads from the business_profile row, falling back to defaults.
 * @param tenantId - The unique identifier of the tenant.
 * @returns The birthday config including auto-send settings and offer template.
 */
export async function getConfig(tenantId: string): Promise<ApiResponse<BirthdayConfigDTO>> {
  const profile = await db.businessQueries.getBusinessProfile(tenantId);
  const config: BirthdayConfigDTO = {
    autoSendEnabled: (profile?.birthday_auto_send as boolean) ?? true,
    daysBefore: (profile?.birthday_days_before as number) ?? DEFAULT_DAYS_BEFORE,
    offerTemplate: (profile?.birthday_offer_template as string) ?? DEFAULT_OFFER_TEMPLATE,
  };
  return { success: true, data: config };
}

/**
 * Update the birthday automation configuration for a tenant.
 * Persists the config fields to the business_profile row.
 * @param tenantId - The unique identifier of the tenant.
 * @param data - The configuration fields to update.
 * @returns The updated configuration echoed back.
 */
export async function updateConfig(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<ActionConfirmationDTO & Record<string, unknown>>> {
  // Map camelCase keys to snake_case for business_profile storage
  const profileData: Record<string, unknown> = {};
  if (data.autoSendEnabled !== undefined) profileData.birthday_auto_send = data.autoSendEnabled;
  if (data.daysBefore !== undefined) profileData.birthday_days_before = data.daysBefore;
  if (data.offerTemplate !== undefined) profileData.birthday_offer_template = data.offerTemplate;

  await db.businessQueries.upsertBusinessProfile(tenantId, profileData);

  // Return the effective config after update
  const updated = await getConfig(tenantId);
  return { success: true, data: { success: true, message: 'Config updated', ...updated.data } };
}

/**
 * Get a list of upcoming birthdays for customers of a tenant.
 * Returns customers whose next birthday falls within the next 30 days.
 * @param tenantId - The unique identifier of the tenant.
 * @returns Upcoming birthdays with customer details.
 */
export async function getUpcomingBirthdays(tenantId: string): Promise<ApiResponse<BirthdayUpcomingDTO>> {
  const result = await db.customerQueries.getUpcomingBirthdays(tenantId, 30);
  return { success: true, data: result };
}

/**
 * Generate a birthday reward token for a specific customer.
 * Enforces duplicate prevention: only one token per customer per year.
 * Uses the tenant's config for offer template and expiry days.
 * If a token already exists for this customer+year, returns the existing one.
 *
 * @param tenantId - The unique identifier of the tenant.
 * @param customerId - The unique identifier of the customer.
 * @returns The generated (or existing) token and its expiration date.
 */
export async function generateToken(tenantId: string, customerId: string): Promise<ApiResponse<BirthdayTokenDTO>> {
  const thisYear = new Date().getFullYear();

  // Check for existing token this year (duplicate prevention)
  const existing = await db.customerQueries.getBirthdayTokenForYear(tenantId, customerId, thisYear);
  if (existing) {
    return {
      success: true,
      data: {
        token: existing.token,
        offerDescription: existing.offer_description,
        expiresAt: existing.expires_at,
        redeemed: existing.redeemed,
      },
    };
  }

  // Load config for template and expiry
  const config = await getConfig(tenantId);
  const offerTemplate = config.data!.offerTemplate;
  const expiresAt = new Date(Date.now() + DEFAULT_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Create the token
  const row = await db.customerQueries.createBirthdayToken(
    tenantId,
    customerId,
    offerTemplate,
    expiresAt,
    thisYear,
  );

  return {
    success: true,
    data: {
      token: row.token,
      offerDescription: row.offer_description,
      expiresAt: row.expires_at,
      redeemed: row.redeemed,
    },
  };
}

/**
 * Batch-generate birthday tokens for all eligible customers whose birthday
 * falls within the configured "daysBefore" window AND who don't already
 * have a token for this year. Used by scheduled jobs (Worker).
 *
 * @param tenantId - The unique identifier of the tenant.
 * @returns Summary of tokens generated and skipped.
 */
export async function batchGenerateTokens(
  tenantId: string,
): Promise<ApiResponse<{ generated: number; skipped: number }>> {
  const config = await getConfig(tenantId);
  const daysBefore = config.data!.daysBefore;

  // Expire any old outstanding tokens first
  await db.customerQueries.expireOutstandingBirthdayTokens(tenantId);

  // Get customers needing tokens
  const customers = await db.customerQueries.getCustomersNeedingBirthdayTokens(tenantId, daysBefore);

  let generated = 0;
  let skipped = 0;
  const thisYear = new Date().getFullYear();
  const offerTemplate = config.data!.offerTemplate;
  const expiresAt = new Date(Date.now() + DEFAULT_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  for (const customer of customers) {
    // Double-check no token exists (race safety)
    const existing = await db.customerQueries.getBirthdayTokenForYear(tenantId, customer.id, thisYear);
    if (existing) {
      skipped++;
      continue;
    }

    await db.customerQueries.createBirthdayToken(
      tenantId,
      customer.id,
      offerTemplate,
      expiresAt,
      thisYear,
    );
    generated++;
  }

  return { success: true, data: { generated, skipped } };
}

/**
 * Redeem a birthday reward token on behalf of a staff member.
 * Validates that the token exists, has not expired, and has not already
 * been redeemed. Records the staff member who performed the redemption.
 *
 * @param tenantId - The unique identifier of the tenant.
 * @param token - The birthday reward token string to redeem.
 * @param redeemedByStaff - The identifier of the staff member redeeming the token.
 * @returns The redemption result with success/failure detail.
 */
export async function redeemToken(
  tenantId: string,
  token: string,
  redeemedByStaff: string,
): Promise<ApiResponse<{ success: boolean; redeemed: boolean; reason?: string }>> {
  // Look up the token
  const tokenRow = await db.customerQueries.getBirthdayToken(tenantId, token);

  if (!tokenRow) {
    return { success: false, data: { success: false, redeemed: false, reason: 'Token not found' } };
  }

  if (tokenRow.redeemed) {
    return { success: false, data: { success: false, redeemed: true, reason: 'Token already redeemed' } };
  }

  if (new Date(tokenRow.expires_at) < new Date()) {
    return { success: false, data: { success: false, redeemed: false, reason: 'Token has expired' } };
  }

  // Perform redemption with staff audit trail
  const supabase = db.getSupabaseAdmin();
  const { error } = await supabase
    .from('birthday_tokens')
    .update({
      redeemed: true,
      redeemed_at: new Date().toISOString(),
      redeemed_by_staff: redeemedByStaff,
    })
    .eq('tenant_id', tenantId)
    .eq('id', tokenRow.id);

  if (error) throw error;

  return { success: true, data: { success: true, redeemed: true } };
}

/**
 * Auto-dispatch birthday notifications for all eligible customers.
 * Respects the tenant's autoSendEnabled config. When enabled, generates
 * tokens AND creates a notification for each eligible customer.
 * Intended to be called by a scheduled Worker job.
 *
 * @param tenantId - The unique identifier of the tenant.
 * @returns Summary of tokens generated, notifications sent, and skips.
 */
export async function autoDispatch(
  tenantId: string,
): Promise<ApiResponse<{ generated: number; notified: number; skipped: number }>> {
  const config = await getConfig(tenantId);
  if (!config.data!.autoSendEnabled) {
    return { success: true, data: { generated: 0, notified: 0, skipped: 0 } };
  }

  const supabase = db.getSupabaseAdmin();

  // First, batch-generate tokens
  const tokenResult = await batchGenerateTokens(tenantId);
  const generated = tokenResult.data!.generated;

  // Get customers whose birthday falls within the configured window
  const customers = await db.customerQueries.getCustomersNeedingBirthdayTokens(
    tenantId,
    config.data!.daysBefore,
  );

  let notified = 0;

  for (const customer of customers) {
    const { error } = await supabase.from('notifications').insert({
      tenant_id: tenantId,
      type: 'birthday',
      title: 'Birthday coming up!',
      body: config.data!.offerTemplate,
      priority: 'normal',
      read: false,
    });
    if (!error) notified++;
  }

  return {
    success: true,
    data: {
      generated,
      notified,
      skipped: tokenResult.data!.skipped,
    },
  };
}

/**
 * Get birthday token redemption statistics for a tenant.
 * Aggregates total generated, redeemed, expired tokens and
 * computes the overall redemption rate.
 *
 * @param tenantId - The unique identifier of the tenant.
 * @returns Redemption stats including this-month breakdown.
 */
export async function getRedemptionStats(
  tenantId: string,
): Promise<ApiResponse<BirthdayRedemptionStatsDTO>> {
  const supabase = db.getSupabaseAdmin();
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [allResult, thisMonthResult] = await Promise.all([
    supabase.from('birthday_tokens').select('redeemed, expires_at').eq('tenant_id', tenantId),
    supabase.from('birthday_tokens').select('redeemed').eq('tenant_id', tenantId).gte('created_at', thisMonthStart),
  ]);

  if (allResult.error) throw allResult.error;
  if (thisMonthResult.error) throw thisMonthResult.error;

  const all = allResult.data ?? [];
  const thisMonth = thisMonthResult.data ?? [];
  const nowIso = now.toISOString();

  const totalGenerated = all.length;
  const totalRedeemed = all.filter(t => t.redeemed === true).length;
  const totalExpired = all.filter(t => !t.redeemed && t.expires_at < nowIso).length;
  const redemptionRate = totalGenerated > 0 ? Math.round((totalRedeemed / totalGenerated) * 100) : 0;

  const thisMonthGenerated = thisMonth.length;
  const thisMonthRedeemed = thisMonth.filter(t => t.redeemed === true).length;

  return {
    success: true,
    data: {
      totalGenerated,
      totalRedeemed,
      totalExpired,
      redemptionRate,
      thisMonthGenerated,
      thisMonthRedeemed,
    },
  };
}

/**
 * Get a birthday calendar view — all customers with birthdays mapped
 * to their upcoming date, sorted by days until birthday.
 *
 * @param tenantId - The unique identifier of the tenant.
 * @param params - Optional filter: months (lookahead window, default 12).
 * @returns Array of calendar entries with customer name and upcoming date.
 */
export async function getBirthdayCalendar(
  tenantId: string,
  params?: Record<string, unknown>,
): Promise<ApiResponse<Array<{ customerId: string; firstName: string; lastName: string | null; nextBirthday: string; daysUntil: number }>>> {
  const months = Number(params?.months ?? 12);
  const days = months * 30;
  const upcoming = await db.customerQueries.getUpcomingBirthdays(tenantId, days);

  const thisYear = new Date().getFullYear();
  const now = new Date();

  const calendar = upcoming.upcoming.map(c => {
    const nextDate = new Date(thisYear, 0, 1);
    // Reconstruct from the daysUntil to get the actual date
    const target = new Date(now.getTime() + c.daysUntil * 24 * 60 * 60 * 1000);
    return {
      customerId: c.customerId,
      firstName: c.firstName,
      lastName: null,
      nextBirthday: target.toISOString().split('T')[0],
      daysUntil: c.daysUntil,
    };
  });

  return { success: true, data: calendar };
}

