import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { ActionConfirmationDTO } from '@/lib/api/schema';

export async function POST(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const body = await req.json();
    const { token } = body as { token: string };

    if (!token) {
      return apiError('Missing required field: token', 400);
    }

    const supabase = getSupabaseAdminClient();

    // Look up the token
    const { data: tokenRow, error: findError } = await supabase
      .from('birthday_tokens')
      .select('id, token, redeemed, expires_at, tenant_id')
      .eq('token', token)
      .eq('tenant_id', tid)
      .maybeSingle();

    if (findError) {
      console.error('[BirthdayRedeem] Failed to look up token:', findError.message);
      return apiError('Failed to look up token');
    }

    if (!tokenRow) {
      return apiError('Token not found', 404);
    }

    if (tokenRow.redeemed) {
      return apiError('Token has already been redeemed', 400);
    }

    // Check expiry
    if (new Date(tokenRow.expires_at) < new Date()) {
      return apiError('Token has expired', 400);
    }

    // Mark as redeemed
    const { error: updateError } = await supabase
      .from('birthday_tokens')
      .update({ redeemed: true, redeemed_at: new Date().toISOString() })
      .eq('id', tokenRow.id);

    if (updateError) {
      console.error('[BirthdayRedeem] Failed to redeem token:', updateError.message);
      return apiError('Failed to redeem token');
    }

    const result: ActionConfirmationDTO = { success: true };
    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to redeem token');
  }
}
