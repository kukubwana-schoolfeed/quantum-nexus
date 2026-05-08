/**
 * YOUTUBE_DATA_API — YouTube video upload and management integration
 *
 * AUTH METHOD: OAuth 2.0 via Google. Business connects YouTube channel.
 * Token retrieved via getBusinessKey(tenantId, 'youtube_oauth_token', 'youtube').
 * TOKEN REFRESH: Google OAuth refresh tokens do not expire if used regularly.
 */

import { getBusinessKey } from '@/lib/security/key-manager';

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

// --- Main exports ---

export async function uploadVideo(params: YouTubeUploadVideoParams): Promise<YouTubeUploadVideoResponse> {
  const key = await getBusinessKey(params.tenantId, 'youtube_oauth_token', 'youtube');
  if (!key) throw new Error('YouTube OAuth token not found for tenant');

  const metadata = {
    snippet: {
      title: params.title,
      description: params.description,
      tags: params.tags,
      categoryId: params.categoryId ?? '22',
    },
    status: {
      privacyStatus: params.privacyStatus ?? 'public',
    },
  };

  try {
    // Step 1: Initiate resumable upload
    const initRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      },
    );
    if (!initRes.ok) {
      const errBody = await initRes.text();
      throw new Error(`YouTube upload init failed (${initRes.status}): ${errBody}`);
    }

    const uploadUrl = initRes.headers.get('Location');
    if (!uploadUrl) throw new Error('YouTube upload init succeeded but no upload URL returned');

    // Step 2: Upload the video bytes from the source URL
    const videoRes = await fetch(params.videoUrl);
    if (!videoRes.ok) throw new Error(`Failed to fetch video from source URL (${videoRes.status})`);
    const videoBuffer = await videoRes.arrayBuffer();

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'video/*' },
      body: videoBuffer,
    });
    if (!uploadRes.ok) {
      const errBody = await uploadRes.text();
      throw new Error(`YouTube video upload failed (${uploadRes.status}): ${errBody}`);
    }

    const data = await uploadRes.json();
    return {
      videoId: data.id,
      status: data.status?.uploadStatus === 'uploaded' ? 'uploaded' : 'processing',
    };
  } catch (err) {
    throw new Error(`YouTube upload failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function updateVideo(params: YouTubeUpdateVideoParams): Promise<{ videoId: string; status: 'updated' | 'failed' }> {
  const key = await getBusinessKey(params.tenantId, 'youtube_oauth_token', 'youtube');
  if (!key) throw new Error('YouTube OAuth token not found for tenant');

  const body: Record<string, unknown> = {
    id: params.videoId,
  };
  if (params.title || params.description || params.tags) {
    body.snippet = {
      title: params.title,
      description: params.description,
      tags: params.tags,
    };
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${key.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`YouTube update failed (${res.status}): ${errBody}`);
    }
    return { videoId: params.videoId, status: 'updated' };
  } catch (err) {
    throw new Error(`YouTube update failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function readComments(params: YouTubeReadCommentsParams): Promise<YouTubeCommentsResponse> {
  const key = await getBusinessKey(params.tenantId, 'youtube_oauth_token', 'youtube');
  if (!key) throw new Error('YouTube OAuth token not found for tenant');

  const url = new URL('https://www.googleapis.com/youtube/v3/commentThreads');
  url.searchParams.set('videoId', params.videoId);
  url.searchParams.set('maxResults', String(params.limit ?? 10));
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('access_token', key.value);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`YouTube read comments failed (${res.status}): ${errBody}`);
    }
    const data = await res.json();
    const comments = (data.items ?? []).map((item: Record<string, unknown>) => {
      const top = (item.snippet as Record<string, unknown>)?.topLevelComment as Record<string, unknown> | undefined;
      const snip = top?.snippet as Record<string, unknown> | undefined;
      return {
        id: item.id as string,
        text: (snip?.textDisplay ?? '') as string,
        author: {
          name: (snip?.authorDisplayName ?? '') as string,
          channelId: (snip?.authorChannelId?.value ?? '') as string,
        },
        publishedAt: (snip?.publishedAt ?? '') as string,
        likeCount: (snip?.likeCount ?? 0) as number,
      };
    });
    return { comments };
  } catch (err) {
    throw new Error(`YouTube read comments failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function replyToComment(params: YouTubeReplyCommentParams): Promise<{ commentId: string; status: 'sent' | 'failed' }> {
  const key = await getBusinessKey(params.tenantId, 'youtube_oauth_token', 'youtube');
  if (!key) throw new Error('YouTube OAuth token not found for tenant');

  const body = {
    snippet: {
      parentId: params.commentId,
      textOriginal: params.text,
    },
  };

  try {
    const res = await fetch(
      'https://www.googleapis.com/youtube/v3/comments?part=snippet',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`YouTube reply failed (${res.status}): ${errBody}`);
    }
    const data = await res.json();
    return { commentId: data.id, status: 'sent' };
  } catch (err) {
    throw new Error(`YouTube reply failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function getAnalytics(params: YouTubeAnalyticsParams): Promise<YouTubeAnalyticsResponse> {
  const key = await getBusinessKey(params.tenantId, 'youtube_oauth_token', 'youtube');
  if (!key) throw new Error('YouTube OAuth token not found for tenant');

  const url = new URL('https://youtubeanalytics.googleapis.com/v2/reports');
  url.searchParams.set('ids', 'channel==MINE');
  url.searchParams.set('metrics', params.metrics.join(','));
  url.searchParams.set('startDate', params.startDate ?? new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]);
  url.searchParams.set('endDate', params.endDate ?? new Date().toISOString().split('T')[0]);
  url.searchParams.set('access_token', key.value);
  if (params.videoId) url.searchParams.set('filters', `video==${params.videoId}`);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`YouTube analytics failed (${res.status}): ${errBody}`);
    }
    const data = await res.json();
    const metrics: Record<string, number> = {};
    const headers: string[] = (data.columnHeaders ?? []).map((h: Record<string, string>) => h.name);
    const row = data.rows?.[0] ?? [];
    for (let i = 0; i < headers.length; i++) {
      metrics[headers[i]] = typeof row[i] === 'number' ? row[i] : 0;
    }
    return { metrics };
  } catch (err) {
    throw new Error(`YouTube analytics failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function getTrendingVideos(params: YouTubeTrendingParams): Promise<YouTubeTrendingResponse> {
  const key = await getBusinessKey(params.tenantId, 'youtube_oauth_token', 'youtube');
  if (!key) throw new Error('YouTube OAuth token not found for tenant');

  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.set('chart', 'mostPopular');
  url.searchParams.set('regionCode', params.regionCode);
  url.searchParams.set('part', 'snippet,statistics');
  url.searchParams.set('maxResults', '10');
  url.searchParams.set('access_token', key.value);
  if (params.categoryId) url.searchParams.set('videoCategoryId', params.categoryId);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`YouTube trending failed (${res.status}): ${errBody}`);
    }
    const data = await res.json();
    const videos = (data.items ?? []).map((item: Record<string, unknown>) => ({
      videoId: item.id as string,
      title: (item.snippet as Record<string, string>)?.title ?? '',
      channelId: (item.snippet as Record<string, string>)?.channelId ?? '',
      viewCount: Number((item.statistics as Record<string, string>)?.viewCount ?? 0),
      publishedAt: (item.snippet as Record<string, string>)?.publishedAt ?? '',
    }));
    return { videos };
  } catch (err) {
    throw new Error(`YouTube trending failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
