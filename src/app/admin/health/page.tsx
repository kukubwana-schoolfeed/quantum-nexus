'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';

interface HealthInfo {
  workers: Record<string, string>;
  redis: string;
  supabase: string;
  uptime: number;
}

interface QueueInfo {
  name: string;
  completed: number;
  [key: string]: unknown;
}

interface HealthApiResponse {
  health: HealthInfo;
  queues: QueueInfo[];
}

export default function PlatformHealthPage(): JSX.Element {
  const { data, loading, error, refetch } = useApi<HealthApiResponse>('/api/admin/health');
  const health = data?.health ?? { workers: {}, redis: 'unknown', supabase: 'unknown', uptime: 0 };
  const queues = data?.queues ?? [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Health</h1>
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
          <h1 className="text-2xl font-bold text-white">Platform Health</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Health</h1>
        <p className="text-sm text-gray-400 mt-1">Worker, Redis, Supabase, and infrastructure monitoring</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Uptime" value={`${health.uptime}%`} trend="up" />
        <StatCard label="Workers Healthy" value={`${Object.values(health.workers).filter((s) => s === 'green').length}/4`} />
        <StatCard label="Active Alerts" value={0} />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h2 className="text-sm font-semibold text-white mb-3">Worker Status</h2>
        <div className="space-y-2">
          {(Object.entries(health.workers) as [string, string][]).map(([name, status]) => (
            <div key={name} className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
              <span className="text-sm text-gray-300 capitalize">
                {name === 'aiScene' ? 'AI Scene' : name}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  Completed: {queues.find((q: { name: string }) => q.name === name)?.completed ?? 0}
                </span>
                <StatusBadge status={status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
