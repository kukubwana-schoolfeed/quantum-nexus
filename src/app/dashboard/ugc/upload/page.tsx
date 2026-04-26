'use client';

/**
 * Upload Video — UGC video upload and ingestion
 * Module: ugcVideoIngestion
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

interface Video {
  id: string;
  fileName: string;
  fileSize: number;
  status: string;
  uploadedAt: string;
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Page(): JSX.Element {
  const { data: videos, loading, error, refetch } = useApi<Video[]>('/api/ugc/videos');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">UGC Video Upload</h1>
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
          <h1 className="text-2xl font-bold text-white">UGC Video Upload</h1>
          <p className="text-sm text-gray-400 mt-1">
            Upload and manage raw user-generated content videos
          </p>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const videoList = videos ?? [];
  const totalSize = videoList.reduce((sum, v) => sum + v.fileSize, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">UGC Video Upload</h1>
        <p className="text-sm text-gray-400 mt-1">
          Upload and manage raw user-generated content videos
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Videos"
          value={videoList.length}
          icon="VD"
          sublabel="uploaded videos"
        />
        <StatCard
          label="Total Size"
          value={formatFileSize(totalSize)}
          icon="SZ"
          sublabel="storage used"
        />
        <StatCard
          label="Transcribed"
          value={videoList.filter((v) => v.status === 'transcribed').length}
          icon="TR"
          sublabel="ready for clipping"
        />
        <StatCard
          label="Processing"
          value={videoList.filter((v) => v.status === 'uploading').length}
          icon="PR"
          sublabel="in progress"
        />
      </div>

      {/* Video List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Uploaded Videos</h2>
        <DataTable
          columns={[
            { header: 'Filename', key: 'fileName' },
            {
              header: 'Size',
              key: 'fileSize',
              render: (value) => formatFileSize(Number(value)),
            },
            {
              header: 'Status',
              key: 'status',
              render: (value) => <StatusBadge status={String(value)} />,
            },
            {
              header: 'Upload Date',
              key: 'uploadedAt',
              render: (value) => formatDate(String(value)),
            },
          ]}
          data={videoList.map((v) => ({
            id: v.id,
            fileName: v.fileName,
            fileSize: v.fileSize,
            status: v.status,
            uploadedAt: v.uploadedAt,
          }))}
          emptyMessage="No videos uploaded yet. Upload a video to get started."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Upload Video
        </button>
      </div>
    </div>
  );
}
