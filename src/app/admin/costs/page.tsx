'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';

interface CostData {
  total: number;
  anthropic: number;
  elevenlabs: number;
  twilio: number;
  runway: number;
}

export default function CostDashboardPage(): JSX.Element {
  const { data, loading, error, refetch } = useApi<CostData>('/api/admin/costs');
  const costs = data ?? { total: 0, anthropic: 0, elevenlabs: 0, twilio: 0, runway: 0 };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Cost Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Cost Dashboard</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Cost Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Per-service cost breakdown across all tenants</p>
      </div>
      <StatCard label="Total Monthly Cost" value={`$${costs.total}`} sublabel="All services combined" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Anthropic" value={`$${costs.anthropic}`} />
        <StatCard label="ElevenLabs" value={`$${costs.elevenlabs}`} />
        <StatCard label="Twilio" value={`$${costs.twilio}`} />
        <StatCard label="RunwayML" value={`$${costs.runway}`} />
      </div>
    </div>
  );
}
