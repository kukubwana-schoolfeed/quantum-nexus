'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';

interface Niche {
  id: string;
  name: string;
  trendScore: number;
  competitionLevel: string;
}

interface NichesApiResponse {
  niches: Niche[];
  pendingReviews: Niche[];
}

export default function NicheResearchReviewPage(): JSX.Element {
  const { data, loading, error, refetch } = useApi<NichesApiResponse>('/api/admin/niches');
  const niches = data?.niches ?? [];
  const pending = data?.pendingReviews ?? [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Niche Research Review</h1>
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
          <h1 className="text-2xl font-bold text-white">Niche Research Review</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Niche Research Review</h1>
        <p className="text-sm text-gray-400 mt-1">Review and approve auto-researched niche profiles</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Active Niches" value={niches.length} />
        <StatCard label="Pending Review" value={pending.length} />
        <StatCard label="Deprecated" value={0} />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h2 className="text-sm font-semibold text-white mb-3">Niche Library</h2>
        <div className="space-y-2">
          {niches.map((niche) => (
            <div key={niche.id} className="flex items-center justify-between py-2 px-3 bg-gray-900/50 rounded">
              <div className="flex items-center gap-3">
                <StatusBadge status="active" />
                <span className="text-sm text-gray-300">{niche.name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-400">Trend: {niche.trendScore}</span>
                <span className="text-gray-400">Competition: {niche.competitionLevel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
