'use client';

/**
 * App Reviews — App review monitoring and replies
 * Module: app-review-monitor
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import type { AppReviewDTO, AppReviewStatsDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import EmptyState from '@/components/shared/EmptyState';

interface AppReviewsData {
  reviews: AppReviewDTO[];
  stats: AppReviewStatsDTO;
}

export default function Page(): JSX.Element {
  const { data, loading, error, refetch } = useApi<AppReviewsData>('/api/app-developer/reviews');
  const reviews = data?.reviews ?? [];
  const stats = data?.stats ?? { averageRating: 0, totalReviews: 0, responseRate: 0 };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">App Reviews</h1>
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
          <h1 className="text-2xl font-bold text-white">App Reviews</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">App Reviews</h1>
        <p className="text-sm text-gray-400 mt-1">
          Monitor app reviews, track sentiment, and respond to user feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Average Rating"
          value={stats.averageRating.toFixed(1)}
          icon="⭐"
          sublabel="out of 5.0"
        />
        <StatCard
          label="Total Reviews"
          value={stats.totalReviews}
          icon="📝"
        />
        <StatCard
          label="Response Rate"
          value={`${stats.responseRate}%`}
          icon="💬"
          trend={stats.responseRate >= 80 ? 'up' : stats.responseRate >= 50 ? 'stable' : 'down'}
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Reviews</h2>
        <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Refresh Reviews
        </button>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          description="Reviews from the app store will appear here once users start leaving feedback."
        />
      ) : (
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
          <p className="text-gray-400 text-sm">Reviews will appear here.</p>
        </div>
      )}
    </div>
  );
}
