/**
 * WHATSAPP_BUSINESS_API — WhatsApp messaging integration
 *
 * PURPOSE: Customer messaging, broadcast delivery, business notification delivery,
 * birthday messages, review requests, follow-ups,
 * Q&A task notifications to business owner.
 *
 * AUTH METHOD: Meta Business API. Uses WHATSAPP_ACCESS_TOKEN and
 * WHATSAPP_PHONE_NUMBER_ID env vars for the Business Account.
 *
 * RATE LIMITS: Per Meta WhatsApp Business API documentation.
 * Conversation-based pricing applies.
 *
 * WORKER: Worker 2
 * PHASE: 5 (real connection)
 */

// --- Types ---

export interface WhatsAppSendMessageParams {
  to: string;
  message: string;
  templateId?: string;
  templateParams?: string[];
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'video' | 'audio';
  tenantId: string;
}

export interface WhatsAppBroadcastParams {
  recipients: string[];
  message: string;
  templateId?: string;
  templateParams?: string[];
  tenantId: string;
}

export interface WhatsAppMessageStatusParams {
  messageId: string;
  tenantId: string;
}

export interface WhatsAppSendMessageResponse {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface WhatsAppBroadcastResponse {
  broadcastId: string;
  sentCount: number;
  failedCount: number;
  totalRecipients: number;
  deliveredCount: number;
  readCount: number;
  results: Array<{
    to: string;
    messageId: string;
    status: 'sent' | 'failed';
  }>;
}

export interface WhatsAppMessageStatusResponse {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}

// --- Helpers ---

const WHATSAPP_API_BASE = 'https://graph.facebook.com/v21.0';

function getAccessToken(): string {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) throw new Error('WHATSAPP_ACCESS_TOKEN env var is required');
  return token;
}

function getPhoneNumberId(): string {
  const id = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!id) throw new Error('WHATSAPP_PHONE_NUMBER_ID env var is required');
  return id;
}

async function whatsappApi(endpoint: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const url = `${WHATSAPP_API_BASE}/${endpoint}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`WhatsApp API error ${res.status}: ${errorBody}`);
  }

  return res.json() as Promise<Record<string, unknown>>;
}

// --- Main exports ---

export async function sendMessage(params: WhatsAppSendMessageParams): Promise<WhatsAppSendMessageResponse> {
  const phoneNumberId = getPhoneNumberId();
  const recipientWaId = params.to.replace(/\+/g, '');

  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipientWaId,
    type: 'text',
    text: { body: params.message },
  };

  if (params.templateId) {
    body.type = 'template';
    body.template = {
      name: params.templateId,
      language: { code: 'en' },
      ...(params.templateParams?.length
        ? { components: [{ type: 'body', parameters: params.templateParams.map((p) => ({ type: 'text', text: p })) }] }
        : {}),
    };
  }

  const response = await whatsappApi(`${phoneNumberId}/messages`, body);
  const messageId = (response.messages as Array<Record<string, string>>)?.[0]?.id ?? '';

  return {
    messageId,
    status: 'sent',
  };
}

export async function sendBroadcast(params: WhatsAppBroadcastParams): Promise<WhatsAppBroadcastResponse> {
  const results: Array<{ to: string; messageId: string; status: 'sent' | 'failed' }> = [];

  for (const recipient of params.recipients) {
    try {
      const result = await sendMessage({
        to: recipient,
        message: params.message,
        templateId: params.templateId,
        templateParams: params.templateParams,
        tenantId: params.tenantId,
      });
      results.push({ to: recipient, messageId: result.messageId, status: 'sent' });
    } catch {
      results.push({ to: recipient, messageId: '', status: 'failed' });
    }
  }

  const sentCount = results.filter((r) => r.status === 'sent').length;
  const failedCount = results.filter((r) => r.status === 'failed').length;

  return {
    broadcastId: `bcast-${Date.now().toString(36)}`,
    sentCount,
    failedCount,
    totalRecipients: params.recipients.length,
    deliveredCount: sentCount,
    readCount: 0,
    results,
  };
}

export async function getMessageStatus(params: WhatsAppMessageStatusParams): Promise<WhatsAppMessageStatusResponse> {
  const url = `${WHATSAPP_API_BASE}/${params.messageId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });

  if (!res.ok) {
    throw new Error(`WhatsApp API error ${res.status}`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  const statuses = data.statuses as Array<Record<string, string>> | undefined;
  const latestStatus = statuses?.[0]?.status ?? 'sent';

  return {
    messageId: params.messageId,
    status: (['sent', 'delivered', 'read', 'failed'].includes(latestStatus)
      ? latestStatus
      : 'sent') as WhatsAppMessageStatusResponse['status'],
    timestamp: statuses?.[0]?.timestamp ?? new Date().toISOString(),
  };
}
