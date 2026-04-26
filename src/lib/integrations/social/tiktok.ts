/**
 * TIKTOK_DEVELOPER — TikTok video posting and engagement integration
 *
 * PURPOSE: Video publishing, comment reading and replying,
 * video analytics, trending sound data for trend-intelligence-engine.
 *
 * AUTH METHOD: OAuth 2.0. Business connects TikTok Business Account via OAuth.
 * Access token stored encrypted in Supabase.
 * TOKEN REFRESH: TikTok requires manual re-authentication. No background refresh.
 * TOKEN EXPIRY ALERT: 72-hour advance alert with one-click reconnect button.
 * ELEVATED ACCESS: Content Posting API requires application to TikTok for
 * elevated access. Guide business through this during onboarding.
 *
 * RATE LIMITS: Per TikTok developer documentation. Implement backoff on 429.
 * WORKER: Worker 2
 * PHASE: 3 (real connection)
 * STATUS: placeholder
 */

import { mockId, mockTimestamp, mockInt, mockPick, MOCK_CONTENT } from '../mock-data';

// --- Types ---

export interface TikTokUploadParams {
  videoUrl: string;
  caption: string;
  hashtags: string[];
  tenantId: string;
}

export interface TikTokReadCommentsParams {
  videoId: string;
  limit?: number;
  tenantId: string;
}

export interface TikTokReplyCommentParams {
  commentId: string;
  message: string;
  tenantId: string;
}

export interface TikTokAnalyticsParams {
  videoId: string;
  metrics: string[];
  tenantId: string;
}

export interface TikTokTrendingSoundsParams {
  category?: string;
  limit?: number;
  tenantId: string;
}

export interface TikTokUploadResponse {
  videoId: string;
  status: 'published' | 'processing' | 'failed';
}

export interface TikTokCommentsResponse {
  comments: Array<{
    id: string;
    text: string;
    author: { username: string; id: string };
    createdTime: string;
  }>;
}

export interface TikTokAnalyticsResponse {
  metrics: Record<string, number>;
}

export interface TikTokTrendingSoundsResponse {
  sounds: Array<{
    id: string;
    title: string;
    author: string;
    playCount: number;
  }>;
}

const MOCK_TIKTOK_USERS = [
  { username: 'mwansa_creative', id: '7012345678901234567' },
  { username: 'joseph_vibes', id: '7012345678901234568' },
  { username: 'grace_kitchen', id: '7012345678901234569' },
  { username: 'david_fitness', id: '7012345678901234570' },
  { username: 'chimwe_beats', id: '7012345678901234571' },
];

const MOCK_SOUNDS = [
  { title: 'Original Sound - Morning Grind', author: 'hustle_daily' },
  { title: 'Amapiano Beat Mix 2025', author: 'dj_zambian' },
  { title: 'Motivational Speech - Keep Going', author: 'inspire_africa' },
  { title: 'Cooking ASMR Background', author: 'kitchen_sounds' },
  { title: 'Lusaka Nights - Afrobeat', author: 'zmb_producer' },
];

// --- Main exports ---

export async function uploadVideo(params: TikTokUploadParams): Promise<TikTokUploadResponse> {
  // PLACEHOLDER: TIKTOK_DEVELOPER — TikTok video posting and engagement
  // REAL INTEGRATION: /src/lib/integrations/social/tiktok.ts
  // PHASE: 3
  return {
    videoId: mockId('tt', 19),
    status: 'published',
  };
}

export async function readComments(params: TikTokReadCommentsParams): Promise<TikTokCommentsResponse> {
  // PLACEHOLDER: TIKTOK_DEVELOPER — Comment reading
  // REAL INTEGRATION: /src/lib/integrations/social/tiktok.ts
  // PHASE: 3
  const limit = params.limit || 10;
  const comments = [];
  for (let i = 0; i < Math.min(limit, 5); i++) {
    comments.push({
      id: mockId('tcmt', 14),
      text: mockPick(MOCK_CONTENT.reviews),
      author: mockPick(MOCK_TIKTOK_USERS),
      createdTime: mockTimestamp(mockInt(1, 2880)),
    });
  }
  return { comments };
}

export async function replyToComment(params: TikTokReplyCommentParams): Promise<{ commentId: string; status: 'sent' | 'failed' }> {
  // PLACEHOLDER: TIKTOK_DEVELOPER — Comment reply
  // REAL INTEGRATION: /src/lib/integrations/social/tiktok.ts
  // PHASE: 3
  return { commentId: mockId('trply', 14), status: 'sent' };
}

export async function getAnalytics(params: TikTokAnalyticsParams): Promise<TikTokAnalyticsResponse> {
  // PLACEHOLDER: TIKTOK_DEVELOPER — Video analytics
  // REAL INTEGRATION: /src/lib/integrations/social/tiktok.ts
  // PHASE: 3
  return {
    metrics: {
      video_views: mockInt(500, 50000),
      video_likes: mockInt(50, 5000),
      video_comments: mockInt(5, 500),
      video_shares: mockInt(10, 1500),
      video_favorites: mockInt(20, 2000),
      profile_visits: mockInt(30, 800),
      follower_count: mockInt(200, 15000),
    },
  };
}

export async function getTrendingSounds(params: TikTokTrendingSoundsParams): Promise<TikTokTrendingSoundsResponse> {
  // PLACEHOLDER: TIKTOK_DEVELOPER — Trending sounds data
  // REAL INTEGRATION: /src/lib/integrations/social/tiktok.ts
  // PHASE: 3
  const limit = params.limit || 5;
  return {
    sounds: MOCK_SOUNDS.slice(0, limit).map((s) => ({
      id: mockId('snd', 12),
      title: s.title,
      author: s.author,
      playCount: mockInt(50000, 5000000),
    })),
  };
}
