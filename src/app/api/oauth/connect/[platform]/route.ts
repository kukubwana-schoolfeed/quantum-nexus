import { NextRequest, NextResponse } from 'next/server';
import { getTenantId } from '@/lib/api/route-helper';
import {
  META_APP_ID,
  GOOGLE_CLIENT_ID,
  TIKTOK_CLIENT_KEY,
  PINTEREST_APP_ID,
} from '@/lib/config/env';

type Platform = 'meta' | 'google' | 'tiktok' | 'pinterest';

const REDIRECT_BASE = 'https://app.thecustomzm.com';

const PLATFORM_CONFIGS: Record<Platform, { buildUrl: (state: string) => string }> = {
  meta: {
    buildUrl: (state) =>
      `https://www.facebook.com/v18.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${REDIRECT_BASE}/api/auth/callback/meta&scope=pages_manage_posts,instagram_basic,instagram_content_publish,pages_read_engagement&state=${state}&response_type=code`,
  },
  google: {
    buildUrl: (state) =>
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_BASE}/api/auth/callback/google&scope=https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/analytics.readonly&state=${state}&response_type=code&access_type=offline&prompt=consent`,
  },
  tiktok: {
    buildUrl: (state) =>
      `https://www.tiktok.com/v2/auth/authorize?client_key=${TIKTOK_CLIENT_KEY}&redirect_uri=${REDIRECT_BASE}/api/auth/callback/tiktok&scope=user.info.basic,video.publish,video.upload&state=${state}&response_type=code`,
  },
  pinterest: {
    buildUrl: (state) =>
      `https://www.pinterest.com/oauth/?client_id=${PINTEREST_APP_ID}&redirect_uri=${REDIRECT_BASE}/api/auth/callback/pinterest&scope=boards:read,pins:read,pins:write&state=${state}&response_type=code`,
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;

  if (!Object.keys(PLATFORM_CONFIGS).includes(platform)) {
    return NextResponse.redirect(
      `${REDIRECT_BASE}/dashboard/integrations?error=unknown_platform`
    );
  }

  const tenantId = getTenantId(req);
  const state = Buffer.from(
    JSON.stringify({ tenantId, platform, ts: Date.now() })
  ).toString('base64');

  const config = PLATFORM_CONFIGS[platform as Platform];
  const url = config.buildUrl(state);

  return NextResponse.redirect(url);
}
