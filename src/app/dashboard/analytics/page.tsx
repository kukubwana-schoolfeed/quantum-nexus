'use client';

import { useApi } from '@/lib/hooks/useApi';
import type { AnalyticsOverviewDTO, ChartDataDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';

export default function AnalyticsPage() {
  const { data: overview, loading: overviewLoading, error: overviewError, refetch: refetchOverview } = useApi<AnalyticsOverviewDTO>('/api/analytics/overview');
  const { data: chartData, loading: chartLoading, error: chartError, refetch: refetchChart } = useApi<ChartDataDTO>('/api/analytics/chart?type=revenue&period=7d');

  if (overviewLoading || chartLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <SkeletonGrid count={3} />
        <SkeletonPanel />
      </div>
    );
  }

  if (overviewError || chartError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
        </div>
        <ApiError message={overviewError ?? chartError ?? 'Failed to load data'} onRetry={() => { refetchOverview(); refetchChart(); }} />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
        </div>
        <EmptyState title="No analytics data available" description="Analytics data will appear once your business starts generating traffic." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Track business performance, revenue, and content metrics at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Revenue Today"
          value={`K${overview.revenueToday.toLocaleString()}`}
          icon="💰"
          trend="up"
          trendValue="+8%"
        />
        <StatCard
          label="Revenue This Week"
          value={`K${overview.revenueThisWeek.toLocaleString()}`}
          icon="📈"
          sublabel="7-day total"
        />
        <StatCard
          label="Revenue This Month"
          value={`K${overview.revenueThisMonth.toLocaleString()}`}
          icon="🗓️"
          trend="up"
          trendValue="+15%"
        />
        <StatCard
          label="New Customers Today"
          value={overview.newCustomersToday}
          icon="👥"
          sublabel="Acquired today"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Posts Published Today"
          value={overview.postsPublishedToday}
          icon="📝"
          sublabel="Across all platforms"
        />
        <StatCard
          label="Posts Scheduled (24h)"
          value={overview.postsScheduled24h}
          icon="⏰"
          sublabel="Next 24 hours"
        />
        <StatCard
          label="Indexed Pages"
          value={overview.totalIndexedPages}
          icon="🔍"
          trend="up"
          trendValue="+5"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Revenue Over Time</h2>
        {chartData && chartData.data.length > 0 ? (
          <div className="h-64 flex items-end gap-2 px-4">
            {chartData.data.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-nexus-700 hover:bg-nexus-600 rounded-t transition-colors"
                  style={{ height: `${(d.value / 10000) * 100}%`, minHeight: '8px' }}
                  title={`K${d.value.toLocaleString()}`}
                />
                <span className="text-[10px] text-gray-500">{d.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No chart data available" description="Revenue chart data will appear once transactions are recorded." />
        )}
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
          Export Report
        </button>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
          Download CSV
        </button>
      </div>
    </div>
  );
}
