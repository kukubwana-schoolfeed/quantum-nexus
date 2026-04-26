'use client';

/**
 * Episode Tracker — Faceless episode performance tracking
 * Module: faceless-episode-tracker
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

const columns = [
  { header: 'Storyline', key: 'storylineId' },
  { header: 'Episode #', key: 'episodeNumber' },
  { header: 'Title', key: 'title' },
  {
    header: 'Status',
    key: 'status',
    render: (value: unknown) => (
      <StatusBadge status={String(value)} />
    ),
  },
  {
    header: 'Published',
    key: 'publishedAt',
    render: (value: unknown) => {
      if (!value) return <span className="text-gray-500">Not yet</span>;
      return new Date(String(value)).toLocaleDateString();
    },
  },
  {
    header: 'Views',
    key: 'views',
    render: (value: unknown) => (value as number)?.toLocaleString() ?? '0',
  },
];

export default function Page(): JSX.Element {
  const { data: episodes, loading, error, refetch } = useApi<{ storylineId: string; episodeNumber: number; title: string; status: string; publishedAt: string | null; views: number }[]>('/api/faceless/episode-tracker');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Episode Tracker</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={3} />
        <SkeletonTable />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Episode Tracker</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!episodes || episodes.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Episode Tracker</h1>
          <p className="text-sm text-gray-400 mt-1">
            Track episode lifecycle from creation through publication and monitor performance.
          </p>
        </div>
        <EmptyState
          title="No episodes tracked yet"
          description="Episodes will appear here once created."
        />
      </div>
    );
  }

  const publishedCount = episodes.filter(e => e.status === 'published').length;
  const totalViews = episodes.reduce((acc, e) => acc + (e.views ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Episode Tracker</h1>
        <p className="text-sm text-gray-400 mt-1">
          Track episode lifecycle from creation through publication and monitor performance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Episodes"
          value={episodes.length}
          icon="🎬"
        />
        <StatCard
          label="Published"
          value={publishedCount}
          icon="✅"
        />
        <StatCard
          label="Total Views"
          value={totalViews.toLocaleString()}
          icon="👁️"
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Episodes</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Refresh Tracker
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <DataTable
          columns={columns}
          data={episodes as unknown as Record<string, unknown>[]}
          emptyMessage="No episodes tracked yet. Episodes will appear here once created."
        />
      </div>
    </div>
  );
}
