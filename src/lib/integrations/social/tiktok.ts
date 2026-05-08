/**
 * TIKTOK_DEVELOPER — TikTok video posting and engagement integration
 *
 * AUTH METHOD: OAuth 2.0. Business connects TikTok Business Account via OAuth.
 * Access token stored encrypted in Supabase.
 * Token retrieved via getBusinessKey(tenantId, 'tiktok_oauth_token', 'tiktok').
 *
 * RATE LIMITS: Per TikTok developer documentation. Implement backoff on 429.
 * ELEVATED ACCESS: Content Posting API requires application to TikTok for
 * elevated access.
 */

import { getBusinessKey } from '@/lib/security/key-manager';

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

// --- Main exports ---

export async function uploadVideo(params: TikTokUploadParams): Promise<TikTokUploadResponse> {
  const key = await getBusinessKey(params.tenantId, 'tiktok_oauth_token', 'tiktok');
  if (!key) throw new Error('TikTok OAuth token not found for tenant');

  const body = {
    post_info: {
      title: params.caption,
      description: [params.caption, ...params.hashtags.map((h) => `#${h}`)].join(' '),
      privacy_level: 'PUBLIC_TO_EVERYONE',
    },
    source_info: {
      source: 'PULL_FROM_URL',
      video_url: params.videoUrl,
    },
  };

  try {
    const res = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`TikTok upload failed (${res.status}): ${errBody}`);
    }
    const data = await res.json();
    return {
      videoId: data.data?.publish_id ?? '',
      status: 'processing',
    };
  } catch (err) {
    throw new Error(`TikTok upload failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function readComments(params: TikTokReadCommentsParams): Promise<TikTokCommentsResponse> {
  const key = await getBusinessKey(params.tenantId, 'tiktok_oauth_token', 'tiktok');
  if (!key) throw new Error('TikTok OAuth token not found for tenant');

  const body = {
    video_id: params.videoId,
    max_count: params.limit ?? 10,
  };

  try {
    const res = await fetch('https://open.tiktokapis.com/v2/video/comment/list/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`TikTok read comments failed (${res.status}): ${errBody}`);
    }
    const data = await res.json();
    const comments = (data.data?.comments ?? []).map((c: Record<string, unknown>) => ({
      id: c.id as string,
      text: c.text as string,
      author: {
        username: (c.user as Record<string, string>)?.display_name ?? '',
        id: (c.user as Record<string, string>)?.open_id ?? '',
      },
      createdTime: c.create_time as string,
    }));
    return { comments };
  } catch (err) {
    throw new Error(`TikTok read comments failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function replyToComment(params: TikTokReplyCommentParams): Promise<{ commentId: string; status: 'sent' | 'failed' }> {
  const key = await getBusinessKey(params.tenantId, 'tiktok_oauth_token', 'tiktok');
  if (!key) throw new Error('TikTok OAuth token not found for tenant');

  const body = {
    comment_id: params.commentId,
    text: params.message,
  };

  try {
    const res = await fetch('https://open.tiktokapis.com/v2/video/comment/reply/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`TikTok reply failed (${res.status}): ${errBody}`);
    }
    const data = await res.json();
    return { commentId: data.data?.comment?.id ?? params.commentId, status: 'sent' };
  } catch (err) {
    throw new Error(`TikTok reply failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function getAnalytics(params: TikTokAnalyticsParams): Promise<TikTokAnalyticsResponse> {
  const key = await getBusinessKey(params.tenantId, 'tiktok_oauth_token', 'tiktok');
  if (!key) throw new Error('TikTok OAuth token not found for tenant');

  const body = {
    filters: {},
    dimensions: [],
    metrics: params.metrics,
    start_date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  };

  try {
    const res = await fetch('https://open.tiktokapis.com/v2/video/query/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`TikTok analytics failed (${res.status}): ${errBody}`);
    }
    const data = await res.json();
    const metrics: Record<string, number> = {};
    const vid = data.data?.videos?.[0];
    if (vid) {
      for (const m of params.metrics) {
        metrics[m] = typeof vid[m] === 'number' ? vid[m] : 0;
      }
    }
    return { metrics };
  } catch (err) {
    throw new Error(`TikTok analytics failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function getTrendingSounds(params: TikTokTrendingSoundsParams): Promise<TikTokTrendingSoundsResponse> {
  throw new Error('TikTok trending sounds API is not publicly available');
}
