'use client';

/**
 * Content Recycling — Repurpose high-performing content
 * Module: contentRecyclingEngine
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import type { RecyclingCandidateDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import EmptyState from '@/components/shared/EmptyState';

interface RecyclingHistoryItem {
  id: string;
  title?: string;
}

interface ContentRecyclingData {
  candidates: RecyclingCandidateDTO[];
  history: RecyclingHistoryItem[];
}

export default function Page(): JSX.Element {
  const { data, loading, error, refetch } = useApi<ContentRecyclingData>('/api/content/recycling');
  const candidates = data?.candidates ?? [];
  const history = data?.history ?? [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Recycling</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <SkeletonPanel />
        <SkeletonPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Recycling</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Content Recycling</h1>
        <p className="text-sm text-gray-400 mt-1">
          Repurpose and recycle your existing content for maximum reach
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Candidates"
          value={candidates.length}
          icon="CN"
          sublabel="available for recycling"
        />
        <StatCard
          label="Recycled"
          value={history.length}
          icon="RC"
          sublabel="pieces recycled"
        />
        <StatCard
          label="Success Rate"
          value="0%"
          icon="SR"
          sublabel="no data yet"
        />
        <StatCard
          label="Last Recycled"
          value="Never"
          icon="LR"
          sublabel="no recycling history"
        />
      </div>

      {/* Candidates */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Recycling Candidates</h2>
        {candidates.length === 0 ? (
          <EmptyState
            title="No recycling candidates"
            description="Content that qualifies for recycling will appear here. Post more content to generate candidates."
          />
        ) : (
          <div className="space-y-3">
            {candidates.map((c) => (
              <div
                key={c.postId}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <span className="text-white">{c.postId}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recycling History */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Recycling History</h2>
        {history.length === 0 ? (
          <EmptyState
            title="No recycling history"
            description="Recycled content will appear here once you start recycling."
          />
        ) : (
          <div className="space-y-3">
            {history.map((h, i) => (
              <div
                key={h.id ?? i}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <span className="text-white">{h.title ?? h.id}</span>
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
          Scan for Candidates
        </button>
      </div>
    </div>
  );
}
