/**
 * Server Validation Utilities
 * @module server/shared/validation
 * @description Zod schema helpers and standard validation patterns for API routes.
 * RULE G-3: Every API route must validate request body with Zod schema.
 */

import { z } from 'zod';

/** Standard pagination query schema */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

/** UUID validation schema */
export const uuidSchema = z.string().uuid();

/** Common ID parameter schema for route params */
export const idParamSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Validates request body against a Zod schema.
 * @param body - The raw request body object
 * @param schema - The Zod schema to validate against
 * @returns Validated and typed data
 * @throws ZodError if validation fails
 */
export function validateBody<T>(body: unknown, schema: z.ZodSchema<T>): T {
  return schema.parse(body);
}

/**
 * Safely parses request body against a Zod schema.
 * @param body - The raw request body object
 * @param schema - The Zod schema to validate against
 * @returns Object with success flag, data if valid, or error if invalid
 */
export function safeParseBody<T>(body: unknown, schema: z.ZodSchema<T>): {
  success: boolean;
  data?: T;
  error?: string;
} {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const messages = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
  return { success: false, error: messages.join('; ') };
}

/**
 * Parses and validates search params from a URL.
 * @param url - The request URL
 * @param schema - Zod schema for the query params
 * @returns Validated query parameters
 */
export function parseQueryParams<T>(url: string, schema: z.ZodSchema<T>): T {
  const { searchParams } = new URL(url);
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return schema.parse(params);
}
