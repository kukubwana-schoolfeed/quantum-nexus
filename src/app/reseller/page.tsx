'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import type { ResellerBrandingDTO } from '@/lib/api/schema';

export default function ResellerOverviewPage(): JSX.Element {
  const { data, loading, error, refetch } = useApi<ResellerBrandingDTO>('/api/reseller/branding');
  const branding: ResellerBrandingDTO = data ?? { brandName: '', primaryColor: '#000000', logo: null, secondaryColor: null };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reseller Dashboard</h1>
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
          <h1 className="text-2xl font-bold text-white">Reseller Dashboard</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reseller Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your agency, clients, and branding</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Clients" value={0} />
        <StatCard label="Active Clients" value={0} />
        <StatCard label="Monthly Revenue" value="K0" />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h2 className="text-sm font-semibold text-white mb-3">Agency Branding</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Brand Name</span>
            <span className="text-white">{branding.brandName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Primary Color</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: branding.primaryColor }} />
              <span className="text-white">{branding.primaryColor}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
