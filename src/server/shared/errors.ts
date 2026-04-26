/**
 * Server Error Handling
 * @module server/shared/errors
 * @description Standard error types and response helpers for all API routes.
 * RULE G-6: Every async function must have try/catch. Errors logged with context.
 * RULE G-3: Never expose internal error messages to the client.
 */

import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/lib/api/types';

/**
 * Application-level error with HTTP status code.
 */
export class AppError extends Error {
  /** HTTP status code */
  public readonly statusCode: number;
  /** Internal error code for logging (never sent to client) */
  public readonly internalCode: string;
  /** Safe message to return to the client */
  public readonly clientMessage: string;

  constructor(statusCode: number, internalCode: string, clientMessage: string, internalMessage?: string) {
    super(internalMessage ?? clientMessage);
    this.statusCode = statusCode;
    this.internalCode = internalCode;
    this.clientMessage = clientMessage;
  }
}

/**
 * Creates a 400 Bad Request error.
 * @param message - Client-safe error message
 * @param internalCode - Internal error code for logging
 * @returns AppError with 400 status
 */
export function badRequest(message: string, internalCode = 'BAD_REQUEST'): AppError {
  return new AppError(400, internalCode, message);
}

/**
 * Creates a 401 Unauthorized error.
 * @param internalCode - Internal error code for logging
 * @returns AppError with 401 status
 */
export function unauthorized(internalCode = 'UNAUTHORIZED'): AppError {
  return new AppError(401, internalCode, 'Authentication required');
}

/**
 * Creates a 403 Forbidden error.
 * @param message - Client-safe error message
 * @param internalCode - Internal error code for logging
 * @returns AppError with 403 status
 */
export function forbidden(message = 'Access denied', internalCode = 'FORBIDDEN'): AppError {
  return new AppError(403, internalCode, message);
}

/**
 * Creates a 404 Not Found error.
 * @param resource - Name of the resource that was not found
 * @returns AppError with 404 status
 */
export function notFound(resource = 'Resource'): AppError {
  return new AppError(404, 'NOT_FOUND', `${resource} not found`);
}

/**
 * Creates a 422 Unprocessable Entity error (validation failure).
 * @param message - Client-safe validation error message
 * @returns AppError with 422 status
 */
export function validationError(message: string): AppError {
  return new AppError(422, 'VALIDATION_ERROR', message);
}

/**
 * Creates a 500 Internal Server Error.
 * @param internalCode - Internal error code for logging
 * @returns AppError with 500 status
 */
export function internalError(internalCode = 'INTERNAL_ERROR'): AppError {
  return new AppError(500, internalCode, 'An unexpected error occurred');
}

/**
 * Converts an AppError or unknown error into a NextResponse.
 * RULE G-3: Internal error messages are never exposed to the client.
 * @param error - The error to handle
 * @param tenantId - Optional tenant_id for logging context
 * @returns NextResponse with appropriate status and safe client message
 */
export function handleError(error: unknown, tenantId?: string): NextResponse<ApiResponse<null>> {
  if (error instanceof AppError) {
    // Log internal details
    console.error(`[${error.internalCode}] tenant=${tenantId ?? 'unknown'}: ${error.message}`);

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error.clientMessage,
      },
      { status: error.statusCode }
    );
  }

  // Unknown error — never expose details
  console.error(`[UNKNOWN_ERROR] tenant=${tenantId ?? 'unknown'}:`, error);

  return NextResponse.json(
    {
      success: false,
      data: null,
      error: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}
