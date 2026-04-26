/**
 * GOOGLE_ANALYTICS_4 — Traffic and conversion data integration
 *
 * PURPOSE: Website traffic data, conversion tracking, user behaviour analysis.
 *
 * AUTH METHOD: OAuth 2.0 via Google.
 *
 * WORKER: Worker 4
 * PHASE: 3 (real connection)
 * STATUS: placeholder
 */

import { mockInt, mockFloat } from '../mock-data';

// --- Types ---

export interface GA4GetTrafficDataParams {
  propertyId: string;
  startDate: string;
  endDate: string;
  dimensions?: string[];
  metrics?: string[];
  tenantId: string;
}

export interface GA4GetConversionsParams {
  propertyId: string;
  startDate: string;
  endDate: string;
  conversionEvents?: string[];
  tenantId: string;
}

export interface GA4TrafficDataResponse {
  sessions: number;
  users: number;
  pageViews: number;
  bounceRate: number;
  rows: Array<Record<string, string | number>>;
}

export interface GA4ConversionsResponse {
  conversions: Array<{
    event: string;
    count: number;
    revenue: number;
  }>;
}

// --- Main exports ---

export async function getTrafficData(params: GA4GetTrafficDataParams): Promise<GA4TrafficDataResponse> {
  // PLACEHOLDER: GOOGLE_ANALYTICS_4 — Traffic and conversion data
  // REAL INTEGRATION: /src/lib/integrations/google/ga4.ts
  // PHASE: 3
  return {
    sessions: mockInt(1200, 25000),
    users: mockInt(800, 18000),
    pageViews: mockInt(3000, 65000),
    bounceRate: mockFloat(28, 55),
    rows: [
      { date: '2025-04-01', sessions: mockInt(100, 800), users: mockInt(60, 500), pageViews: mockInt(200, 2000) },
      { date: '2025-04-02', sessions: mockInt(100, 800), users: mockInt(60, 500), pageViews: mockInt(200, 2000) },
      { date: '2025-04-03', sessions: mockInt(100, 800), users: mockInt(60, 500), pageViews: mockInt(200, 2000) },
      { date: '2025-04-04', sessions: mockInt(80, 600), users: mockInt(50, 400), pageViews: mockInt(150, 1500) },
      { date: '2025-04-05', sessions: mockInt(80, 600), users: mockInt(50, 400), pageViews: mockInt(150, 1500) },
      { date: '2025-04-06', sessions: mockInt(100, 800), users: mockInt(60, 500), pageViews: mockInt(200, 2000) },
      { date: '2025-04-07', sessions: mockInt(150, 900), users: mockInt(100, 600), pageViews: mockInt(300, 2500) },
    ],
  };
}

export async function getConversions(params: GA4GetConversionsParams): Promise<GA4ConversionsResponse> {
  // PLACEHOLDER: GOOGLE_ANALYTICS_4 — Conversion tracking
  // REAL INTEGRATION: /src/lib/integrations/google/ga4.ts
  // PHASE: 3
  return {
    conversions: [
      { event: 'purchase', count: mockInt(15, 120), revenue: mockFloat(2500, 45000) },
      { event: 'sign_up', count: mockInt(30, 300), revenue: 0 },
      { event: 'contact_form_submit', count: mockInt(20, 180), revenue: 0 },
      { event: 'phone_call', count: mockInt(5, 60), revenue: 0 },
      { event: 'booking_complete', count: mockInt(10, 80), revenue: mockFloat(1500, 25000) },
    ],
  };
}
