'use client';

/**
 * UGC Trends — UGC trend monitoring
 * Module: ugcTrendMonitor
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';

interface Trend {
  id: string;
  trendText?: string;
}

export default function Page(): JSX.Element {
  const { data: trends, loading, error, refetch } = useApi<Trend[]>('/api/ugc/trends');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">UGC Trend Monitor</h1>
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
          <h1 className="text-2xl font-bold text-white">UGC Trend Monitor</h1>
          <p className="text-sm text-gray-400 mt-1">
            Track trends relevant to your UGC content strategy
          </p>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const trendList = trends ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">UGC Trend Monitor</h1>
        <p className="text-sm text-gray-400 mt-1">
          Track trends relevant to your UGC content strategy
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tracked Trends"
          value={trendList.length}
          icon="TT"
          sublabel="trends monitored"
        />
        <StatCard
          label="Active Trends"
          value={0}
          icon="AT"
          sublabel="currently active"
        />
        <StatCard
          label="New Today"
          value={0}
          icon="NT"
          sublabel="discovered today"
        />
        <StatCard
          label="Last Scan"
          value="Never"
          icon="LS"
          sublabel="no scans run"
        />
      </div>

      {/* Trends List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Trending Topics</h2>
        {trendList.length === 0 ? (
          <EmptyState
            title="No trends detected"
            description="Run a scan to discover trending topics relevant to your UGC content. Trends help you align your clips with what audiences are watching."
          />
        ) : (
          <div className="space-y-3">
            {trendList.map((t, i) => (
              <div
                key={String(t.id ?? i)}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <span className="text-white">{String(t.trendText ?? t.id)}</span>
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
          Scan for Trends
        </button>
      </div>
    </div>
  );
}
