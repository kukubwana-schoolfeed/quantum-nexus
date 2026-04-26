'use client';

/**
 * Audience Intelligence — Faceless audience analysis and insights
 * Module: faceless-audience-intelligence
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import ProgressBar from '@/components/shared/ProgressBar';

export default function Page(): JSX.Element {
  const { data: audience, loading, error, refetch } = useApi<{
    insights: { avgViewDuration: number; topDemographic: string; engagementPeakDay: string; suggestedPostTime: string };
    growthData: { subscribers: number; views: number; growthRate: number };
  }>('/api/faceless/audience');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Audience Intelligence</h1>
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
          <h1 className="text-2xl font-bold text-white">Audience Intelligence</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!audience) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Audience Intelligence</h1>
          <p className="text-sm text-gray-400 mt-1">
            Understand your faceless channel audience behaviour and optimise posting strategy.
          </p>
        </div>
        <EmptyState
          title="No audience data available"
          description="Audience intelligence data could not be loaded."
        />
      </div>
    );
  }

  const insights = audience.insights;
  const growth = audience.growthData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audience Intelligence</h1>
        <p className="text-sm text-gray-400 mt-1">
          Understand your faceless channel audience behaviour and optimise posting strategy.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Avg View Duration"
          value={`${insights.avgViewDuration}s`}
          icon="⏱️"
        />
        <StatCard
          label="Top Demographic"
          value={insights.topDemographic}
          icon="👥"
        />
        <StatCard
          label="Engagement Peak"
          value={insights.engagementPeakDay}
          icon="📈"
        />
        <StatCard
          label="Suggested Post Time"
          value={insights.suggestedPostTime}
          icon="🕐"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Growth Data</h2>
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Subscribers</span>
              <span className="text-sm font-medium text-white">{growth.subscribers.toLocaleString()}</span>
            </div>
            <ProgressBar value={growth.subscribers} max={10000} showPercent={false} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Total Views</span>
              <span className="text-sm font-medium text-white">{growth.views.toLocaleString()}</span>
            </div>
            <ProgressBar value={growth.views} max={100000} showPercent={false} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Growth Rate</span>
              <span className="text-sm font-medium text-green-400">+{growth.growthRate}%</span>
            </div>
            <ProgressBar value={growth.growthRate} max={100} showPercent={false} colorClass="bg-green-500" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Refresh Insights
        </button>
      </div>
    </div>
  );
}
