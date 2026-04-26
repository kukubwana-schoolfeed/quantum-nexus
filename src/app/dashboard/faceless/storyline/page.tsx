'use client';

/**
 * Storyline Editor — Faceless storyline management
 * Module: faceless-storyline-editor
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
  { header: 'Title', key: 'title' },
  { header: 'Character ID', key: 'characterId' },
  { header: 'Episodes', key: 'episodeCount' },
  {
    header: 'Status',
    key: 'status',
    render: (value: unknown) => (
      <StatusBadge status={String(value)} />
    ),
  },
];

export default function Page(): JSX.Element {
  const { data: storylines, loading, error, refetch } = useApi<{ title: string; characterId: string; episodeCount: number; status: string }[]>('/api/faceless/storylines');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Storyline Editor</h1>
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
          <h1 className="text-2xl font-bold text-white">Storyline Editor</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!storylines || storylines.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Storyline Editor</h1>
          <p className="text-sm text-gray-400 mt-1">
            Build and manage storylines that drive your faceless channel narrative.
          </p>
        </div>
        <EmptyState
          title="No storylines created yet"
          description="Create your first storyline to begin."
        />
      </div>
    );
  }

  const activeStorylines = storylines.filter(s => s.status === 'active').length;
  const totalEpisodes = storylines.reduce((acc, s) => acc + s.episodeCount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Storyline Editor</h1>
        <p className="text-sm text-gray-400 mt-1">
          Build and manage storylines that drive your faceless channel narrative.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Storylines"
          value={storylines.length}
          icon="📖"
        />
        <StatCard
          label="Active Storylines"
          value={activeStorylines}
          icon="🔥"
        />
        <StatCard
          label="Total Episodes"
          value={totalEpisodes}
          icon="🎬"
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Storylines</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Create Storyline
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <DataTable
          columns={columns}
          data={storylines as unknown as Record<string, unknown>[]}
          emptyMessage="No storylines created yet. Create your first storyline to begin."
        />
      </div>
    </div>
  );
}
