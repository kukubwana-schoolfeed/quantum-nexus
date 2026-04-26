/**
 * GOOGLE_PLAY_CONSOLE — App listing management and analytics integration
 *
 * PURPOSE: Read app listing data, submit listing updates (description, screenshots),
 * read reviews, post review replies, pull download and revenue analytics.
 *
 * AUTH METHOD: OAuth 2.0. Developer connects their Google Play Console account
 * via Google OAuth. Service account credentials for server-to-server calls
 * where supported.
 *
 * RATE LIMITS: 200,000 requests/day per project. No practical limit for our use case.
 * TOKEN REFRESH: Google OAuth refresh tokens, auto-refresh supported.
 * SCOPE REQUIRED: androidpublisher scope
 *
 * WORKER: Worker 4 (analytics pulls, review monitoring),
 * Worker 2 (review replies, listing updates)
 * PHASE: 4 (real connection)
 * STATUS: placeholder
 */

import { mockId, mockTimestamp, mockInt, mockFloat, mockPick, MOCK_CONTENT } from '../mock-data';

// --- Types ---

export interface PlayConsoleGetAppDetailsParams {
  packageName: string;
  tenantId: string;
}

export interface PlayConsoleUpdateListingParams {
  packageName: string;
  listing: {
    title?: string;
    shortDescription?: string;
    fullDescription?: string;
    screenshots?: Array<{ url: string; type: string }>;
  };
  language?: string;
  tenantId: string;
}

export interface PlayConsoleGetReviewsParams {
  packageName: string;
  limit?: number;
  tenantId: string;
}

export interface PlayConsoleReplyToReviewParams {
  packageName: string;
  reviewId: string;
  replyText: string;
  tenantId: string;
}

export interface PlayConsoleGetAnalyticsParams {
  packageName: string;
  metrics: string[];
  startDate: string;
  endDate: string;
  tenantId: string;
}

export interface PlayConsoleGetAppDetailsResponse {
  appName: string;
  packageName: string;
  downloads: number;
  rating: number;
  versionCode: number;
  category: string;
}

export interface PlayConsoleUpdateListingResponse {
  status: 'updated' | 'failed';
}

export interface PlayConsoleGetReviewsResponse {
  reviews: Array<{
    reviewId: string;
    authorName: string;
    rating: number;
    comment: string;
    reply?: string;
    lastEditedTime: string;
  }>;
}

export interface PlayConsoleReplyToReviewResponse {
  reviewId: string;
  status: 'replied' | 'failed';
}

export interface PlayConsoleGetAnalyticsResponse {
  metrics: Record<string, number>;
}

const MOCK_PLAY_REVIEWERS = [
  'Bwalya M.', 'Natasha K.', 'Thabo S.', 'Linda C.', 'Peter M.',
  'Grace T.', 'James D.', 'Esther B.',
];

const MOCK_CATEGORIES = [
  'Business', 'Productivity', 'Lifestyle', 'Finance', 'Health & Fitness',
];

// --- Main exports ---

export async function getAppDetails(params: PlayConsoleGetAppDetailsParams): Promise<PlayConsoleGetAppDetailsResponse> {
  // PLACEHOLDER: GOOGLE_PLAY_CONSOLE — App listing management and analytics
  // REAL INTEGRATION: /src/lib/integrations/app-developer/play-console.ts
  // PHASE: 4
  return {
    appName: params.packageName.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || 'My App',
    packageName: params.packageName,
    downloads: mockInt(1000, 500000),
    rating: mockFloat(3.5, 4.9),
    versionCode: mockInt(10, 85),
    category: mockPick(MOCK_CATEGORIES),
  };
}

export async function updateListing(params: PlayConsoleUpdateListingParams): Promise<PlayConsoleUpdateListingResponse> {
  // PLACEHOLDER: GOOGLE_PLAY_CONSOLE — Listing update
  // REAL INTEGRATION: /src/lib/integrations/app-developer/play-console.ts
  // PHASE: 4
  return { status: 'updated' };
}

export async function getReviews(params: PlayConsoleGetReviewsParams): Promise<PlayConsoleGetReviewsResponse> {
  // PLACEHOLDER: GOOGLE_PLAY_CONSOLE — Review reading
  // REAL INTEGRATION: /src/lib/integrations/app-developer/play-console.ts
  // PHASE: 4
  const limit = params.limit || 10;
  const reviews = [];
  for (let i = 0; i < Math.min(limit, 5); i++) {
    const rating = mockInt(3, 5);
    reviews.push({
      reviewId: `gp:${mockId('', 20)}`,
      authorName: mockPick(MOCK_PLAY_REVIEWERS),
      rating,
      comment: rating >= 4 ? mockPick(MOCK_CONTENT.reviews) : mockPick(MOCK_CONTENT.negativeReviews),
      reply: Math.random() > 0.5 ? 'Thank you for your review! We appreciate your feedback.' : undefined,
      lastEditedTime: mockTimestamp(mockInt(60, 43200)),
    });
  }
  return { reviews };
}

export async function replyToReview(params: PlayConsoleReplyToReviewParams): Promise<PlayConsoleReplyToReviewResponse> {
  // PLACEHOLDER: GOOGLE_PLAY_CONSOLE — Review reply
  // REAL INTEGRATION: /src/lib/integrations/app-developer/play-console.ts
  // PHASE: 4
  return { reviewId: params.reviewId, status: 'replied' };
}

export async function getAnalytics(params: PlayConsoleGetAnalyticsParams): Promise<PlayConsoleGetAnalyticsResponse> {
  // PLACEHOLDER: GOOGLE_PLAY_CONSOLE — Analytics data
  // REAL INTEGRATION: /src/lib/integrations/app-developer/play-console.ts
  // PHASE: 4
  return {
    metrics: {
      dailyInstalls: mockInt(20, 500),
      dailyUninstalls: mockInt(5, 80),
      activeDevices: mockInt(5000, 200000),
      totalRevenue: mockFloat(500, 25000),
      inAppPurchaseRevenue: mockFloat(200, 15000),
      subscriptionRevenue: mockFloat(300, 10000),
      crashRate: mockFloat(0.1, 3.5),
      anrRate: mockFloat(0.05, 1.5),
      userRatings: mockFloat(3.8, 4.8),
    },
  };
}
