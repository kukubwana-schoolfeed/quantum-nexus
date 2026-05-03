'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';

interface Video {
  id: string;
  [key: string]: unknown;
}

interface Clip {
  id: string;
  status: string;
  [key: string]: unknown;
}

interface PerformanceData {
  views: number;
  engagement: number;
  saves: number;
  shares: number;
}

export default function UGCStudioPage(): JSX.Element {
  const { data: videos, loading: videosLoading, error: videosError, refetch: refetchVideos } = useApi<Video[]>('/api/ugc/videos');
  const { data: clips, loading: clipsLoading, error: clipsError, refetch: refetchClips } = useApi<Clip[]>('/api/ugc/clips');
  const { data: perf, loading: perfLoading, error: perfError, refetch: refetchPerf } = useApi<PerformanceData>('/api/ugc/performance');

  const loading = videosLoading || clipsLoading || perfLoading;
  const error = videosError || clipsError || perfError;
  const refetch = videosError ? refetchVideos : clipsError ? refetchClips : refetchPerf;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">UGC Studio</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <SkeletonGrid count={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">UGC Studio</h1>
          <p className="text-sm text-gray-400 mt-1">Upload, clip, schedule, and monetise your content</p>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const videoArr = videos ?? [];
  const clipArr = clips ?? [];
  const perfData = perf ?? { views: 0, engagement: 0, saves: 0, shares: 0 };

  if (!videos && !clips && !perf) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">UGC Studio</h1>
          <p className="text-sm text-gray-400 mt-1">Upload, clip, schedule, and monetise your content</p>
        </div>
        <EmptyState
          title="No UGC data available"
          description="Upload videos and start creating clips to see your UGC studio overview."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">UGC Studio</h1>
        <p className="text-sm text-gray-400 mt-1">Upload, clip, schedule, and monetise your content</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Videos Uploaded" value={videoArr.length} />
        <StatCard label="Clip Candidates" value={clipArr.length} />
        <StatCard label="Total Views" value={(perfData.views ?? 0).toLocaleString()} />
        <StatCard label="Engagement Rate" value={`${perfData.engagement}%`} trend="up" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Upload Video</h2>
          <p className="text-xs text-gray-500 mt-1">{videoArr.length} videos processed</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Clip Preview</h2>
          <p className="text-xs text-gray-500 mt-1">{clipArr?.filter(c => c.status === 'candidate')?.length ?? 0} candidates awaiting review</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Content Calendar</h2>
          <p className="text-xs text-gray-500 mt-1">Schedule clips across platforms</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Trends</h2>
          <p className="text-xs text-gray-500 mt-1">UGC trend monitoring</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Performance</h2>
          <p className="text-xs text-gray-500 mt-1">{perfData.saves} saves, {perfData.shares} shares</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Monetisation</h2>
          <p className="text-xs text-gray-500 mt-1">Track YouTube thresholds & brand deals</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Podcast</h2>
          <p className="text-xs text-gray-500 mt-1">Audio processing & audiograms</p>
        </div>
      </div>
    </div>
  );
}
