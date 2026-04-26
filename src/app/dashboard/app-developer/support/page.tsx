'use client';

/**
 * Support Inbox — Unified app support inbox
 * Module: app-support-inbox
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import type { SupportTicketDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import EmptyState from '@/components/shared/EmptyState';

export default function Page(): JSX.Element {
  const { data, loading, error, refetch } = useApi<SupportTicketDTO[]>('/api/app-developer/support');
  const tickets = data ?? [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Inbox</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={3} />
        <SkeletonPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Inbox</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Support Inbox</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage user support tickets and resolve issues for your apps.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Tickets"
          value={tickets.length}
          icon="🎫"
        />
        <StatCard
          label="Open Tickets"
          value={tickets.filter((t) => t.status === 'open').length}
          icon="🔴"
        />
        <StatCard
          label="Resolved"
          value={tickets.filter((t) => t.status === 'resolved').length}
          icon="✅"
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Tickets</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Create Ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          title="No support tickets"
          description="Support tickets from your app users will appear here. Create a ticket manually or wait for user submissions."
        />
      ) : (
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
          <p className="text-gray-400 text-sm">Tickets will appear here.</p>
        </div>
      )}
    </div>
  );
}
