'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid } from '@/components/shared/Skeleton';
import type { TierDTO } from '@/lib/api/schema';

interface PricingData {
  tiers: TierDTO[];
  pricing: { tiers: TierDTO[] } | null;
}

export default function PricingManagerPage(): JSX.Element {
  const { data, loading, error, refetch } = useApi<PricingData>('/api/reseller/pricing');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pricing Manager</h1>
          <p className="text-sm text-gray-400 mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pricing Manager</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const tiers = data?.tiers ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pricing Manager</h1>
        <p className="text-sm text-gray-400 mt-1">Configure your custom pricing tiers for clients</p>
      </div>
      {tiers.length === 0 ? (
        <EmptyState title="No pricing tiers" description="Set up your pricing tiers to get started." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier) => (
            <div key={tier.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h2 className="text-sm font-semibold text-white">{tier.name}</h2>
              <p className="text-2xl font-bold text-nexus-400 mt-2">K{tier.price}</p>
              <p className="text-xs text-gray-500 mt-2">{tier.features.length} features</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
