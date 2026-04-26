'use client';

/**
 * Scene Breakdown — Faceless scene-by-scene content planning
 * Module: faceless-scene-breakdown
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';

const columns = [
  { header: 'Outline ID', key: 'outlineId' },
  { header: 'Scene #', key: 'sceneNumber' },
  { header: 'Description', key: 'description' },
  { header: 'Style', key: 'visualStyle' },
  {
    header: 'Duration',
    key: 'durationSeconds',
    render: (value: unknown) => `${value}s`,
  },
  {
    header: 'Script',
    key: 'scriptText',
    render: (value: unknown) => {
      const text = String(value ?? '');
      return text.length > 50 ? text.slice(0, 50) + '...' : text;
    },
  },
];

export default function Page(): JSX.Element {
  const { data: scenes, loading, error, refetch } = useApi<{ outlineId: string; sceneNumber: number; description: string; visualStyle: string; durationSeconds: number; scriptText: string }[]>('/api/faceless/scenes');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Scene Breakdown</h1>
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
          <h1 className="text-2xl font-bold text-white">Scene Breakdown</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!scenes || scenes.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Scene Breakdown</h1>
          <p className="text-sm text-gray-400 mt-1">
            Break down episode outlines into individual scenes with scripts and visual styles.
          </p>
        </div>
        <EmptyState
          title="No scenes yet"
          description="Create scenes manually or auto-breakdown an outline."
        />
      </div>
    );
  }

  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Scene Breakdown</h1>
        <p className="text-sm text-gray-400 mt-1">
          Break down episode outlines into individual scenes with scripts and visual styles.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Scenes"
          value={scenes.length}
          icon="🎬"
        />
        <StatCard
          label="Total Duration"
          value={`${totalDuration}s`}
          icon="⏱️"
        />
        <StatCard
          label="Outlines Covered"
          value={new Set(scenes.map(s => s.outlineId)).size}
          icon="📝"
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Scenes</h2>
        <div className="flex gap-2">
          <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Auto-Breakdown
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + Create Scene
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <DataTable
          columns={columns}
          data={scenes as unknown as Record<string, unknown>[]}
          emptyMessage="No scenes yet. Create scenes manually or auto-breakdown an outline."
        />
      </div>
    </div>
  );
}
