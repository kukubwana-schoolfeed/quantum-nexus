import { redirect } from 'next/navigation';

/**
 * Home — Root page that redirects to the appropriate entry point.
 * Authenticated users land on Mission Control dashboard.
 * Unauthenticated users are directed to onboarding.
 * @module Platform Core
 * @phase 1
 */

/**
 * Root page component. Redirects to dashboard for authenticated users.
 * Phase 1: Redirects to dashboard by default.
 * @returns {never} Redirects immediately
 */
export default function Home(): never {
  redirect('/login');
}
