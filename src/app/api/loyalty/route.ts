import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import type { LoyaltyBalanceDTO, LoyaltyTransactionDTO } from '@/lib/api/schema';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    // Get customerId from query params
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return apiError('Missing required query param: customerId', 400);
    }

    // Fetch customer loyalty balance
    const { data: customer, error: custError } = await supabase
      .from('customers')
      .select('loyalty_points, tier')
      .eq('id', customerId)
      .eq('tenant_id', tid)
      .maybeSingle();

    if (custError) {
      console.error('[Loyalty] Failed to fetch customer:', custError.message);
      return apiResponse({
        balance: { points: 0, tier: 'standard' } as LoyaltyBalanceDTO,
        transactions: [] as LoyaltyTransactionDTO[],
      });
    }

    const balance: LoyaltyBalanceDTO = {
      points: customer?.loyalty_points ?? 0,
      tier: customer?.tier ?? 'standard',
    };

    // Fetch loyalty transaction history
    const { data: txData, error: txError } = await supabase
      .from('loyalty_transactions')
      .select('id, type, points, balance_after, description, created_at')
      .eq('tenant_id', tid)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (txError) {
      console.error('[Loyalty] Failed to fetch transactions:', txError.message);
      return apiResponse({ balance, transactions: [] });
    }

    const transactions: LoyaltyTransactionDTO[] = (txData ?? []).map((row) => ({
      id: row.id,
      type: row.type,
      points: row.points,
      balanceAfter: row.balance_after,
      description: row.description,
      createdAt: row.created_at,
    }));

    return apiResponse({ balance, transactions });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load loyalty data');
  }
}
