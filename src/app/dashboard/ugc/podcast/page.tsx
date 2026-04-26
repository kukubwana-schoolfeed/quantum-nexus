'use client';

/**
 * Podcast — Podcast processing and audiograms
 * Module: ugcPodcastSupport
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';

interface Episode {
  id: string;
  title?: string;
}

export default function Page(): JSX.Element {
  const { data: episodes, loading, error, refetch } = useApi<Episode[]>('/api/ugc/podcast');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">UGC Podcast</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <SkeletonPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">UGC Podcast</h1>
          <p className="text-sm text-gray-400 mt-1">
            Upload and manage your podcast episodes for content repurposing
          </p>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const episodeList = episodes ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">UGC Podcast</h1>
        <p className="text-sm text-gray-400 mt-1">
          Upload and manage your podcast episodes for content repurposing
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Episodes"
          value={episodeList.length}
          icon="EP"
          sublabel="total episodes"
        />
        <StatCard
          label="Published"
          value={0}
          icon="PB"
          sublabel="live episodes"
        />
        <StatCard
          label="Processing"
          value={0}
          icon="PR"
          sublabel="being processed"
        />
        <StatCard
          label="Total Duration"
          value="0m"
          icon="DR"
          sublabel="combined runtime"
        />
      </div>

      {/* Episodes List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Podcast Episodes</h2>
        {episodeList.length === 0 ? (
          <EmptyState
            title="No podcast episodes"
            description="Upload your first podcast episode to start repurposing audio content into clips, transcripts, and social posts."
          />
        ) : (
          <div className="space-y-3">
            {episodeList.map((ep, i) => (
              <div
                key={String(ep.id ?? i)}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <span className="text-white">{String(ep.title ?? ep.id)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Upload Episode
        </button>
      </div>
    </div>
  );
}
