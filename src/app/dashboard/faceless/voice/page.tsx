'use client';

/**
 * Voice Pipeline — Character voice synthesis management
 * Module: faceless-voice-pipeline
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';

const columns = [
  { header: 'Character ID', key: 'characterId' },
  { header: 'Provider', key: 'provider' },
  { header: 'Voice ID', key: 'voiceId' },
  {
    header: 'Sample',
    key: 'sampleUrl',
    render: (value: unknown) => {
      const url = String(value ?? '');
      return url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-xs underline"
        >
          Play Sample
        </a>
      ) : (
        <span className="text-gray-500 text-xs">No sample</span>
      );
    },
  },
];

export default function Page(): JSX.Element {
  const { data: voices, loading, error, refetch } = useApi<{ characterId: string; provider: string; voiceId: string; sampleUrl: string }[]>('/api/faceless/voices');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Voice Pipeline</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={3} />
        <SkeletonTable />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Voice Pipeline</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!voices || voices.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Voice Pipeline</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage character voice profiles and TTS synthesis across providers.
          </p>
        </div>
        <EmptyState
          title="No voice profiles yet"
          description="Generate a voice for your characters."
        />
      </div>
    );
  }

  const providers = new Set(voices.map(v => v.provider));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Voice Pipeline</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage character voice profiles and TTS synthesis across providers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Voice Profiles"
          value={voices.length}
          icon="🎙️"
        />
        <StatCard
          label="Providers"
          value={providers.size}
          icon="🔌"
        />
        <StatCard
          label="Characters with Voice"
          value={new Set(voices.map(v => v.characterId)).size}
          icon="👤"
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Voice Profiles</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Generate Voice
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <DataTable
          columns={columns}
          data={voices as unknown as Record<string, unknown>[]}
          emptyMessage="No voice profiles yet. Generate a voice for your characters."
        />
      </div>
    </div>
  );
}
