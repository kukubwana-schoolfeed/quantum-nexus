import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const config = MOCK_DATA.birthdayEngine.getConfig(tid);
    const upcoming = MOCK_DATA.customerDatabase.getBirthdayUpcoming(tid);
    return apiResponse({ config, upcoming });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load birthday data');
  }
}
