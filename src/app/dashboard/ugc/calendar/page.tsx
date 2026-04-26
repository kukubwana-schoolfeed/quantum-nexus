'use client';

/**
 * UGC Calendar — UGC content scheduling
 * Module: ugcContentCalendar
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';

interface CalendarEntry {
  id: string;
  title?: string;
}

export default function Page(): JSX.Element {
  const { data: entries, loading, error, refetch } = useApi<CalendarEntry[]>('/api/ugc/calendar');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">UGC Content Calendar</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <SkeletonPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">UGC Content Calendar</h1>
          <p className="text-sm text-gray-400 mt-1">
            Schedule and manage your UGC content across platforms
          </p>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const entryList = entries ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">UGC Content Calendar</h1>
        <p className="text-sm text-gray-400 mt-1">
          Schedule and manage your UGC content across platforms
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Calendar Entries"
          value={entryList.length}
          icon="CE"
          sublabel="scheduled posts"
        />
        <StatCard
          label="This Week"
          value={0}
          icon="TW"
          sublabel="posts this week"
        />
        <StatCard
          label="Next 7 Days"
          value={0}
          icon="ND"
          sublabel="upcoming posts"
        />
        <StatCard
          label="Drafts"
          value={0}
          icon="DR"
          sublabel="unscheduled clips"
        />
      </div>

      {/* Calendar Entries */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Scheduled Content</h2>
        {entryList.length === 0 ? (
          <EmptyState
            title="No calendar entries"
            description="Schedule your UGC clips to publish across platforms. Approved clips will appear here once scheduled."
          />
        ) : (
          <div className="space-y-3">
            {entryList.map((e) => (
              <div
                key={String(e.id)}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <span className="text-white">{String(e.title ?? e.id)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Schedule Content
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
        >
          Auto-Fill Calendar
        </button>
      </div>
    </div>
  );
}
