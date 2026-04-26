'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';

interface BusinessStats {
  activeTenants: number;
  totalTenants: number;
}

interface BusinessTenant {
  id: string;
  [key: string]: unknown;
}

interface BusinessesData {
  stats: BusinessStats;
  tenants: BusinessTenant[];
}

export default function BusinessManagementPage(): JSX.Element {
  const { data, loading, error, refetch } = useApi<BusinessesData>('/api/admin/businesses');
  const stats = data?.stats ?? { activeTenants: 0, totalTenants: 0 };
  const tenants = data?.tenants ?? [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Business Management</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Business Management</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Business Management</h1>
        <p className="text-sm text-gray-400 mt-1">Approve, suspend, and manage all tenant accounts</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Active" value={stats.activeTenants} />
        <StatCard label="Pending Approval" value={stats.totalTenants - stats.activeTenants} />
        <StatCard label="Suspended" value={0} />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h2 className="text-sm font-semibold text-white mb-3">Tenant List</h2>
        <p className="text-sm text-gray-500">Tenant list loads from Supabase in Phase 3. Mock data shows aggregate stats only.</p>
      </div>
    </div>
  );
}
