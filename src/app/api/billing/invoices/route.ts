import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getInvoices } from '@/server/routes/platform-core/billing-engine';

export async function GET(req: NextRequest) {
  try {
    const result = await getInvoices(getTenantId(req));
    return apiResponse(result.data);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load invoices');
  }
}
