import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import { generateContent } from '@/lib/integrations/ai/vertex-claude';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId } = body as { message: string; conversationId?: string };
    if (!message?.trim()) {
      return apiError('Message is required', 400);
    }

    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const { data: conv, error: convError } = await supabase
        .from('bubble_conversations')
        .insert({ tenant_id: tenantId })
        .select('id')
        .single();

      if (convError || !conv) {
        console.error('[ai-bubble/chat] Failed to create conversation:', convError?.message);
        return apiError('Failed to create conversation');
      }
      convId = conv.id;
    }

    // Store user message
    await supabase
      .from('bubble_messages')
      .insert({
        tenant_id: tenantId,
        conversation_id: convId,
        role: 'user',
        content: message,
      });

    // Generate AI response
    let assistantContent: string;
    try {
      const aiResponse = await generateContent({
        prompt: message,
        systemPrompt: 'You are a helpful AI assistant for the Quantum Nexus platform. Provide concise, actionable responses.',
        tenantId,
        maxTokens: 1024,
      });
      assistantContent = aiResponse.content;
    } catch (aiError) {
      console.error('[ai-bubble/chat] AI generation failed:', aiError instanceof Error ? aiError.message : aiError);
      assistantContent = 'Sorry, I was unable to generate a response. Please try again.';
    }

    // Store assistant message
    await supabase
      .from('bubble_messages')
      .insert({
        tenant_id: tenantId,
        conversation_id: convId,
        role: 'assistant',
        content: assistantContent,
      });

    return apiResponse({ response: assistantContent, conversationId: convId });
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

    const tenantId = getTenantId(req);
    const supabase = getSupabaseAdminClient();

    // Verify conversation belongs to tenant
    const { data: conv, error: convError } = await supabase
      .from('bubble_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (convError || !conv) {
      return apiResponse({ messages: [], conversationId });
    }

    // Fetch messages for this conversation
    const { data: messages, error: msgError } = await supabase
      .from('bubble_messages')
      .select('role, content, created_at')
      .eq('conversation_id', conversationId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('[ai-bubble/chat] Failed to fetch messages:', msgError.message);
      return apiResponse({ messages: [], conversationId });
    }

    const result = {
      messages: (messages ?? []).map((m: Record<string, unknown>) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content as string,
        timestamp: m.created_at as string,
      })),
      conversationId,
    };

    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load conversation');
  }
}
