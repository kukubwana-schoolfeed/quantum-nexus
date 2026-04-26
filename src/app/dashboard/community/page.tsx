'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';

export default function CommunityPage(): JSX.Element {
  const { data: posts, loading, error, refetch } = useApi<Record<string, unknown>[]>('/api/community');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Community</h1>
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
          <h1 className="text-2xl font-bold text-white">Community</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Community</h1>
          <p className="text-sm text-gray-400 mt-1">Customer community feed — off by default, activate from settings</p>
        </div>
        <button className="px-4 py-2 bg-nexus-700 text-white text-sm rounded-lg hover:bg-nexus-600">Activate Community</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Posts" value={(posts ?? []).length} />
        <StatCard label="Active Members" value={0} />
        <StatCard label="Moderation Queue" value={0} />
      </div>
      <EmptyState title="Community is not active" description="Activate the community module to allow customers to post, comment, and engage." />
    </div>
  );
}
