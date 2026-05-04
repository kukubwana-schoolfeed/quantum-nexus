import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { LoyaltyBalanceDTO } from '@/lib/api/schema';

export async function POST(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const body = await req.json();
    const { customerId, points, description } = body as {
      customerId: string;
      points: number;
      description: string;
    };

    if (!customerId) {
      return apiError('Missing required field: customerId', 400);
    }

    if (!points || points <= 0) {
      return apiError('Points must be a positive number', 400);
    }

    const supabase = getSupabaseAdminClient();

    // Fetch current customer loyalty data
    const { data: customer, error: custError } = await supabase
      .from('customers')
      .select('id, loyalty_points, tier')
      .eq('id', customerId)
      .eq('tenant_id', tid)
      .maybeSingle();

    if (custError) {
      console.error('[LoyaltyRedeem] Failed to fetch customer:', custError.message);
      return apiError('Failed to fetch customer');
    }

    if (!customer) {
      return apiError('Customer not found', 404);
    }

    const currentPoints = customer.loyalty_points ?? 0;
    if (currentPoints < points) {
      return apiError('Insufficient loyalty points', 400);
    }

    const newBalance = currentPoints - points;

    // Deduct points from customer
    const { error: updateError } = await supabase
      .from('customers')
      .update({ loyalty_points: newBalance })
      .eq('id', customerId);

    if (updateError) {
      console.error('[LoyaltyRedeem] Failed to update points:', updateError.message);
      return apiError('Failed to redeem points');
    }

    // Create loyalty transaction record
    await supabase.from('loyalty_transactions').insert({
      tenant_id: tid,
      customer_id: customerId,
      type: 'redeem',
      points,
      balance_after: newBalance,
      description: description ?? 'Redemption',
    });

    const result: LoyaltyBalanceDTO = {
      points: newBalance,
      tier: customer.tier ?? 'standard',
    };

    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to redeem points');
  }
}
