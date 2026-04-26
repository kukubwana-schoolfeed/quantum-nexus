'use client';

/**
 * Trend Intelligence — Monitor and act on trending topics
 * Module: trendIntelligenceEngine
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function Page(): JSX.Element {
  const { data: trends, loading, error, refetch } = useApi<Record<string, unknown>[]>('/api/trends');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Trend Intelligence</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <SkeletonTable />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Trend Intelligence</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const trendList = trends ?? [];
  const activeCount = trendList.filter((t) => t.status === 'ACTIVE').length;
  const newCount = trendList.filter((t) => t.status === 'NEW').length;
  const avgScore =
    trendList.length > 0
      ? Math.round(trendList.reduce((sum, t) => sum + (Number(t.score) || 0), 0) / trendList.length)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Trend Intelligence</h1>
        <p className="text-sm text-gray-400 mt-1">
          Monitor and act on trending topics across platforms
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Trends"
          value={trendList.length}
          icon="TT"
          sublabel="tracked trends"
        />
        <StatCard
          label="Active Trends"
          value={activeCount}
          icon="AT"
          trend="up"
          trendValue={`+${activeCount}`}
        />
        <StatCard
          label="New Trends"
          value={newCount}
          icon="NT"
          sublabel="recently discovered"
        />
        <StatCard
          label="Avg Score"
          value={avgScore}
          icon="AS"
          sublabel="trend strength"
        />
      </div>

      {/* Trends Table */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Trending Now</h2>
        {trendList.length === 0 ? (
          <EmptyState title="No trends detected" description="Run a scan to discover trending topics." />
        ) : (
          <DataTable
            columns={[
              { header: 'Type', key: 'trendType' },
              { header: 'Trend', key: 'trendText' },
              { header: 'Platform', key: 'platform' },
              {
                header: 'Score',
                key: 'score',
                render: (value) => (
                  <span className="font-mono text-white">{String(value)}</span>
                ),
              },
              {
                header: 'Status',
                key: 'status',
                render: (value) => <StatusBadge status={String(value)} />,
              },
            ]}
            data={trendList.map((t) => ({
              id: t.id,
              trendType: t.trendType,
              trendText: t.trendText,
              platform: t.platform,
              score: t.score,
              status: t.status,
            }))}
            emptyMessage="No trends detected. Run a scan to discover trending topics."
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Scan Now
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
        >
          Flag Expired
        </button>
      </div>
    </div>
  );
}
