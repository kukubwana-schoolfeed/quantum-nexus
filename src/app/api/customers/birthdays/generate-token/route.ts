import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { BirthdayTokenDTO } from '@/lib/api/schema';

export async function POST(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const body = await req.json();
    const { customerId } = body as { customerId: string };

    if (!customerId) {
      return apiError('Missing required field: customerId', 400);
    }

    const supabase = getSupabaseAdminClient();

    // Verify customer exists and has birthday data
    const { data: customer, error: custError } = await supabase
      .from('customers')
      .select('id, birth_month, birth_day, birth_year')
      .eq('id', customerId)
      .eq('tenant_id', tid)
      .maybeSingle();

    if (custError) {
      console.error('[BirthdayToken] Failed to look up customer:', custError.message);
      return apiError('Failed to look up customer');
    }

    if (!customer) {
      return apiError('Customer not found', 404);
    }

    if (!customer.birth_month || !customer.birth_day) {
      return apiError('Customer does not have birthday data', 400);
    }

    // Determine the current birthday year for this run
    const now = new Date();
    const currentYear = now.getFullYear();
    const birthYearThisRun = customer.birth_year ?? currentYear;

    // Build offer description and expiry
    const offerDescription = 'Happy Birthday! Enjoy a special offer on your next visit.';
    const birthdayThisYear = new Date(currentYear, (customer.birth_month as number) - 1, customer.birth_day as number);
    // Token expires 7 days after the birthday (or 7 days from now if birthday already passed)
    const expiresAt = new Date(
      birthdayThisYear < now
        ? new Date(currentYear + 1, (customer.birth_month as number) - 1, customer.birth_day as number).getTime() + 7 * 24 * 60 * 60 * 1000
        : birthdayThisYear.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    // Insert birthday token
    const { data: tokenRow, error: insertError } = await supabase
      .from('birthday_tokens')
      .insert({
        tenant_id: tid,
        customer_id: customerId,
        birth_year_this_run: birthYearThisRun,
        offer_description: offerDescription,
        expires_at: expiresAt.toISOString(),
        redeemed: false,
      })
      .select('token, offer_description, expires_at, redeemed')
      .single();

    if (insertError) {
      console.error('[BirthdayToken] Failed to generate token:', insertError.message);
      return apiError('Failed to generate birthday token');
    }

    const result: BirthdayTokenDTO = {
      token: tokenRow.token,
      offerDescription: tokenRow.offer_description,
      expiresAt: tokenRow.expires_at,
      redeemed: tokenRow.redeemed,
    };

    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to generate token');
  }
}
