/**
 * TWILIO — Call and SMS handling integration
 *
 * PURPOSE: Inbound call receiving, outbound AI cold calling,
 * SMS delivery, caller ID management (one number per business
 * from master account).
 *
 * AUTH METHOD: API credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN env vars)
 * NUMBER MANAGEMENT: One Twilio number provisioned per business from master account.
 * Number mapped to tenant_id in Supabase. Business sees their number in dashboard —
 * never sees Twilio credentials.
 * INBOUND CALLS: Twilio webhook to /api/calls/inbound → identify business by number
 * → build system prompt → ElevenLabs + Claude conversation loop
 *
 * WORKER: Inline for real-time calls. Worker 2 for scheduled outbound campaigns.
 * PHASE: 5 (real connection)
 */

import Twilio, { Twilio as TwilioClient } from 'twilio';

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

// --- Client singleton ---

let _client: TwilioClient | null = null;

function getTwilioClient(): TwilioClient {
  if (_client) return _client;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required');
  }
  _client = Twilio(accountSid, authToken);
  return _client;
}

function getDefaultFromNumber(): string {
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) {
    throw new Error('TWILIO_PHONE_NUMBER env var is required for outbound SMS/calls');
  }
  return from;
}

// --- Main exports ---

export async function handleInboundCall(params: TwilioInboundCallParams): Promise<TwilioInboundCallResponse> {
  const VoiceResponse = Twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();
  twiml.say('Hello! Thank you for calling. An agent will be with you shortly.');
  twiml.pause({ length: 1 });
  twiml.say('Please hold.');

  return {
    callSid: params.callSid,
    status: 'handled',
    twiml: twiml.toString(),
  };
}

export async function makeOutboundCall(params: TwilioOutboundCallParams): Promise<TwilioOutboundCallResponse> {
  const client = getTwilioClient();
  const from = params.from || getDefaultFromNumber();

  const call = await client.calls.create({
    to: params.to,
    from,
    ...(params.twimlUrl ? { url: params.twimlUrl } : {}),
  });

  return {
    callSid: call.sid,
    status: (call.status as TwilioOutboundCallResponse['status']) ?? 'queued',
  };
}

export async function sendSms(params: TwilioSendSmsParams): Promise<TwilioSendSmsResponse> {
  const client = getTwilioClient();
  const from = params.from || getDefaultFromNumber();

  const message = await client.messages.create({
    to: params.to,
    from,
    body: params.body,
  });

  return {
    messageSid: message.sid,
    status: (message.status as TwilioSendSmsResponse['status']) ?? 'queued',
  };
}

export async function manageNumbers(params: TwilioNumberParams): Promise<TwilioNumberResponse> {
  const client = getTwilioClient();

  if (params.action === 'provision') {
    const searchParams: Record<string, unknown> = {
      ...(params.areaCode ? { areaCode: params.areaCode } : {}),
    };

    const number = await client.incomingPhoneNumbers.create(searchParams);

    return {
      numbers: [{
        phoneNumber: number.phoneNumber ?? '',
        sid: number.sid,
        capabilities: { voice: true, sms: true },
      }],
    };
  }

  if (params.action === 'list') {
    const numbers = await client.incomingPhoneNumbers.list({ limit: 20 });

    return {
      numbers: numbers.map((n: { phoneNumber: string | null; sid: string }) => ({
        phoneNumber: n.phoneNumber ?? '',
        sid: n.sid,
        capabilities: { voice: true, sms: true },
      })),
    };
  }

  if (params.action === 'release' && params.phoneNumber) {
    const numbers = await client.incomingPhoneNumbers.list({ phoneNumber: params.phoneNumber });
    for (const n of numbers) {
      await client.incomingPhoneNumbers(n.sid).remove();
    }
    return { numbers: [] };
  }

  return { numbers: [] };
}
