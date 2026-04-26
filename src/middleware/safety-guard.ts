import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { SessionClaims } from '../lib/auth/types';

import type { ContentContentType } from '../lib/security/content-safety';

const ROUTE_CONTENT_TYPE_MAP: Array<{ route: string; contentType: ContentContentType }> = [
  { route: '/api/social/post', contentType: 'social_post' },
  { route: '/api/content/publish', contentType: 'social_post' },
  { route: '/api/gbp/post', contentType: 'gbp_post' },
  { route: '/api/seo/blog-publish', contentType: 'blog_post' },
  { route: '/api/content/recycle', contentType: 'social_post' },
];

function requiresSafetyCheck(pathname: string): boolean {
  return ROUTE_CONTENT_TYPE_MAP.some(({ route }) => pathname === route || pathname.startsWith(`${route}/`));
}

function inferContentType(pathname: string): ContentContentType {
  const match = ROUTE_CONTENT_TYPE_MAP.find(({ route }) => pathname === route || pathname.startsWith(`${route}/`));
  return match?.contentType ?? 'social_post';
}

async function extractContent(request: NextRequest): Promise<string> {
  try {
    const body = await request.json();
    const parsed = body as Record<string, unknown>;
    return (parsed.content as string ?? parsed.text as string ?? '');
  } catch {
    return '';
  }
}

export async function safetyGuard(request: NextRequest, claims: SessionClaims): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (!requiresSafetyCheck(pathname)) {
    return NextResponse.next();
  }

  const { checkContentSafety, isSafetyServiceAvailable, holdPostForSafetyFailure } = await import('../lib/security/content-safety');

  const serviceAvailable = await isSafetyServiceAvailable();

  if (!serviceAvailable) {
    return NextResponse.json({ error: 'Content safety check unavailable. Post held for review.' }, { status: 503 });
  }

  const content = await extractContent(request);
  const contentType = inferContentType(pathname);
  const safetyResult = await checkContentSafety(claims.tenant_id, content, contentType, pathname);

  if (!safetyResult.passed) {
    try {
      const body = await request.json().catch(() => ({}));
      const postId = (body as Record<string, unknown>).postId as string | undefined;
      if (postId) {
        await holdPostForSafetyFailure(claims.tenant_id, postId, safetyResult.reason ?? 'safety_check_failed');
      }
    } catch {}

    return NextResponse.json({ error: 'Content did not pass safety review. Post held for review.' }, { status: 403 });
  }

  const response = NextResponse.next();
  response.headers.set('x-content-safety-passed', 'true');
  return response;
}

