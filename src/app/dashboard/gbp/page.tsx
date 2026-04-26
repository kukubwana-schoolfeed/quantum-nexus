'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import ProgressBar from '@/components/shared/ProgressBar';

export default function GbpPage() {
  const { data, loading, error, refetch } = useApi<{ profile: Record<string, unknown>; insights: Record<string, unknown> }>('/api/gbp');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Google Business Profile</h1>
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
          <h1 className="text-2xl font-bold text-white">Google Business Profile</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Google Business Profile</h1>
        </div>
        <EmptyState title="No Google Business Profile data" description="Connect your Google Business Profile to see insights and manage your listing." />
      </div>
    );
  }

  const profile = data.profile as { name: string; category: string; rating: number; reviewCount: number };
  const insights = data.insights as { views: number; searches: number; directionRequests: number };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Google Business Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your Google Business Profile, track insights, and publish updates.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Business Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Business Name</label>
            <p className="text-white font-semibold">{profile.name}</p>
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Category</label>
            <p className="text-white">{profile.category}</p>
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Rating</label>
            <p className="text-white font-semibold">{profile.rating} / 5.0</p>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className={star <= Math.round(profile.rating) ? 'text-yellow-400' : 'text-gray-600'}>★</span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Reviews</label>
            <p className="text-white font-semibold">{profile.reviewCount} reviews</p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Profile Views" value={insights.views} icon="👁️" trend="up" trendValue="+12%" />
        <StatCard label="Search Appearances" value={insights.searches} icon="🔍" trend="up" trendValue="+8%" />
        <StatCard label="Direction Requests" value={insights.directionRequests} icon="🗺️" sublabel="Get directions clicks" />
      </div>

      {/* Profile Completeness */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Profile Completeness</h2>
        <div className="space-y-4">
          <ProgressBar value={40} label="Basic Information" showPercent />
          <ProgressBar value={75} label="Photos & Media" showPercent />
          <ProgressBar value={60} label="Posts & Updates" showPercent />
          <ProgressBar value={90} label="Review Responses" showPercent />
        </div>
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
          Update Profile
        </button>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
          Publish Post
        </button>
      </div>
    </div>
  );
}
