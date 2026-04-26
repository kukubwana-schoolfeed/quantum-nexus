import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getHealth } from '@/server/routes/admin/platform-health-monitor';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function GET(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const health = await getHealth(tid);
    const queues = {
      content: MOCK_DATA.bullmqJobRegistry.getQueueStatus(tid, ''),
      publishing: MOCK_DATA.bullmqJobRegistry.getQueueStatus(tid, ''),
      aiScene: MOCK_DATA.bullmqJobRegistry.getQueueStatus(tid, ''),
      analyticsSeo: MOCK_DATA.bullmqJobRegistry.getQueueStatus(tid, ''),
    };
    return apiResponse({ health: health.data, queues });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load admin health');
  }
}

