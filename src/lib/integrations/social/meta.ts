/**
 * META_GRAPH_API — Facebook/Instagram posting and engagement integration
 *
 * PURPOSE: Facebook Page posting, Instagram Business posting,
 * comment reading and replying, Instagram DM handling,
 * Facebook Messenger handling, page insights.
 *
 * AUTH METHOD: OAuth 2.0. Business connects via Facebook OAuth flow.
 * Long-lived Page Access Token stored encrypted in Supabase.
 * TOKEN REFRESH: 60-day tokens, auto-refresh 10 days before expiry.
 * TOKEN EXPIRY ALERT: 72-hour advance notification if refresh fails.
 *
 * RATE LIMITS: 200 calls/hour per access token. System never exceeds 150/hour.
 * Queue throttling enforced in Worker 2.
 * SCOPE REQUIRED: pages_manage_posts, pages_read_engagement, instagram_basic,
 * instagram_content_publish, pages_messaging, instagram_manage_messages
 *
 * WORKER: Worker 2
 * PHASE: 3 (real connection)
 * STATUS: placeholder
 */

import { mockId, mockTimestamp, mockInt, mockPick, MOCK_CONTENT } from '../mock-data';

// --- Types ---

export interface MetaPostParams {
  pageId: string;
  content: string;
  mediaUrl?: string;
  linkUrl?: string;
  tenantId: string;
}

export interface MetaReadCommentsParams {
  postId: string;
  limit?: number;
  tenantId: string;
}

export interface MetaReplyCommentParams {
  commentId: string;
  message: string;
  tenantId: string;
}

export interface MetaHandleDmParams {
  conversationId: string;
  message: string;
  platform: 'instagram' | 'messenger';
  tenantId: string;
}

export interface MetaInsightsParams {
  pageId: string;
  metrics: string[];
  since?: string;
  until?: string;
  tenantId: string;
}

export interface MetaPostResponse {
  postId: string;
  status: 'published' | 'scheduled' | 'failed';
}

export interface MetaCommentsResponse {
  comments: Array<{
    id: string;
    message: string;
    from: { name: string; id: string };
    createdTime: string;
  }>;
}

export interface MetaDmResponse {
  messageId: string;
  status: 'sent' | 'failed';
}

export interface MetaInsightsResponse {
  metrics: Record<string, number>;
}

const MOCK_AUTHORS = [
  { name: 'Mwansa Chanda', id: '100089123456789' },
  { name: 'Joseph Phiri', id: '100089234567890' },
  { name: 'Grace Tembo', id: '100089345678901' },
  { name: 'David Banda', id: '100089456789012' },
  { name: 'Chimwe Mulenga', id: '100089567890123' },
];

// --- Main exports ---

export async function post(params: MetaPostParams): Promise<MetaPostResponse> {
  // PLACEHOLDER: META_GRAPH_API — Facebook/Instagram posting and engagement
  // REAL INTEGRATION: /src/lib/integrations/social/meta.ts
  // PHASE: 3
  return {
    postId: mockId('fb', 16),
    status: 'published',
  };
}

export async function readComments(params: MetaReadCommentsParams): Promise<MetaCommentsResponse> {
  // PLACEHOLDER: META_GRAPH_API — Comment reading
  // REAL INTEGRATION: /src/lib/integrations/social/meta.ts
  // PHASE: 3
  const limit = params.limit || 10;
  const comments = [];
  for (let i = 0; i < Math.min(limit, 5); i++) {
    comments.push({
      id: mockId('cmt', 14),
      message: mockPick(MOCK_CONTENT.reviews),
      from: mockPick(MOCK_AUTHORS),
      createdTime: mockTimestamp(mockInt(1, 1440)),
    });
  }
  return { comments };
}

export async function replyToComment(params: MetaReplyCommentParams): Promise<{ commentId: string; status: 'sent' | 'failed' }> {
  // PLACEHOLDER: META_GRAPH_API — Comment reply
  // REAL INTEGRATION: /src/lib/integrations/social/meta.ts
  // PHASE: 3
  return { commentId: mockId('reply', 14), status: 'sent' };
}

export async function handleDm(params: MetaHandleDmParams): Promise<MetaDmResponse> {
  // PLACEHOLDER: META_GRAPH_API — DM handling
  // REAL INTEGRATION: /src/lib/integrations/social/meta.ts
  // PHASE: 3
  return { messageId: mockId('mid', 16), status: 'sent' };
}

export async function getInsights(params: MetaInsightsParams): Promise<MetaInsightsResponse> {
  // PLACEHOLDER: META_GRAPH_API — Page insights
  // REAL INTEGRATION: /src/lib/integrations/social/meta.ts
  // PHASE: 3
  return {
    metrics: {
      page_impressions: mockInt(2500, 18000),
      page_engaged_users: mockInt(150, 1200),
      page_post_engagements: mockInt(80, 900),
      page_follows: mockInt(20, 200),
      page_views_total: mockInt(500, 5000),
      post_reactions_by_type_total: mockInt(50, 600),
    },
  };
}
