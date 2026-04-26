/**
 * GOOGLE_BUSINESS_PROFILE — GBP post and review management integration
 *
 * PURPOSE: Weekly post automation, review response, Q&A management, insights pulling.
 * Review detection for review-campaign-manager.
 *
 * AUTH METHOD: OAuth 2.0 via Google.
 *
 * WORKER: Worker 2 (posting), Worker 4 (insights)
 * PHASE: 3 (real connection)
 * STATUS: placeholder
 */

import { mockId, mockTimestamp, mockInt, mockPick, MOCK_CONTENT } from '../mock-data';

// --- Types ---

export interface GbpCreatePostParams {
  locationId: string;
  summary: string;
  mediaUrl?: string;
  actionType?: 'BOOK' | 'ORDER' | 'SHOP' | 'LEARN_MORE' | 'SIGN_UP' | 'CALL';
  actionUrl?: string;
  eventTitle?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  tenantId: string;
}

export interface GbpReplyToReviewParams {
  locationId: string;
  reviewName: string;
  replyText: string;
  tenantId: string;
}

export interface GbpGetReviewsParams {
  locationId: string;
  minRating?: number;
  pageSize?: number;
  tenantId: string;
}

export interface GbpGetInsightsParams {
  locationId: string;
  startDate: string;
  endDate: string;
  tenantId: string;
}

export interface GbpManageQaParams {
  locationId: string;
  questionId?: string;
  answerText?: string;
  action: 'list' | 'answer' | 'delete';
  tenantId: string;
}

export interface GbpCreatePostResponse {
  postId: string;
  status: 'published' | 'scheduled' | 'failed';
}

export interface GbpReplyToReviewResponse {
  reviewName: string;
  status: 'replied' | 'failed';
}

export interface GbpGetReviewsResponse {
  reviews: Array<{
    reviewId: string;
    reviewer: string;
    rating: number;
    comment: string;
    reply?: string;
    createTime: string;
  }>;
}

export interface GbpInsightsResponse {
  insights: Record<string, number>;
}

export interface GbpManageQaResponse {
  questions: Array<{
    questionId: string;
    question: string;
    author: string;
    answers: Array<{ text: string; author: string }>;
    createTime: string;
  }>;
}

const MOCK_REVIEWERS = [
  'Bwalya M.', 'Natasha K.', 'Thabo S.', 'Linda C.', 'Peter M.',
  'Ruth N.', 'James D.', 'Esther B.',
];

const MOCK_QA = [
  { question: 'What are your operating hours?', author: 'Bwalya M.' },
  { question: 'Do you offer delivery services?', author: 'Natasha K.' },
  { question: 'How much does a consultation cost?', author: 'Thabo S.' },
  { question: 'Is parking available?', author: 'Linda C.' },
  { question: 'Do you accept walk-ins or appointment only?', author: 'Peter M.' },
];

// --- Main exports ---

export async function createPost(params: GbpCreatePostParams): Promise<GbpCreatePostResponse> {
  // PLACEHOLDER: GOOGLE_BUSINESS_PROFILE — GBP post and review management
  // REAL INTEGRATION: /src/lib/integrations/google/gbp.ts
  // PHASE: 3
  return {
    postId: mockId('gbp', 14),
    status: 'published',
  };
}

export async function replyToReview(params: GbpReplyToReviewParams): Promise<GbpReplyToReviewResponse> {
  // PLACEHOLDER: GOOGLE_BUSINESS_PROFILE — Review reply
  // REAL INTEGRATION: /src/lib/integrations/google/gbp.ts
  // PHASE: 3
  return { reviewName: params.reviewName, status: 'replied' };
}

export async function getReviews(params: GbpGetReviewsParams): Promise<GbpGetReviewsResponse> {
  // PLACEHOLDER: GOOGLE_BUSINESS_PROFILE — Review retrieval
  // REAL INTEGRATION: /src/lib/integrations/google/gbp.ts
  // PHASE: 3
  const pageSize = params.pageSize || 10;
  const count = Math.min(pageSize, 5);
  const reviews = [];
  for (let i = 0; i < count; i++) {
    const rating = params.minRating ? mockInt(params.minRating, 5) : mockInt(3, 5);
    reviews.push({
      reviewId: mockId('rev', 14),
      reviewer: mockPick(MOCK_REVIEWERS),
      rating,
      comment: rating >= 4 ? mockPick(MOCK_CONTENT.reviews) : mockPick(MOCK_CONTENT.negativeReviews),
      reply: Math.random() > 0.4 ? 'Thank you for your feedback! We appreciate your support.' : undefined,
      createTime: mockTimestamp(mockInt(60, 43200)),
    });
  }
  return { reviews };
}

export async function getInsights(params: GbpGetInsightsParams): Promise<GbpInsightsResponse> {
  // PLACEHOLDER: GOOGLE_BUSINESS_PROFILE — Insights data
  // REAL INTEGRATION: /src/lib/integrations/google/gbp.ts
  // PHASE: 3
  return {
    insights: {
      totalViews: mockInt(2000, 15000),
      totalSearches: mockInt(500, 8000),
      totalActions: mockInt(100, 3000),
      websiteVisits: mockInt(50, 1500),
      phoneCalls: mockInt(20, 500),
      drivingDirections: mockInt(30, 800),
      photoViews: mockInt(300, 5000),
    },
  };
}

export async function manageQa(params: GbpManageQaParams): Promise<GbpManageQaResponse> {
  // PLACEHOLDER: GOOGLE_BUSINESS_PROFILE — Q&A management
  // REAL INTEGRATION: /src/lib/integrations/google/gbp.ts
  // PHASE: 3
  if (params.action === 'list') {
    return {
      questions: MOCK_QA.map((q) => ({
        questionId: mockId('qa', 10),
        question: q.question,
        author: q.author,
        answers: [
          { text: 'Thank you for your question! Please contact us directly for the most accurate and up-to-date information.', author: 'Owner' },
        ],
        createTime: mockTimestamp(mockInt(1440, 43200)),
      })),
    };
  }
  return { questions: [] };
}
