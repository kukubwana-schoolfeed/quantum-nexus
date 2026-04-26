'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';

export default function FacelessStudioPage(): JSX.Element {
  const { data: characters, loading: loadingChars, error: errorChars, refetch: refetchChars } = useApi<{ length: number }[]>('/api/faceless/characters');
  const { data: storylines, loading: loadingStory, error: errorStory, refetch: refetchStory } = useApi<{ length: number }[]>('/api/faceless/storylines');
  const { data: audience, loading: loadingAud, error: errorAud, refetch: refetchAud } = useApi<{ insights: { engagementPeakDay: string; suggestedPostTime: string }; growthData: { subscribers: number; views: number } }>('/api/faceless/audience');

  const loading = loadingChars || loadingStory || loadingAud;
  const error = errorChars || errorStory || errorAud;

  const refetch = () => {
    refetchChars();
    refetchStory();
    refetchAud();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Faceless Studio</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <SkeletonGrid count={3} />
        <SkeletonPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Faceless Studio</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const growthData = audience?.growthData;
  const insights = audience?.insights;

  if (!characters || !storylines || !audience) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Faceless Studio</h1>
        </div>
        <EmptyState title="No data available" description="Faceless studio data could not be loaded." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Faceless Studio</h1>
        <p className="text-sm text-gray-400 mt-1">Build characters, craft stories, produce episodes</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Characters" value={characters.length} />
        <StatCard label="Active Storylines" value={storylines.length} />
        <StatCard label="Subscribers" value={growthData?.subscribers.toLocaleString() ?? '0'} trend="up" trendValue="+12.5%" />
        <StatCard label="Views" value={growthData?.views.toLocaleString() ?? '0'} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Character Studio</h2>
          <p className="text-xs text-gray-500 mt-1">{characters.length} character(s) defined</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Storyline Editor</h2>
          <p className="text-xs text-gray-500 mt-1">{storylines.length} storyline(s) in progress</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Series Bible</h2>
          <p className="text-xs text-gray-500 mt-1">World rules & character reference</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Episode Outliner</h2>
          <p className="text-xs text-gray-500 mt-1">Plan episodes and scenes</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Voice Pipeline</h2>
          <p className="text-xs text-gray-500 mt-1">ElevenLabs character voices</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Assembly Pipeline</h2>
          <p className="text-xs text-gray-500 mt-1">Render & export episodes</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Audience Intelligence</h2>
          <p className="text-xs text-gray-500 mt-1">Peak day: {insights?.engagementPeakDay ?? 'N/A'} at {insights?.suggestedPostTime ?? 'N/A'}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Episode Tracker</h2>
          <p className="text-xs text-gray-500 mt-1">Performance tracking per episode</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-nexus-700 transition-colors cursor-pointer">
          <h2 className="text-sm font-semibold text-white">Scene Breakdown</h2>
          <p className="text-xs text-gray-500 mt-1">Scene-by-scene content planning</p>
        </div>
      </div>
    </div>
  );
}
