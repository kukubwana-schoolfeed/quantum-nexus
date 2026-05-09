import { NextRequest, NextResponse } from 'next/server';
import { storeKey, type KeyType } from '@/lib/security/key-manager';
import { getSupabaseAdminClient } from '@/lib/auth/supabase-auth';
import {
  META_APP_ID,
  META_APP_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  TIKTOK_CLIENT_KEY,
  TIKTOK_CLIENT_SECRET,
  PINTEREST_APP_ID,
  PINTEREST_APP_SECRET,
} from '@/lib/config/env';

const REDIRECT_BASE = 'https://app.thecustomzm.com';
const ERROR_REDIRECT = `${REDIRECT_BASE}/dashboard/integrations?error=oauth_failed`;
const SUCCESS_REDIRECT = `${REDIRECT_BASE}/dashboard/integrations?connected=true`;

type Platform = 'meta' | 'google' | 'tiktok' | 'pinterest';

interface PlatformTokenConfig {
  keyType: KeyType;
  platformId: string;
  redirectUri: string;
  exchangeToken: (code: string) => Promise<{ accessToken: string; refreshToken?: string; expiresAt: string }>;
}

const PLATFORMS: Record<Platform, PlatformTokenConfig> = {
  meta: {
    keyType: 'meta_oauth_token',
    platformId: 'facebook',
    redirectUri: `${REDIRECT_BASE}/api/auth/callback/meta`,
    exchangeToken: async (code) => {
      const params = new URLSearchParams({
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        redirect_uri: `${REDIRECT_BASE}/api/auth/callback/meta`,
        code,
      });
      const res = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
        method: 'POST',
        body: params,
      });
      const data = await res.json();
      if (!data.access_token) throw new Error(data.error?.message ?? 'Meta token exchange failed');
      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString();
      return { accessToken: data.access_token, expiresAt };
    },
  },
  google: {
    keyType: 'youtube_oauth_token',
    platformId: 'youtube',
    redirectUri: `${REDIRECT_BASE}/api/auth/callback/google`,
    exchangeToken: async (code) => {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: `${REDIRECT_BASE}/api/auth/callback/google`,
          grant_type: 'authorization_code',
        }),
      });
      const data = await res.json();
      if (!data.access_token) throw new Error(data.error_description ?? 'Google token exchange failed');
      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : new Date(Date.now() + 3600 * 1000).toISOString();
      return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt };
    },
  },
  tiktok: {
    keyType: 'tiktok_oauth_token',
    platformId: 'tiktok',
    redirectUri: `${REDIRECT_BASE}/api/auth/callback/tiktok`,
    exchangeToken: async (code) => {
      const params = new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${REDIRECT_BASE}/api/auth/callback/tiktok`,
      });
      const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });
      const data = await res.json();
      if (!data.access_token) throw new Error(data.error_description ?? 'TikTok token exchange failed');
      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt };
    },
  },
  pinterest: {
    keyType: 'pinterest_oauth_token',
    platformId: 'pinterest',
    redirectUri: `${REDIRECT_BASE}/api/auth/callback/pinterest`,
    exchangeToken: async (code) => {
      const authHeader = Buffer.from(`${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`).toString('base64');
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${REDIRECT_BASE}/api/auth/callback/pinterest`,
      });
      const res = await fetch('https://api.pinterest.com/v5/oauth/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });
      const data = await res.json();
      if (!data.access_token) throw new Error(data.error_description ?? 'Pinterest token exchange failed');
      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
      return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt };
    },
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await params;
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');

    if (!code || !state) {
      return NextResponse.redirect(ERROR_REDIRECT);
    }

    let decoded: { tenantId: string; platform: string };
    try {
      decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    } catch {
      return NextResponse.redirect(ERROR_REDIRECT);
    }

    const { tenantId, platform: statePlatform } = decoded;

    if (!tenantId || statePlatform !== platform) {
      return NextResponse.redirect(ERROR_REDIRECT);
    }

    const config = PLATFORMS[platform as Platform];
    if (!config) {
      return NextResponse.redirect(ERROR_REDIRECT);
    }

    const tokenData = await config.exchangeToken(code);

    // Fetch Facebook Page ID for Meta platform
    let metaPageId: string | undefined;
    let metaPageName: string | undefined;
    if (platform === 'meta') {
      try {
        const pageRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${tokenData.accessToken}`);
        const pageData = await pageRes.json();
        if (pageData.data?.[0]) {
          metaPageId = pageData.data[0].id;
          metaPageName = pageData.data[0].name;
        }
      } catch {
        // Continue without page ID rather than breaking the whole flow
      }
    }

    const tokenPayload = JSON.stringify({
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken ?? null,
      expiresAt: tokenData.expiresAt,
    });

    try {
      await storeKey(tenantId, config.keyType, tokenPayload, config.platformId);
    } catch (err: unknown) {
      const pgError = err as { code?: string; message?: string };
      if (pgError.code === '23505') {
        const supabase = getSupabaseAdminClient();
        await supabase
          .from('encrypted_keys')
          .delete()
          .eq('tenant_id', tenantId)
          .eq('key_type', config.keyType)
          .eq('platform_id', config.platformId);
        await storeKey(tenantId, config.keyType, tokenPayload, config.platformId);
      } else {
        throw err;
      }
    }

    // Store additional Google keys (GSC, GA4, GBP) with the same token
    if (platform === 'google') {
      const googleKeyTypes: { keyType: KeyType; platformId: string }[] = [
        { keyType: 'gsc_oauth_token', platformId: 'gsc' },
        { keyType: 'ga4_oauth_token', platformId: 'ga4' },
        { keyType: 'gbp_oauth_token', platformId: 'gbp' },
      ];
      for (const { keyType, platformId: pid } of googleKeyTypes) {
        try {
          await storeKey(tenantId, keyType, tokenPayload, pid);
        } catch (err: unknown) {
          const pgError = err as { code?: string; message?: string };
          if (pgError.code === '23505') {
            const supabase = getSupabaseAdminClient();
            await supabase
              .from('encrypted_keys')
              .delete()
              .eq('tenant_id', tenantId)
              .eq('key_type', keyType)
              .eq('platform_id', pid);
            await storeKey(tenantId, keyType, tokenPayload, pid);
          }
        }
      }
    }

    const supabase = getSupabaseAdminClient();
    await supabase
      .from('connected_platforms')
      .upsert(
        {
          tenant_id: tenantId,
          platform,
          connected: true,
          token_expires_at: tokenData.expiresAt,
          updated_at: new Date().toISOString(),
          ...(metaPageId ? { platform_user_id: metaPageId } : {}),
          ...(metaPageName ? { platform_username: metaPageName } : {}),
        },
        { onConflict: 'tenant_id,platform' }
      );

    return NextResponse.redirect(SUCCESS_REDIRECT);
  } catch (err) {
    console.error('[OAuth Callback] Error:', err instanceof Error ? err.message : err);
    return NextResponse.redirect(ERROR_REDIRECT);
  }
}
