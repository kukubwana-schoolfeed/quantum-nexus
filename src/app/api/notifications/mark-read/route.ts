import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function POST(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const body = await req.json();
    const { notificationId } = body as { notificationId: string };

    if (!notificationId) {
      return apiError('Missing required field: notificationId', 400);
    }

    const result = MOCK_DATA.notificationEngine.markRead(tid, notificationId);
    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to mark notification as read');
  }
}
