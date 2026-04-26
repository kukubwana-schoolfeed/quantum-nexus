import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { MOCK_DATA } from '@/lib/api/mock-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId } = body as { message: string; conversationId?: string };
    if (!message?.trim()) {
      return apiError('Message is required', 400);
    }
    const result = MOCK_DATA.aiBubbleAssistant.sendMessage(getTenantId(req), message, conversationId);
    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to send message');
  }
}

export async function GET(req: NextRequest) {
  try {
    const conversationId = req.nextUrl.searchParams.get('conversationId');
    if (!conversationId) {
      return apiError('conversationId is required', 400);
    }
    const result = MOCK_DATA.aiBubbleAssistant.getConversation(getTenantId(req), conversationId);
    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load conversation');
  }
}
