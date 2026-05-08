/**
 * META_GRAPH_API — Facebook/Instagram posting and engagement integration
 *
 * AUTH METHOD: OAuth 2.0. Business connects via Facebook OAuth flow.
 * Long-lived Page Access Token stored encrypted in Supabase.
 * Token retrieved via getBusinessKey(tenantId, 'meta_oauth_token', 'facebook').
 *
 * RATE LIMITS: 200 calls/hour per access token. System never exceeds 150/hour.
 * SCOPE REQUIRED: pages_manage_posts, pages_read_engagement, instagram_basic,
 * instagram_content_publish, pages_messaging, instagram_manage_messages
 */

import { getBusinessKey } from '@/lib/security/key-manager';

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

// --- Main exports ---

export async function post(params: MetaPostParams): Promise<MetaPostResponse> {
  const key = await getBusinessKey(params.tenantId, 'meta_oauth_token', 'facebook');
  if (!key) throw new Error('Meta OAuth token not found for tenant');

  const url = new URL(`https://graph.facebook.com/v18.0/${params.pageId}/feed`);
  url.searchParams.set('message', params.content);
  url.searchParams.set('access_token', key.value);
  if (params.mediaUrl) url.searchParams.set('link', params.mediaUrl);
  if (params.linkUrl) url.searchParams.set('link', params.linkUrl);

  try {
    const res = await fetch(url.toString(), { method: 'POST' });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Facebook post failed (${res.status}): ${body}`);
    }
    const data = await res.json();
    return { postId: data.id, status: 'published' };
  } catch (err) {
    throw new Error(`Facebook post failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function readComments(params: MetaReadCommentsParams): Promise<MetaCommentsResponse> {
  const key = await getBusinessKey(params.tenantId, 'meta_oauth_token', 'facebook');
  if (!key) throw new Error('Meta OAuth token not found for tenant');

  const url = new URL(`https://graph.facebook.com/v18.0/${params.postId}/comments`);
  url.searchParams.set('access_token', key.value);
  url.searchParams.set('limit', String(params.limit ?? 10));
  url.searchParams.set('fields', 'id,message,from{name,id},created_time');

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Facebook read comments failed (${res.status}): ${body}`);
    }
    const data = await res.json();
    const comments = (data.data ?? []).map((c: Record<string, unknown>) => ({
      id: c.id as string,
      message: c.message as string,
      from: { name: (c.from as Record<string, string>)?.name ?? '', id: (c.from as Record<string, string>)?.id ?? '' },
      createdTime: c.created_time as string,
    }));
    return { comments };
  } catch (err) {
    throw new Error(`Facebook read comments failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function replyToComment(params: MetaReplyCommentParams): Promise<{ commentId: string; status: 'sent' | 'failed' }> {
  const key = await getBusinessKey(params.tenantId, 'meta_oauth_token', 'facebook');
  if (!key) throw new Error('Meta OAuth token not found for tenant');

  const url = new URL(`https://graph.facebook.com/v18.0/${params.commentId}/replies`);
  url.searchParams.set('message', params.message);
  url.searchParams.set('access_token', key.value);

  try {
    const res = await fetch(url.toString(), { method: 'POST' });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Facebook reply failed (${res.status}): ${body}`);
    }
    const data = await res.json();
    return { commentId: data.id, status: 'sent' };
  } catch (err) {
    throw new Error(`Facebook reply failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function handleDm(params: MetaHandleDmParams): Promise<MetaDmResponse> {
  const key = await getBusinessKey(params.tenantId, 'meta_oauth_token', 'facebook');
  if (!key) throw new Error('Meta OAuth token not found for tenant');

  const url = new URL('https://graph.facebook.com/v18.0/me/messages');
  const body = {
    recipient: { id: params.conversationId },
    message: { text: params.message },
    access_token: key.value,
  };

  try {
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Facebook DM failed (${res.status}): ${errBody}`);
    }
    const data = await res.json();
    return { messageId: data.message_id, status: 'sent' };
  } catch (err) {
    throw new Error(`Facebook DM failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function getInsights(params: MetaInsightsParams): Promise<MetaInsightsResponse> {
  const key = await getBusinessKey(params.tenantId, 'meta_oauth_token', 'facebook');
  if (!key) throw new Error('Meta OAuth token not found for tenant');

  const url = new URL(`https://graph.facebook.com/v18.0/${params.pageId}/insights`);
  url.searchParams.set('metric', params.metrics.join(','));
  url.searchParams.set('access_token', key.value);
  if (params.since) url.searchParams.set('since', params.since);
  if (params.until) url.searchParams.set('until', params.until);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Facebook insights failed (${res.status}): ${body}`);
    }
    const data = await res.json();
    const metrics: Record<string, number> = {};
    for (const item of data.data ?? []) {
      const val = item.values?.[item.values.length - 1]?.value;
      metrics[item.name] = typeof val === 'number' ? val : 0;
    }
    return { metrics };
  } catch (err) {
    throw new Error(`Facebook insights failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
