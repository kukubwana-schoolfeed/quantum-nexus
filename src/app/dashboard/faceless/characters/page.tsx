'use client';

/**
 * Character Studio — Faceless character builder
 * Module: faceless-character-studio
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

const columns = [
  { header: 'Name', key: 'name' },
  { header: 'Personality', key: 'personality' },
  { header: 'Voice ID', key: 'voiceId' },
  { header: 'Avatar Style', key: 'avatarStyle' },
  {
    header: 'Status',
    key: 'isActive',
    render: (value: unknown) => (
      <StatusBadge status={value ? 'active' : 'draft'} />
    ),
  },
];

export default function Page(): JSX.Element {
  const { data: characters, loading, error, refetch } = useApi<{ name: string; personality: string; voiceId: string; avatarStyle: string; isActive: boolean }[]>('/api/faceless/characters');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Character Studio</h1>
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
          <h1 className="text-2xl font-bold text-white">Character Studio</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!characters || characters.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Character Studio</h1>
          <p className="text-sm text-gray-400 mt-1">
            Create and manage faceless channel characters with unique personalities and voices.
          </p>
        </div>
        <EmptyState
          title="No characters created yet"
          description="Create your first character to get started."
        />
      </div>
    );
  }

  const activeCount = characters.filter(c => c.isActive).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Character Studio</h1>
        <p className="text-sm text-gray-400 mt-1">
          Create and manage faceless channel characters with unique personalities and voices.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Characters"
          value={characters.length}
          icon="👤"
        />
        <StatCard
          label="Active Characters"
          value={activeCount}
          icon="✅"
        />
        <StatCard
          label="Voice Profiles"
          value={new Set(characters.map(c => c.voiceId)).size}
          icon="🎙️"
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Characters</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Create Character
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <DataTable
          columns={columns}
          data={characters as unknown as Record<string, unknown>[]}
          emptyMessage="No characters created yet. Create your first character to get started."
        />
      </div>
    </div>
  );
}
