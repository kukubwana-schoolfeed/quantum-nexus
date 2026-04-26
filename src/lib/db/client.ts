/**
 * Supabase Server Client
 * @module db/client
 * @description Server-side Supabase client using the service role key.
 * All database queries from route handlers go through this client.
 * Service role key bypasses RLS — tenant_id filtering is enforced at the
 * application layer in each query module.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} from '@/lib/config/env';

let _adminClient: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client authenticated with the service role key.
 * This client bypasses RLS policies — use only in server-side route handlers
 * where tenant_id is explicitly filtered in every query.
 *
 * @throws Error if SUPABASE_URL or SERVICE_ROLE_KEY are not configured
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_adminClient) return _adminClient;

  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Supabase URL and service role key are required. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.'
    );
  }

  _adminClient = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _adminClient;
}
