'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function VoicePipeline(): JSX.Element {
  const voices = MOCK_DATA.facelessVoicePipeline.getVoices('t1');
  const completeCount = voices.filter(v => v.status === 'complete').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Voice Jobs" value={voices.length} />
        <StatCard label="Complete" value={completeCount} />
      </div>
      <DataTable
        columns={[
          { header: 'Voice ID', key: 'voiceId' },
          { header: 'Character', key: 'characterId' },
          { header: 'Provider', key: 'provider' },
          {
            header: 'Sample', key: 'sampleUrl',
            render: (val) => val
              ? <a href={String(val)} className="text-blue-400 text-xs hover:underline" target="_blank" rel="noreferrer">Play</a>
              : <span className="text-gray-500 text-xs">Pending</span>,
          },
          {
            header: 'Status', key: 'status',
            render: (val) => <StatusBadge status={String(val)} />,
          },
        ]}
        data={voices as unknown as Record<string, unknown>[]}
        emptyMessage="No voice pipeline jobs"
      />
    </div>
  );
}
