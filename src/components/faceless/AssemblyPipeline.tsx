'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';
import ProgressBar from '@/components/shared/ProgressBar';
import DataTable from '@/components/shared/DataTable';

export default function AssemblyPipeline(): JSX.Element {
  const jobs = MOCK_DATA.facelessAssemblyPipeline.getJobs('t1', {});

  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          { header: 'Episode', key: 'episodeId' },
          {
            header: 'Status', key: 'status',
            render: (val) => <StatusBadge status={String(val)} />,
          },
          {
            header: 'Progress', key: 'progress',
            render: (val) => <ProgressBar value={val as number} label="" showPercent />,
          },
          {
            header: 'Preview', key: 'previewUrl',
            render: (val) => val
              ? <a href={String(val)} className="text-blue-400 text-xs hover:underline" target="_blank" rel="noreferrer">Preview</a>
              : <span className="text-gray-500 text-xs">\u2014</span>,
          },
        ]}
        data={jobs as unknown as Record<string, unknown>[]}
        emptyMessage="No assembly jobs running"
      />
    </div>
  );
}
