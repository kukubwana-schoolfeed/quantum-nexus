'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';

interface AdminStats {
  totalTenants: number;
  activeTenants: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

interface PlatformHealth {
  workers: Record<string, string>;
  redis: string;
  supabase: string;
}

/**
 * SuperAdminDashboard — Full platform control dashboard.
 * Module: super-admin-dashboard | Phase: 2 (mock data)
 */

export default function SuperAdminDashboardPage(): JSX.Element {
  const { data: statsData, loading: statsLoading, error: statsError, refetch: statsRefetch } = useApi<AdminStats>('/api/admin/stats');
  const { data: healthData, loading: healthLoading, error: healthError, refetch: healthRefetch } = useApi<PlatformHealth>('/api/admin/health');
  const stats = statsData ?? { totalTenants: 0, activeTenants: 0, totalRevenue: 0, monthlyGrowth: 0 };
  const health = healthData ?? { workers: {}, redis: 'unknown', supabase: 'unknown' };

  if (statsLoading || healthLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <SkeletonPanel />
      </div>
    );
  }

  if (statsError || healthError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
        </div>
        {statsError && <ApiError message={statsError} onRetry={statsRefetch} />}
        {healthError && <ApiError message={healthError} onRetry={healthRefetch} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Full platform control — Quantum Leaf Software</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tenants" value={stats.totalTenants} trend="up" trendValue="+8.5%" />
        <StatCard label="Active Tenants" value={stats.activeTenants} />
        <StatCard label="Monthly Revenue" value={`K${stats.totalRevenue.toLocaleString()}`} />
        <StatCard label="Growth" value={`${stats.monthlyGrowth}%`} trend="up" />
      </div>

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h2 className="text-sm font-semibold text-white mb-3">Platform Health</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.entries(health.workers) as [string, string][]).map(([name, status]) => (
            <div key={name} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
              <span className="text-xs text-gray-400 capitalize">
                {name === 'aiScene' ? 'AI Scene' : name}
              </span>
              <StatusBadge status={status} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
            <span className="text-xs text-gray-400">Redis</span>
            <StatusBadge status={health.redis} />
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
            <span className="text-xs text-gray-400">Supabase</span>
            <StatusBadge status={health.supabase} />
          </div>
        </div>
      </div>
    </div>
  );
}
