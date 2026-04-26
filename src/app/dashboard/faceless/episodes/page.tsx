'use client';

/**
 * Episode Outliner — Faceless episode planning
 * Module: faceless-episode-outliner
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
  { header: 'Synopsis', key: 'synopsis' },
  {
    header: 'Status',
    key: 'status',
    render: (value: unknown) => (
      <StatusBadge status={String(value)} />
    ),
  },
];

export default function Page(): JSX.Element {
  const { data: outlines, loading, error, refetch } = useApi<{ storylineId: string; episodeNumber: number; title: string; synopsis: string; status: string }[]>('/api/faceless/episodes');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Episode Outliner</h1>
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
          <h1 className="text-2xl font-bold text-white">Episode Outliner</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!outlines || outlines.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Episode Outliner</h1>
          <p className="text-sm text-gray-400 mt-1">
            Plan and outline episodes for your faceless channel storylines.
          </p>
        </div>
        <EmptyState
          title="No episode outlines yet"
          description="Create or auto-generate your first outline."
        />
      </div>
    );
  }

  const draftCount = outlines.filter(o => o.status === 'draft').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Episode Outliner</h1>
        <p className="text-sm text-gray-400 mt-1">
          Plan and outline episodes for your faceless channel storylines.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Outlines"
          value={outlines.length}
          icon="📝"
        />
        <StatCard
          label="Draft Outlines"
          value={draftCount}
          icon="✏️"
        />
        <StatCard
          label="Storylines Covered"
          value={new Set(outlines.map(o => o.storylineId)).size}
          icon="📖"
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Episode Outlines</h2>
        <div className="flex gap-2">
          <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Auto-Generate
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + Create Outline
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <DataTable
          columns={columns}
          data={outlines as unknown as Record<string, unknown>[]}
          emptyMessage="No episode outlines yet. Create or auto-generate your first outline."
        />
      </div>
    </div>
  );
}
