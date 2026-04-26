/**
 * YOUTUBE_DATA_API — YouTube video upload and management integration
 *
 * PURPOSE: Video upload, title/description/tags/chapters management,
 * comment reading and replying, analytics, trending video data
 * for trend-intelligence-engine.
 *
 * AUTH METHOD: OAuth 2.0 via Google. Business connects YouTube channel.
 * TOKEN REFRESH: Google OAuth refresh tokens do not expire if used regularly.
 * Auto-refresh supported.
 *
 * WORKER: Worker 2
 * PHASE: 3 (real connection)
 * STATUS: placeholder
 */

import { mockId, mockTimestamp, mockInt, mockPick, MOCK_CONTENT } from '../mock-data';

// --- Types ---

export interface YouTubeUploadVideoParams {
  videoUrl: string;
  title: string;
  description: string;
  tags: string[];
  categoryId?: string;
  privacyStatus?: 'public' | 'unlisted' | 'private';
  tenantId: string;
}

export interface YouTubeUpdateVideoParams {
  videoId: string;
  title?: string;
  description?: string;
  tags?: string[];
  chapters?: Array<{ title: string; startTime: number }>;
  tenantId: string;
}

export interface YouTubeReadCommentsParams {
  videoId: string;
  limit?: number;
  tenantId: string;
}

export interface YouTubeReplyCommentParams {
  commentId: string;
  text: string;
  tenantId: string;
}

export interface YouTubeAnalyticsParams {
  videoId?: string;
  metrics: string[];
  startDate?: string;
  endDate?: string;
  tenantId: string;
}

export interface YouTubeTrendingParams {
  regionCode: string;
  categoryId?: string;
  tenantId: string;
}

export interface YouTubeUploadVideoResponse {
  videoId: string;
  status: 'uploaded' | 'processing' | 'failed';
}

export interface YouTubeCommentsResponse {
  comments: Array<{
    id: string;
    text: string;
    author: { name: string; channelId: string };
    publishedAt: string;
    likeCount: number;
  }>;
}

export interface YouTubeAnalyticsResponse {
  metrics: Record<string, number>;
}

export interface YouTubeTrendingResponse {
  videos: Array<{
    videoId: string;
    title: string;
    channelId: string;
    viewCount: number;
    publishedAt: string;
  }>;
}

const MOCK_YT_AUTHORS = [
  { name: 'Mwansa Creates', channelId: 'UC' + mockId('', 22) },
  { name: 'Tech With Joseph', channelId: 'UC' + mockId('', 22) },
  { name: 'Grace Kitchen ZM', channelId: 'UC' + mockId('', 22) },
  { name: 'Fit Life Lusaka', channelId: 'UC' + mockId('', 22) },
];

const MOCK_TRENDING_TITLES = [
  'How I Built My Business From Zero — Full Breakdown',
  '5 Marketing Strategies Nobody Talks About',
  'Day in the Life of a Zambian Entrepreneur',
  'The Truth About Local SEO in 2025',
  'Why 90% of Small Businesses Fail at Social Media',
];

// --- Main exports ---

export async function uploadVideo(params: YouTubeUploadVideoParams): Promise<YouTubeUploadVideoResponse> {
  // PLACEHOLDER: YOUTUBE_DATA_API — YouTube video upload and management
  // REAL INTEGRATION: /src/lib/integrations/social/youtube.ts
  // PHASE: 3
  return {
    videoId: mockId('', 11),
    status: 'uploaded',
  };
}

export async function updateVideo(params: YouTubeUpdateVideoParams): Promise<{ videoId: string; status: 'updated' | 'failed' }> {
  // PLACEHOLDER: YOUTUBE_DATA_API — Video metadata update
  // REAL INTEGRATION: /src/lib/integrations/social/youtube.ts
  // PHASE: 3
  return { videoId: params.videoId, status: 'updated' };
}

export async function readComments(params: YouTubeReadCommentsParams): Promise<YouTubeCommentsResponse> {
  // PLACEHOLDER: YOUTUBE_DATA_API — Comment reading
  // REAL INTEGRATION: /src/lib/integrations/social/youtube.ts
  // PHASE: 3
  const limit = params.limit || 10;
  const comments = [];
  for (let i = 0; i < Math.min(limit, 5); i++) {
    comments.push({
      id: `Ugw${mockId('', 40)}`,
      text: mockPick(MOCK_CONTENT.reviews),
      author: mockPick(MOCK_YT_AUTHORS),
      publishedAt: mockTimestamp(mockInt(10, 10080)),
      likeCount: mockInt(0, 150),
    });
  }
  return { comments };
}

export async function replyToComment(params: YouTubeReplyCommentParams): Promise<{ commentId: string; status: 'sent' | 'failed' }> {
  // PLACEHOLDER: YOUTUBE_DATA_API — Comment reply
  // REAL INTEGRATION: /src/lib/integrations/social/youtube.ts
  // PHASE: 3
  return { commentId: `Ugw${mockId('', 40)}`, status: 'sent' };
}

export async function getAnalytics(params: YouTubeAnalyticsParams): Promise<YouTubeAnalyticsResponse> {
  // PLACEHOLDER: YOUTUBE_DATA_API — Video analytics
  // REAL INTEGRATION: /src/lib/integrations/social/youtube.ts
  // PHASE: 3
  return {
    metrics: {
      views: mockInt(500, 100000),
      likes: mockInt(20, 5000),
      dislikes: mockInt(0, 100),
      comments: mockInt(5, 500),
      shares: mockInt(10, 2000),
      subscribersGained: mockInt(2, 200),
      averageViewDuration: mockInt(30, 480),
      averageViewPercentage: mockInt(25, 85),
      impressionCount: mockInt(2000, 200000),
      clickThroughRate: mockInt(2, 15),
    },
  };
}

export async function getTrendingVideos(params: YouTubeTrendingParams): Promise<YouTubeTrendingResponse> {
  // PLACEHOLDER: YOUTUBE_DATA_API — Trending video data
  // REAL INTEGRATION: /src/lib/integrations/social/youtube.ts
  // PHASE: 3
  return {
    videos: MOCK_TRENDING_TITLES.map((title) => ({
      videoId: mockId('', 11),
      title,
      channelId: 'UC' + mockId('', 22),
      viewCount: mockInt(10000, 500000),
      publishedAt: mockTimestamp(mockInt(60, 4320)),
    })),
  };
}
