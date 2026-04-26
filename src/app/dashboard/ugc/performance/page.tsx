'use client';

/**
 * UGC Performance — UGC performance feedback loop
 * Module: ugcPerformanceFeedback
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';

interface TopClip {
  id: string;
  title?: string;
}

interface PerformanceData {
  performance: {
    views: number;
    engagement: number;
    saves: number;
    shares: number;
  };
  topPerforming: TopClip[];
}

export default function Page(): JSX.Element {
  const { data, loading, error, refetch } = useApi<PerformanceData>('/api/ugc/performance');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">UGC Performance</h1>
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
          <h1 className="text-2xl font-bold text-white">UGC Performance</h1>
          <p className="text-sm text-gray-400 mt-1">
            Track and analyse your UGC content performance across platforms
          </p>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const performance = data?.performance ?? { views: 0, engagement: 0, saves: 0, shares: 0 };
  const topPerforming = data?.topPerforming ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">UGC Performance</h1>
        <p className="text-sm text-gray-400 mt-1">
          Track and analyse your UGC content performance across platforms
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Views"
          value={performance.views.toLocaleString()}
          icon="VW"
          trend="up"
          trendValue="+15%"
          sublabel="across all clips"
        />
        <StatCard
          label="Engagement Rate"
          value={`${performance.engagement}%`}
          icon="ER"
          trend="up"
          trendValue="+1.2%"
          sublabel="likes, comments, shares"
        />
        <StatCard
          label="Saves"
          value={performance.saves.toLocaleString()}
          icon="SV"
          sublabel="content saves"
        />
        <StatCard
          label="Shares"
          value={performance.shares.toLocaleString()}
          icon="SH"
          trend="up"
          trendValue="+8%"
          sublabel="total shares"
        />
      </div>

      {/* Top Performing */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Top Performing Clips</h2>
        {topPerforming.length === 0 ? (
          <EmptyState
            title="No top performers yet"
            description="Your highest-performing clips will appear here once you have enough performance data."
          />
        ) : (
          <div className="space-y-3">
            {topPerforming.map((clip, i) => (
              <div
                key={String(clip.id ?? i)}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <span className="text-white">{String(clip.title ?? clip.id)}</span>
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
          Refresh Performance
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
        >
          Export Report
        </button>
      </div>
    </div>
  );
}
