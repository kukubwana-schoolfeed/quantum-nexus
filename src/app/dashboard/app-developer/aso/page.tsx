'use client';

/**
 * ASO Dashboard — App Store Optimization
 * Module: app-store-optimizer
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import type { AppListingDTO, ASOScoreDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import ProgressBar from '@/components/shared/ProgressBar';

interface AppAsoData {
  listing: AppListingDTO;
  asoScore: ASOScoreDTO;
}

export default function Page(): JSX.Element {
  const { data, loading, error, refetch } = useApi<AppAsoData>('/api/app-developer/aso');
  const listing = data?.listing ?? { title: '', description: '', keywords: [] };
  const asoScore = data?.asoScore ?? { score: 0, suggestions: [] };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">ASO Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={3} />
        <SkeletonPanel />
        <SkeletonPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">ASO Dashboard</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">ASO Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Optimise your app store listing for better visibility and downloads.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="ASO Score"
          value={asoScore.score}
          icon="📊"
          trend={asoScore.score >= 70 ? 'up' : 'stable'}
          trendValue={`${asoScore.score}/100`}
        />
        <StatCard
          label="Listing Title"
          value={listing.title}
          icon="🏷️"
        />
        <StatCard
          label="Keywords"
          value={listing.keywords?.length ?? 0}
          icon="🔑"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">ASO Score Breakdown</h2>
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-5 space-y-4">
          <ProgressBar
            value={asoScore.score}
            max={100}
            label="Overall ASO Score"
            showPercent
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Optimisation Suggestions</h2>
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-5">
          {asoScore.suggestions?.length ? (
            <ul className="space-y-3">
              {asoScore.suggestions.map((suggestion: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">!</span>
                  <span className="text-gray-300 text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No suggestions at this time.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Listing Details</h2>
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-5 space-y-3">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Title</span>
            <p className="text-white text-sm mt-1">{listing.title}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Description</span>
            <p className="text-gray-300 text-sm mt-1">{listing.description}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Keywords</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {listing.keywords?.map((kw: string, idx: number) => (
                <span
                  key={idx}
                  className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Check Rank History
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Update Listing
        </button>
      </div>
    </div>
  );
}
