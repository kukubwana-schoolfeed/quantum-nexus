import { NextRequest } from 'next/server';
import { getTenantId, apiResponse, apiError } from '@/lib/api/route-helper';
import { post as metaPost } from '@/lib/integrations/social/meta';
import { uploadVideo as tiktokUpload } from '@/lib/integrations/social/tiktok';
import { uploadVideo as youtubeUpload } from '@/lib/integrations/social/youtube';

export async function POST(req: NextRequest) {
  const tenantId = getTenantId(req);

  try {
    const body = await req.json();
    const { platform, content, mediaUrl, pageId } = body as {
      platform?: string;
      content?: string;
      mediaUrl?: string;
      pageId?: string;
    };

    if (!platform) return apiError('Missing platform', 400);
    if (!content) return apiError('Missing content', 400);

    let result;

    switch (platform) {
      case 'meta': {
        if (!pageId) return apiError('Missing pageId for Meta', 400);
        result = await metaPost({ pageId, content, mediaUrl, tenantId });
        break;
      }
      case 'tiktok': {
        if (!mediaUrl) return apiError('Missing mediaUrl for TikTok', 400);
        result = await tiktokUpload({ videoUrl: mediaUrl, caption: content, hashtags: [], tenantId });
        break;
      }
      case 'youtube': {
        if (!mediaUrl) return apiError('Missing mediaUrl for YouTube', 400);
        result = await youtubeUpload({ videoUrl: mediaUrl, title: content, description: content, tags: [], tenantId });
        break;
      }
      default:
        return apiError(`Unsupported platform: ${platform}`, 400);
    }

    return apiResponse(result);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to create social post');
  }
}
