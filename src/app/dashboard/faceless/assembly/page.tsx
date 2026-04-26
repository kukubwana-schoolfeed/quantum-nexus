'use client';

/**
 * Assembly Pipeline — Faceless episode assembly and rendering
 * Module: faceless-assembly-pipeline
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';

export default function Page(): JSX.Element {
  const { data: jobs, loading, error, refetch } = useApi<{ status: string }[]>('/api/faceless/assembly');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Assembly Pipeline</h1>
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
          <h1 className="text-2xl font-bold text-white">Assembly Pipeline</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Assembly Pipeline</h1>
          <p className="text-sm text-gray-400 mt-1">
            Assemble scenes, voice, and visuals into finished faceless episodes.
          </p>
        </div>
        <EmptyState
          title="No assembly jobs yet"
          description="Start a new assembly job to combine scenes, voice-overs, and visuals into a finished episode."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Assembly Pipeline</h1>
        <p className="text-sm text-gray-400 mt-1">
          Assemble scenes, voice, and visuals into finished faceless episodes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Assembly Jobs"
          value={jobs.length}
          icon="🔧"
        />
        <StatCard
          label="Queued"
          value={jobs.filter(j => j.status === 'queued').length}
          icon="⏳"
        />
        <StatCard
          label="Completed"
          value={jobs.filter(j => j.status === 'complete').length}
          icon="✅"
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Assembly Jobs</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Start Assembly
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <p className="text-gray-400 text-sm">Assembly jobs will appear here.</p>
      </div>
    </div>
  );
}
