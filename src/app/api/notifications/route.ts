import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const notifications = MOCK_DATA.notificationEngine.getNotifications(tid, {});
    return apiResponse(notifications);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load notifications');
  }
}
