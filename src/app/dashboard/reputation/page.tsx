'use client';

import { useApi } from '@/lib/hooks/useApi';
import type { ReputationOverviewDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import ProgressBar from '@/components/shared/ProgressBar';

export default function ReputationPage() {
  const { data: overview, loading, error, refetch } = useApi<ReputationOverviewDTO>('/api/reputation/overview');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reputation</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <SkeletonPanel />
        <SkeletonPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reputation</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reputation</h1>
        </div>
        <EmptyState title="No reputation data available" description="Reputation data will appear once reviews start coming in." />
      </div>
    );
  }

  const ratingColor = overview.averageRating >= 4.0
    ? 'text-green-400'
    : overview.averageRating >= 3.0
      ? 'text-yellow-400'
      : 'text-red-400';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reputation</h1>
        <p className="text-gray-400 text-sm mt-1">Monitor your online reputation, track reviews, and manage response rates.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Average Rating" value={overview.averageRating.toFixed(1)} icon="⭐" sublabel="Out of 5.0" />
        <StatCard label="Total Reviews" value={overview.totalReviews} icon="📝" sublabel="Across all platforms" />
        <StatCard label="Response Rate" value={`${overview.responseRate}%`} icon="💬" trend="up" trendValue="+5%" />
        <StatCard label="Review Trend" value="Stable" icon="📊" sublabel="Last 30 days" />
      </div>

      {/* Rating Breakdown */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Rating Overview</h2>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className={`text-5xl font-bold ${ratingColor}`}>{overview.averageRating.toFixed(1)}</p>
            <div className="flex gap-1 mt-2 justify-center">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className={star <= Math.round(overview.averageRating) ? 'text-yellow-400' : 'text-gray-600'}>★</span>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-1">{overview.totalReviews} reviews</p>
          </div>
          <div className="flex-1 space-y-2">
            <ProgressBar value={75} max={100} label="5 stars" showPercent={false} colorClass="bg-green-500" />
            <ProgressBar value={15} max={100} label="4 stars" showPercent={false} colorClass="bg-green-400" />
            <ProgressBar value={6} max={100} label="3 stars" showPercent={false} colorClass="bg-yellow-500" />
            <ProgressBar value={3} max={100} label="2 stars" showPercent={false} colorClass="bg-orange-500" />
            <ProgressBar value={1} max={100} label="1 star" showPercent={false} colorClass="bg-red-500" />
          </div>
        </div>
      </div>

      {/* Response Performance */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Response Performance</h2>
        <ProgressBar value={overview.responseRate} label="Review Response Rate" showPercent />
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
          Respond to Reviews
        </button>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
          Generate Review Link
        </button>
      </div>
    </div>
  );
}
