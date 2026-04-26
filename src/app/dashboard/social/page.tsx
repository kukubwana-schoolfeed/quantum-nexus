'use client';

import { useApi } from '@/lib/hooks/useApi';
import type { ConnectedPlatformDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';

export default function SocialMediaPage(): JSX.Element {
  const { data: platforms, loading, error, refetch } = useApi<ConnectedPlatformDTO[]>('/api/social/platforms');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Social Media</h1>
            <p className="text-sm text-gray-400 mt-1">Loading...</p>
          </div>
        </div>
        <SkeletonGrid count={3} />
        <SkeletonTable />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Social Media</h1>
          </div>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Social Media</h1>
          <p className="text-sm text-gray-400 mt-1">Manage posting, engagement, and connected platforms</p>
        </div>
        <button className="px-4 py-2 bg-nexus-700 text-white text-sm rounded-lg hover:bg-nexus-600">+ Connect Platform</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Connected Platforms" value={platforms?.length ?? 0} icon="◎" />
        <StatCard label="Posts Today" value={3} trend="up" trendValue="+1" icon="◧" />
        <StatCard label="Engagement Rate" value="6.8%" trend="up" trendValue="+0.5%" icon="◫" />
      </div>

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h2 className="text-sm font-semibold text-white mb-3">Connected Accounts</h2>
        {platforms && platforms.length > 0 ? (
          <div className="space-y-2">
            {platforms.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-900/50 rounded">
                <div className="flex items-center gap-3">
                  <StatusBadge status={p.connected ? 'active' : 'suspended'} />
                  <span className="text-sm text-gray-300 capitalize">{p.platform}</span>
                  <span className="text-xs text-gray-500">{p.username}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400">Expires: {p.tokenExpiresAt ? new Date(p.tokenExpiresAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No platforms connected" description="Connect a social media platform to get started." />
        )}
      </div>
    </div>
  );
}
