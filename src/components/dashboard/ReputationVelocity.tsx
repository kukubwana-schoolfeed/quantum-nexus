'use client';

import { useApi } from '@/lib/hooks/useApi';
import StatusBadge from '@/components/shared/StatusBadge';
import type { ReputationVelocityDTO } from '@/lib/api/schema';

export default function ReputationVelocity(): JSX.Element {
  const { data: velocity } = useApi<ReputationVelocityDTO>('/api/reputation/velocity');

  if (!velocity) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 animate-pulse">
        <h3 className="text-xs text-gray-400 uppercase tracking-wider">Reputation Velocity</h3>
        <div className="mt-2 h-6 bg-gray-700 rounded w-24" />
        <div className="mt-3 space-y-1">
          <div className="h-3 bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-700 rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-xs text-gray-400 uppercase tracking-wider">Reputation Velocity</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">+{velocity.velocityScore}</span>
        <span className="text-xs text-gray-500">this week</span>
        <StatusBadge status={velocity.velocityTrend} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Backlinks</span>
          <span className="text-gray-300">+{velocity.newBacklinks}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Indexed</span>
          <span className="text-gray-300">+{velocity.newIndexedPages}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Reviews</span>
          <span className="text-gray-300">+{velocity.newReviews}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Followers</span>
          <span className="text-gray-300">+{velocity.netNewFollowers}</span>
        </div>
      </div>
    </div>
  );
}
