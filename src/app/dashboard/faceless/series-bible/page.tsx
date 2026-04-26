'use client';

/**
 * Series Bible — Faceless series world-building and tone guide
 * Module: faceless-series-bible
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';

const columns = [
  { header: 'Storyline ID', key: 'storylineId' },
  { header: 'World Rules', key: 'worldRules' },
  {
    header: 'Recurring Themes',
    key: 'recurringThemes',
    render: (value: unknown) => {
      const themes = value as string[];
      return themes?.length ? themes.join(', ') : '—';
    },
  },
  { header: 'Tone Notes', key: 'toneNotes' },
];

export default function Page(): JSX.Element {
  const { data: bibles, loading, error, refetch } = useApi<{ storylineId: string; worldRules: string; recurringThemes: string[]; toneNotes: string }[]>('/api/faceless/series-bible');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Series Bible</h1>
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
          <h1 className="text-2xl font-bold text-white">Series Bible</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!bibles || bibles.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Series Bible</h1>
          <p className="text-sm text-gray-400 mt-1">
            Define world rules, recurring themes, and tone guidelines for your faceless series.
          </p>
        </div>
        <EmptyState
          title="No series bibles yet"
          description="Create a bible to define your series identity."
        />
      </div>
    );
  }

  const totalThemes = bibles.reduce(
    (acc, b) => acc + (b.recurringThemes?.length ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Series Bible</h1>
        <p className="text-sm text-gray-400 mt-1">
          Define world rules, recurring themes, and tone guidelines for your faceless series.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Series Bibles"
          value={bibles.length}
          icon="📜"
        />
        <StatCard
          label="Total Themes"
          value={totalThemes}
          icon="🎯"
        />
        <StatCard
          label="Linked Storylines"
          value={new Set(bibles.map(b => b.storylineId)).size}
          icon="🔗"
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Bibles</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Create Bible
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <DataTable
          columns={columns}
          data={bibles as unknown as Record<string, unknown>[]}
          emptyMessage="No series bibles yet. Create a bible to define your series identity."
        />
      </div>
    </div>
  );
}
