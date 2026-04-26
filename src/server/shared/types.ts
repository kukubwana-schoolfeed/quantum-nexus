/**
 * Server Route Handler Types
 * @module server/shared/types
 * @description Type definitions specific to server route handlers.
 */

import type { ApiResponse, PaginatedResponse, SessionClaims } from '@/lib/api/types';

/** Standard route handler context with authenticated session */
export interface RouteContext {
  /** Authenticated session claims extracted from JWT */
  session: SessionClaims;
  /** Tenant ID derived from session (convenience accessor) */
  tenantId: string;
}

/** Success response helper — creates a standard API success response */
export function successResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data } satisfies ApiResponse<T>), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Paginated success response helper */
export function paginatedResponse<T>(
  data: T[],
  meta: { page: number; pageSize: number; totalItems: number; totalPages: number }
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      meta,
    } satisfies PaginatedResponse<T>),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
