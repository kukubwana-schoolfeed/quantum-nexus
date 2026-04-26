import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/lib/api/types';

const DEFAULT_TENANT = 'demo';

export function getTenantId(req: NextRequest): string {
  return req.headers.get('x-tenant-id') ?? req.nextUrl.searchParams.get('tenantId') ?? DEFAULT_TENANT;
}

export function apiResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data });
}

export function apiError(message: string, status = 500): NextResponse<ApiResponse<null>> {
  return NextResponse.json({ success: false, data: null, error: message }, { status });
}
