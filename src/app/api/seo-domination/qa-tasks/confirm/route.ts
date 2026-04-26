import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function POST(req: NextRequest) {
  try {
    const tid = getTenantId(req);
    const body = await req.json();
    const { taskId } = body as { taskId: string };

    if (!taskId) {
      return apiError('Missing required field: taskId', 400);
    }

    const result = MOCK_DATA.seoDominationEngine.confirmQuestionPosted(tid, taskId);
    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to confirm QA task');
  }
}
