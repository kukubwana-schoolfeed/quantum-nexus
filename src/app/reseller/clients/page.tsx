'use client';

import { useApi } from '@/lib/hooks/useApi';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import type { ResellerClientDTO } from '@/lib/api/schema';

export default function ClientOverviewPage(): JSX.Element {
  const { data: clients, loading, error, refetch } = useApi<ResellerClientDTO[]>('/api/reseller/clients');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Overview</h1>
          <p className="text-sm text-gray-400 mt-1">Loading...</p>
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
          <h1 className="text-2xl font-bold text-white">Client Overview</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const total = clients?.length ?? 0;
  const active = clients?.filter(c => c.status === 'active').length ?? 0;
  const churned = clients?.filter(c => c.status === 'churned').length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Client Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your reseller client accounts</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Clients" value={total} />
        <StatCard label="Active" value={active} />
        <StatCard label="Churned" value={churned} />
      </div>
      {total === 0 ? (
        <EmptyState title="No clients yet" description="Add clients from the main dashboard." />
      ) : (
        <div className="space-y-2">
          {clients?.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2 px-3 bg-gray-900/50 rounded">
              <span className="text-sm text-gray-300">{c.name}</span>
              <StatusBadge status={c.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
