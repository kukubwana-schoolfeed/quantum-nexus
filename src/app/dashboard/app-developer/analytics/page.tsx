'use client';

/**
 * App Analytics — Unified app analytics dashboard
 * Module: app-analytics-dashboard
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import type { AppAnalyticsOverviewDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import ProgressBar from '@/components/shared/ProgressBar';

interface AppAnalyticsData {
  overview: AppAnalyticsOverviewDTO;
  revenueBreakdown: { total: number; inApp: number; subscriptions: number };
}

export default function Page(): JSX.Element {
  const { data, loading, error, refetch } = useApi<AppAnalyticsData>('/api/app-developer/analytics');
  const overview = data?.overview ?? { downloads: 0, activeUsers: 0, revenue: 0, crashRate: 0 };
  const revenueBreakdown = data?.revenueBreakdown ?? { total: 0, inApp: 0, subscriptions: 0 };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">App Analytics</h1>
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
          <h1 className="text-2xl font-bold text-white">App Analytics</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">App Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">
          Monitor downloads, active users, revenue, and crash rates across your apps.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Downloads"
          value={overview.downloads.toLocaleString()}
          icon="📥"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          label="Active Users"
          value={overview.activeUsers.toLocaleString()}
          icon="👥"
          trend="up"
          trendValue="+5%"
        />
        <StatCard
          label="Revenue"
          value={`K${overview.revenue.toLocaleString()}`}
          icon="💰"
          trend="up"
          trendValue="+8%"
        />
        <StatCard
          label="Crash Rate"
          value={`${overview.crashRate}%`}
          icon="⚠️"
          trend={overview.crashRate <= 1 ? 'up' : 'down'}
          trendValue={overview.crashRate <= 1 ? 'Healthy' : 'Elevated'}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h2>
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Total Revenue</span>
              <span className="text-sm font-medium text-white">K{revenueBreakdown.total.toLocaleString()}</span>
            </div>
            <ProgressBar
              value={revenueBreakdown.total}
              max={revenueBreakdown.total}
              showPercent={false}
              colorClass="bg-blue-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">In-App Purchases</span>
              <span className="text-sm font-medium text-white">K{revenueBreakdown.inApp.toLocaleString()}</span>
            </div>
            <ProgressBar
              value={revenueBreakdown.inApp}
              max={revenueBreakdown.total}
              showPercent
              colorClass="bg-green-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Subscriptions</span>
              <span className="text-sm font-medium text-white">K{revenueBreakdown.subscriptions.toLocaleString()}</span>
            </div>
            <ProgressBar
              value={revenueBreakdown.subscriptions}
              max={revenueBreakdown.total}
              showPercent
              colorClass="bg-purple-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Export Report
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Refresh Data
        </button>
      </div>
    </div>
  );
}
