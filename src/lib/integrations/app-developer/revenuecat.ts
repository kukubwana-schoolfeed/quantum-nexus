/**
 * REVENUECAT — Unified subscription analytics integration
 *
 * PURPOSE: Optional unified subscription analytics across iOS and Android.
 * Pulls MRR, churn, conversion rate, ARPU, trial conversion.
 *
 * AUTH METHOD: RevenueCat API key (public and secret).
 * Developer provides their RevenueCat project credentials.
 * Stored encrypted per tenant.
 *
 * OPTIONAL: Yes. Developers without RevenueCat use Google Play Billing
 * and App Store Connect directly.
 *
 * WORKER: Worker 4
 * PHASE: 4 (real connection)
 * STATUS: placeholder
 */

import { mockId, mockTimestamp, mockInt, mockFloat } from '../mock-data';

// --- Types ---

export interface RevenueCatGetMetricsParams {
  projectId: string;
  startDate: string;
  endDate: string;
  tenantId: string;
}

export interface RevenueCatGetSubscriberParams {
  subscriberId: string;
  projectId: string;
  tenantId: string;
}

export interface RevenueCatGetMrrParams {
  projectId: string;
  date: string;
  tenantId: string;
}

export interface RevenueCatGetMetricsResponse {
  mrr: number;
  churn: number;
  conversionRate: number;
  arpu: number;
  trialConversion: number;
  activeSubscribers: number;
  activeTrials: number;
}

export interface RevenueCatGetSubscriberResponse {
  subscriberId: string;
  isActive: boolean;
  currentPlan: string;
  revenueToDate: number;
  trialStartDate?: string;
  subscriptionStartDate?: string;
  expirationDate?: string;
}

export interface RevenueCatGetMrrResponse {
  totalMrr: number;
  breakdown: Array<{
    plan: string;
    mrr: number;
    subscriberCount: number;
  }>;
}

const MOCK_PLANS = [
  { plan: 'Starter Monthly', price: 9.99 },
  { plan: 'Pro Monthly', price: 29.99 },
  { plan: 'Enterprise Monthly', price: 99.99 },
  { plan: 'Starter Annual', price: 99.99 },
  { plan: 'Pro Annual', price: 299.99 },
];

// --- Main exports ---

export async function getMetrics(params: RevenueCatGetMetricsParams): Promise<RevenueCatGetMetricsResponse> {
  // PLACEHOLDER: REVENUECAT — Unified subscription analytics
  // REAL INTEGRATION: /src/lib/integrations/app-developer/revenuecat.ts
  // PHASE: 4
  return {
    mrr: mockFloat(2000, 50000),
    churn: mockFloat(0.02, 0.12),
    conversionRate: mockFloat(0.15, 0.45),
    arpu: mockFloat(5, 35),
    trialConversion: mockFloat(0.2, 0.6),
    activeSubscribers: mockInt(100, 5000),
    activeTrials: mockInt(20, 500),
  };
}

export async function getSubscriber(params: RevenueCatGetSubscriberParams): Promise<RevenueCatGetSubscriberResponse> {
  // PLACEHOLDER: REVENUECAT — Subscriber details
  // REAL INTEGRATION: /src/lib/integrations/app-developer/revenuecat.ts
  // PHASE: 4
  const isActive = Math.random() > 0.15;
  const plan = MOCK_PLANS[Math.floor(Math.random() * MOCK_PLANS.length)];
  return {
    subscriberId: params.subscriberId,
    isActive,
    currentPlan: plan.plan,
    revenueToDate: mockFloat(50, 5000),
    trialStartDate: mockTimestamp(mockInt(4320, 86400)),
    subscriptionStartDate: isActive ? mockTimestamp(mockInt(1440, 43200)) : undefined,
    expirationDate: isActive ? mockTimestamp(mockInt(-1440, 8640)) : mockTimestamp(mockInt(8640, 43200)),
  };
}

export async function getMrrBreakdown(params: RevenueCatGetMrrParams): Promise<RevenueCatGetMrrResponse> {
  // PLACEHOLDER: REVENUECAT — MRR breakdown
  // REAL INTEGRATION: /src/lib/integrations/app-developer/revenuecat.ts
  // PHASE: 4
  let totalMrr = 0;
  const breakdown = MOCK_PLANS.map((p) => {
    const subscriberCount = mockInt(5, 500);
    const mrr = Math.round(p.price * subscriberCount * 100) / 100;
    totalMrr += mrr;
    return { plan: p.plan, mrr, subscriberCount };
  });
  return { totalMrr: Math.round(totalMrr * 100) / 100, breakdown };
}
