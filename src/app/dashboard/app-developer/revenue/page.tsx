'use client';

/**
 * Revenue — App revenue analytics
 * Module: app-payment-intelligence
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import type { AppRevenueDTO, AppChurnDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ProgressBar from '@/components/shared/ProgressBar';
import EmptyState from '@/components/shared/EmptyState';

interface AppRevenueData {
  revenue: AppRevenueDTO;
  churnRate: AppChurnDTO;
  topProducts: Array<{ id: string; name: string; revenue: number }>;
}

export default function Page(): JSX.Element {
  const { data, loading, error, refetch } = useApi<AppRevenueData>('/api/app-developer/revenue');
  const revenue = data?.revenue ?? { today: 0, thisWeek: 0, thisMonth: 0 };
  const churn = data?.churnRate ?? { rate: 0, trend: 'stable' };
  const topProducts = data?.topProducts ?? [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Revenue</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={3} />
        <SkeletonPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Revenue</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Revenue</h1>
        <p className="text-sm text-gray-400 mt-1">
          Track app revenue, monitor churn, and identify top-performing products.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Revenue Today"
          value={`K${revenue.today.toLocaleString()}`}
          icon="💵"
        />
        <StatCard
          label="Revenue This Week"
          value={`K${revenue.thisWeek.toLocaleString()}`}
          icon="📅"
        />
        <StatCard
          label="Revenue This Month"
          value={`K${revenue.thisMonth.toLocaleString()}`}
          icon="📊"
          trend="up"
          trendValue="+8%"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Churn Rate</h2>
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Monthly Churn Rate</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{churn.rate}%</span>
              <StatusBadge status={churn.trend} />
            </div>
          </div>
          <ProgressBar
            value={churn.rate}
            max={20}
            label="Churn"
            showPercent={false}
            colorClass={churn.rate <= 5 ? 'bg-green-500' : churn.rate <= 10 ? 'bg-yellow-500' : 'bg-red-500'}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Top Products</h2>
        </div>
        {topProducts.length === 0 ? (
          <EmptyState
            title="No product data yet"
            description="Top performing in-app products and subscriptions will appear here once transaction data is available."
          />
        ) : (
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
            <p className="text-gray-400 text-sm">Products will appear here.</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Export Revenue
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Refresh Data
        </button>
      </div>
    </div>
  );
}
