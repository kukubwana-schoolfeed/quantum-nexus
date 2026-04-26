import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function POST(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const result = MOCK_DATA.notificationEngine.markAllRead(tid);
    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to mark all notifications as read');
  }
}
