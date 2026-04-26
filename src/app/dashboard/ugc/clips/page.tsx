'use client';

/**
 * Clip Intelligence — AI-powered clip extraction from videos
 * Module: ugcClipIntelligence
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

interface Clip {
  id: string;
  videoId: string;
  startTime: number;
  endTime: number;
  score: number;
  hookText: string;
  status: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function Page(): JSX.Element {
  const { data: clips, loading, error, refetch } = useApi<Clip[]>('/api/ugc/clips');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Clip Intelligence</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <SkeletonTable />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Clip Intelligence</h1>
          <p className="text-sm text-gray-400 mt-1">
            AI-powered clip extraction and scoring from your UGC videos
          </p>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const clipList = clips ?? [];
  const avgScore =
    clipList.length > 0
      ? Math.round(clipList.reduce((sum, c) => sum + c.score, 0) / clipList.length)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Clip Intelligence</h1>
        <p className="text-sm text-gray-400 mt-1">
          AI-powered clip extraction and scoring from your UGC videos
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Clips"
          value={clipList.length}
          icon="CL"
          sublabel="extracted clips"
        />
        <StatCard
          label="Avg Score"
          value={avgScore}
          icon="SC"
          sublabel="clip quality score"
        />
        <StatCard
          label="Candidates"
          value={clipList.filter((c) => c.status === 'candidate').length}
          icon="CD"
          sublabel="awaiting review"
        />
        <StatCard
          label="Approved"
          value={clipList.filter((c) => c.status === 'approved').length}
          icon="AP"
          sublabel="ready to publish"
        />
      </div>

      {/* Clips Table */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Extracted Clips</h2>
        <DataTable
          columns={[
            { header: 'Video ID', key: 'videoId' },
            {
              header: 'Start',
              key: 'startTime',
              render: (value) => formatTime(Number(value)),
            },
            {
              header: 'End',
              key: 'endTime',
              render: (value) => formatTime(Number(value)),
            },
            {
              header: 'Score',
              key: 'score',
              render: (value) => (
                <span className="font-mono text-white">{String(value)}</span>
              ),
            },
            { header: 'Hook Text', key: 'hookText' },
            {
              header: 'Status',
              key: 'status',
              render: (value) => <StatusBadge status={String(value)} />,
            },
          ]}
          data={clipList.map((c) => ({
            id: c.id,
            videoId: c.videoId,
            startTime: c.startTime,
            endTime: c.endTime,
            score: c.score,
            hookText: c.hookText,
            status: c.status,
          }))}
          emptyMessage="No clips extracted yet. Analyse a video to discover clips."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Analyse Video
        </button>
      </div>
    </div>
  );
}
