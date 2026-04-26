'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';

const TENANT_ID = 't1';

function formatFileSize(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${(bytes / 1_024).toFixed(0)} KB`;
}

export default function VideoUploader(): JSX.Element {
  const videos = MOCK_DATA.ugcVideoIngestion.getVideos(TENANT_ID, {});
  const totalSize = videos.reduce((sum, v) => sum + v.fileSize, 0);
  const transcribed = videos.filter(v => v.status === 'transcribed' || v.status === 'analysed').length;

  const columns = [
    { header: 'File Name', key: 'fileName' },
    { header: 'Size', key: 'fileSize', render: (val: unknown) => formatFileSize(val as number) },
    { header: 'Status', key: 'status', render: (val: unknown) => <StatusBadge status={val as string} /> },
    { header: 'Uploaded', key: 'uploadedAt', render: (val: unknown) => new Date(val as string).toLocaleDateString() },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Videos" value={videos.length} />
        <StatCard label="Total Size" value={formatFileSize(totalSize)} />
        <StatCard label="Transcribed" value={transcribed} sublabel={`of ${videos.length}`} />
      </div>
      <DataTable columns={columns} data={videos as unknown as Record<string, unknown>[]} />
    </div>
  );
}
