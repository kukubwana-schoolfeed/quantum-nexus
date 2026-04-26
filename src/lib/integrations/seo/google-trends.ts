/**
 * GOOGLE_TRENDS — Rising keyword trend data integration
 *
 * PURPOSE: Rising search query data per niche for trend-intelligence-engine.
 * Identifies keyword spikes before they peak so content can be created
 * while the trend is still climbing.
 *
 * AUTH METHOD: No OAuth required — Google Trends data accessed via
 * DataForSEO Trends endpoint (uses existing DataForSEO credentials).
 *
 * RATE LIMITS: Per DataForSEO API limits. Batched daily — no real-time calls.
 *
 * WORKER: Worker 4 (daily trend scan job)
 * PHASE: 4 (real connection)
 * STATUS: placeholder
 *
 * NOTE: Google Trends data is pulled via DataForSEO's Trends endpoint —
 * no separate API key needed. Uses existing DATAFORSEO_LOGIN and
 * DATAFORSEO_PASSWORD credentials.
 */

import { mockInt, mockDate, mockPick, MOCK_CONTENT } from '../mock-data';

// --- Types ---

export interface GoogleTrendsGetRisingQueriesParams {
  niche: string;
  location?: number;
  timeframe?: 'day' | 'week' | 'month' | '3months' | 'year';
  tenantId: string;
}

export interface GoogleTrendsGetInterestParams {
  keywords: string[];
  location?: number;
  timeframe?: 'day' | 'week' | 'month' | '3months' | 'year';
  tenantId: string;
}

export interface GoogleTrendsGetRisingQueriesResponse {
  queries: Array<{
    query: string;
    growth: number;
    volume: number;
  }>;
}

export interface GoogleTrendsGetInterestResponse {
  keywords: Array<{
    keyword: string;
    dataPoints: Array<{
      date: string;
      interest: number;
    }>;
  }>;
}

const MOCK_RISING_QUERIES = [
  'sustainable fashion zambia', 'ai tools for small business', 'remote work africa 2025',
  'local seo strategies', 'video marketing tips', 'eco-friendly packaging solutions',
  'digital payment solutions zambia', 'home workout equipment', 'plant-based recipes africa',
  'personal finance apps', 'online education platforms', 'electric vehicles zambia',
];

// --- Main exports ---

export async function getRisingQueries(params: GoogleTrendsGetRisingQueriesParams): Promise<GoogleTrendsGetRisingQueriesResponse> {
  // PLACEHOLDER: GOOGLE_TRENDS — Rising keyword trend data
  // REAL INTEGRATION: /src/lib/integrations/seo/google-trends.ts
  // PHASE: 4
  return {
    queries: MOCK_RISING_QUERIES.slice(0, 8).map((query) => ({
      query,
      growth: mockInt(50, 5000),
      volume: mockInt(500, 50000),
    })),
  };
}

export async function getInterestOverTime(params: GoogleTrendsGetInterestParams): Promise<GoogleTrendsGetInterestResponse> {
  // PLACEHOLDER: GOOGLE_TRENDS — Interest over time data
  // REAL INTEGRATION: /src/lib/integrations/seo/google-trends.ts
  // PHASE: 4
  return {
    keywords: params.keywords.map((keyword) => ({
      keyword,
      dataPoints: [0, 7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77].map((daysAgo) => ({
        date: mockDate(daysAgo),
        interest: mockInt(10, 100),
      })),
    })),
  };
}
