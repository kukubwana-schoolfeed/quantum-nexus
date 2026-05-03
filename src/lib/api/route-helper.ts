import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/lib/api/types';

const SESSION_CLAIMS_HEADER = 'x-session-claims';

export function getTenantId(req: NextRequest): string {
  const propagated = req.headers.get(SESSION_CLAIMS_HEADER);
  if (propagated) {
    try {
      const claims = JSON.parse(propagated);
      if (claims.tenant_id && claims.tenant_id !== 'none') {
        return claims.tenant_id;
      }
    } catch {}
  }
  return 'demo';
}

export function apiResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data });
}

export function apiError(message: string, status = 500): NextResponse<ApiResponse<null>> {
  return NextResponse.json({ success: false, data: null, error: message }, { status });
}