'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';

interface AppDeveloperOverviewData {
  apps: Array<{ id: string; name: string; status: string }>;
  overview: { downloads: number; activeUsers: number };
  revenue: { thisMonth: number; today: number };
}

export default function AppDeveloperPage(): JSX.Element {
  const { data, loading, error, refetch } = useApi<AppDeveloperOverviewData>('/api/app-developer/overview');
  const apps = data?.apps ?? [];
  const overview = data?.overview ?? { downloads: 0, activeUsers: 0 };
  const revenue = data?.revenue ?? { thisMonth: 0, today: 0 };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">App Developer</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <SkeletonGrid count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">App Developer</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">App Developer</h1>
        <p className="text-sm text-gray-400 mt-1">Optimise, promote, and manage your app across stores</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Apps" value={apps.length} />
        <StatCard label="Downloads" value={overview.downloads.toLocaleString()} />
        <StatCard label="Active Users" value={overview.activeUsers.toLocaleString()} />
        <StatCard label="Revenue This Month" value={`K${revenue.thisMonth.toLocaleString()}`} trend="up" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">App Profile</h2>
          <p className="text-xs text-gray-500 mt-1">{apps.length} app(s) configured</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">ASO Dashboard</h2>
          <p className="text-xs text-gray-500 mt-1">Score: 65 — 2 improvements suggested</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Reviews</h2>
          <p className="text-xs text-gray-500 mt-1">Avg 4.2 rating | 70% response rate</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Content</h2>
          <p className="text-xs text-gray-500 mt-1">Generate promotional content</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Support Inbox</h2>
          <p className="text-xs text-gray-500 mt-1">0 open tickets</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Revenue</h2>
          <p className="text-xs text-gray-500 mt-1">K{revenue.today.toLocaleString()} today</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Analytics</h2>
          <p className="text-xs text-gray-500 mt-1">Downloads, ASO, revenue charts</p>
        </div>
      </div>
    </div>
  );
}
