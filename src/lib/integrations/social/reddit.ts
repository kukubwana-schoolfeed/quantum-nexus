/**
 * REDDIT_API — Reddit community posting integration
 *
 * PURPOSE: Community post submission, comment engagement,
 * Q&A answer posting for seo-domination-engine.
 *
 * AUTH METHOD: OAuth 2.0. Business connects existing Reddit account via OAuth.
 * GATED: Business must have existing Reddit account.
 * No new account creation by platform.
 *
 * RATE LIMITS: 60 requests/minute. Conservative posting — value-first, not volume.
 * WORKER: Worker 2
 * PHASE: 3 (real connection)
 * STATUS: placeholder
 */

import { mockId, mockInt, mockPick, MOCK_CONTENT } from '../mock-data';

// --- Types ---

export interface RedditSubmitPostParams {
  subreddit: string;
  title: string;
  content: string;
  kind: 'self' | 'link';
  url?: string;
  tenantId: string;
}

export interface RedditReadCommentsParams {
  postId: string;
  sort?: 'best' | 'top' | 'new' | 'controversial';
  limit?: number;
  tenantId: string;
}

export interface RedditReplyParams {
  parentId: string;
  text: string;
  tenantId: string;
}

export interface RedditSubmitPostResponse {
  postId: string;
  permalink: string;
}

export interface RedditCommentsResponse {
  comments: Array<{
    id: string;
    author: string;
    body: string;
    score: number;
    createdUtc: number;
  }>;
}

export interface RedditReplyResponse {
  commentId: string;
  status: 'sent' | 'failed';
}

const MOCK_REDDITORS = [
  'zambia_enthusiast', 'lusk_business_hub', 'africa_tech_fan',
  'local_seo_pro', 'small_biz_champion', 'content_creator_zm',
];

// --- Main exports ---

export async function submitPost(params: RedditSubmitPostParams): Promise<RedditSubmitPostResponse> {
  // PLACEHOLDER: REDDIT_API — Reddit community posting
  // REAL INTEGRATION: /src/lib/integrations/social/reddit.ts
  // PHASE: 3
  const postId = `t3_${mockId('', 7)}`;
  return {
    postId,
    permalink: `/r/${params.subreddit}/comments/${postId.replace('t3_', '')}/`,
  };
}

export async function readComments(params: RedditReadCommentsParams): Promise<RedditCommentsResponse> {
  // PLACEHOLDER: REDDIT_API — Comment reading
  // REAL INTEGRATION: /src/lib/integrations/social/reddit.ts
  // PHASE: 3
  const limit = params.limit || 10;
  const comments = [];
  for (let i = 0; i < Math.min(limit, 5); i++) {
    comments.push({
      id: `t1_${mockId('', 7)}`,
      author: mockPick(MOCK_REDDITORS),
      body: mockPick(MOCK_CONTENT.reviews),
      score: mockInt(1, 250),
      createdUtc: Math.floor(Date.now() / 1000) - mockInt(600, 86400),
    });
  }
  return { comments };
}

export async function reply(params: RedditReplyParams): Promise<RedditReplyResponse> {
  // PLACEHOLDER: REDDIT_API — Comment reply
  // REAL INTEGRATION: /src/lib/integrations/social/reddit.ts
  // PHASE: 3
  return { commentId: `t1_${mockId('', 7)}`, status: 'sent' };
}
