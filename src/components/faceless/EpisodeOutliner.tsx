'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function EpisodeOutliner(): JSX.Element {
  const outlines = MOCK_DATA.facelessEpisodeOutliner.getOutlines('t1', 'sl1');

  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          { header: '#', key: 'episodeNumber' },
          { header: 'Title', key: 'title' },
          {
            header: 'Synopsis', key: 'synopsis',
            render: (val) => <span className="text-gray-400 text-xs">{String(val).slice(0, 60)}...</span>,
          },
          {
            header: 'Status', key: 'status',
            render: (val) => <StatusBadge status={String(val)} />,
          },
        ]}
        data={outlines as unknown as Record<string, unknown>[]}
        emptyMessage="No episode outlines yet"
      />
    </div>
  );
}
