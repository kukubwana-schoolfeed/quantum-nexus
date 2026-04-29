/**
 * TELNYX — Call and SMS handling integration
 *
 * PURPOSE: Inbound call receiving, outbound AI cold calling,
 * SMS delivery, caller ID management (one number per business
 * from master account).
 *
 * AUTH METHOD: API key (TELNYX_API_KEY env var)
 * NUMBER MANAGEMENT: One Telnyx number provisioned per business from master account.
 * Number mapped to tenant_id in Supabase. Business sees their number in dashboard —
 * never sees Telnyx credentials.
 * INBOUND CALLS: Telnyx webhook to /api/calls/inbound → identify business by number
 * → build system prompt → Cartesia + Claude conversation loop
 *
 * WORKER: Inline for real-time calls. Worker 2 for scheduled outbound campaigns.
 * PHASE: 5 (real connection)
 */

import axios from 'axios';

// --- Types ---

export interface TwilioInboundCallParams {
  callSid: string;
  from: string;
  to: string;
  tenantId: string;
}

export interface TwilioOutboundCallParams {
  to: string;
  from: string;
  twimlUrl?: string;
  scheduledTime?: string;
  campaignId?: string;
  tenantId: string;
}

export interface TwilioSendSmsParams {
  to: string;
  from?: string;
  body: string;
  tenantId: string;
}

export interface TwilioNumberParams {
  action: 'provision' | 'release' | 'list';
  phoneNumber?: string;
  areaCode?: string;
  tenantId: string;
}

export interface TwilioInboundCallResponse {
  callSid: string;
  status: 'handled' | 'voicemail' | 'failed';
  twiml: string;
}

export interface TwilioOutboundCallResponse {
  callSid: string;
  status: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'failed';
}

export interface TwilioSendSmsResponse {
  messageSid: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
}

export interface TwilioNumberResponse {
  numbers: Array<{
    phoneNumber: string;
    sid: string;
    capabilities: { voice: boolean; sms: boolean };
  }>;
}

// --- Client ---

const API_BASE = 'https://api.telnyx.com/v2';

function authHeaders(): Record<string, string> {
  const apiKey = process.env.TELNYX_API_KEY;
  if (!apiKey) {
    throw new Error('TELNYX_API_KEY env var is required');
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

function getDefaultFromNumber(): string {
  const from = process.env.TELNYX_PHONE_NUMBER;
  if (!from) {
    throw new Error('TELNYX_PHONE_NUMBER env var is required for outbound SMS/calls');
  }
  return from;
}

// --- Main exports ---

export async function handleInboundCall(params: TwilioInboundCallParams): Promise<TwilioInboundCallResponse> {
  const texml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="female">Hello! Thank you for calling. An agent will be with you shortly.</Say>
  <Pause length="1"/>
  <Say voice="female">Please hold.</Say>
</Response>`;

  return {
    callSid: params.callSid,
    status: 'handled',
    twiml: texml,
  };
}

export async function makeOutboundCall(params: TwilioOutboundCallParams): Promise<TwilioOutboundCallResponse> {
  const from = params.from || getDefaultFromNumber();

  const body: Record<string, unknown> = {
    connection_id: process.env.TELNYX_CONNECTION_ID,
    to: params.to.startsWith('+') ? params.to : `+${params.to}`,
    from: from.startsWith('+') ? from : `+${from}`,
  };

  if (params.twimlUrl) {
    body.webhook_url = params.twimlUrl;
  }

  const response = await axios.post(`${API_BASE}/calls`, body, {
    headers: authHeaders(),
    timeout: 30_000,
  });

  const data = response.data.data;

  const statusMap: Record<string, TwilioOutboundCallResponse['status']> = {
    initiating: 'queued',
    ringing: 'ringing',
    in_progress: 'in-progress',
    completed: 'completed',
    failed: 'failed',
  };

  return {
    callSid: data.call_session_id ?? data.id,
    status: statusMap[data.call_status] ?? 'queued',
  };
}

export async function sendSms(params: TwilioSendSmsParams): Promise<TwilioSendSmsResponse> {
  const from = params.from || getDefaultFromNumber();

  const response = await axios.post(`${API_BASE}/messages`, {
    from: from.startsWith('+') ? from : `+${from}`,
    to: params.to.startsWith('+') ? params.to : `+${params.to}`,
    text: params.body,
  }, {
    headers: authHeaders(),
    timeout: 30_000,
  });

  const data = response.data.data;

  const statusMap: Record<string, TwilioSendSmsResponse['status']> = {
    queued: 'queued',
    sent: 'sent',
    delivered: 'delivered',
    delivering: 'delivered',
    failed: 'failed',
    undelivered: 'failed',
  };

  return {
    messageSid: data.id,
    status: statusMap[data.status] ?? 'queued',
  };
}

export async function manageNumbers(params: TwilioNumberParams): Promise<TwilioNumberResponse> {
  if (params.action === 'provision') {
    const searchBody: Record<string, unknown> = {};
    if (params.areaCode) {
      searchBody.phone_number = { contains: params.areaCode };
    }

    const searchResponse = await axios.get(`${API_BASE}/available_phone_numbers`, {
      headers: authHeaders(),
      params: {
        ...searchBody,
        limit: 1,
      },
      timeout: 30_000,
    });

    const available = searchResponse.data.data;
    if (!available || available.length === 0) {
      return { numbers: [] };
    }

    const numberToProvision = available[0].phone_number;

    const provisionResponse = await axios.post(`${API_BASE}/phone_numbers/messaging`, {
      phone_number: numberToProvision,
      messaging_profile_id: process.env.TELNYX_MESSAGING_PROFILE_ID,
    }, {
      headers: authHeaders(),
      timeout: 30_000,
    });

    const provisioned = provisionResponse.data.data;

    return {
      numbers: [{
        phoneNumber: provisioned.phone_number ?? numberToProvision,
        sid: String(provisioned.id),
        capabilities: { voice: true, sms: true },
      }],
    };
  }

  if (params.action === 'list') {
    const response = await axios.get(`${API_BASE}/phone_numbers`, {
      headers: authHeaders(),
      params: { page_size: 20 },
      timeout: 30_000,
    });

    const numbers = response.data.data ?? [];

    return {
      numbers: numbers.map((n: any) => ({
        phoneNumber: n.phone_number ?? '',
        sid: String(n.id),
        capabilities: { voice: true, sms: true },
      })),
    };
  }

  if (params.action === 'release' && params.phoneNumber) {
    const listResponse = await axios.get(`${API_BASE}/phone_numbers`, {
      headers: authHeaders(),
      params: { phone_number: params.phoneNumber, page_size: 1 },
      timeout: 30_000,
    });

    const matching = listResponse.data.data ?? [];
    for (const n of matching) {
      await axios.delete(`${API_BASE}/phone_numbers/${n.id}`, {
        headers: authHeaders(),
        timeout: 30_000,
      });
    }

    return { numbers: [] };
  }

  return { numbers: [] };
}
