'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function VoiceAudition(): JSX.Element {
  const voices = MOCK_DATA.facelessVoicePipeline.getVoices('t1');

  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          { header: 'Voice ID', key: 'voiceId' },
          { header: 'Character', key: 'characterId' },
          { header: 'Provider', key: 'provider' },
          {
            header: 'Sample', key: 'sampleUrl',
            render: (val) => val
              ? <a href={String(val)} className="text-blue-400 text-xs hover:underline" target="_blank" rel="noreferrer">Listen</a>
              : <span className="text-gray-500 text-xs">No sample</span>,
          },
          {
            header: 'Status', key: 'status',
            render: (val) => <StatusBadge status={String(val)} />,
          },
        ]}
        data={voices as unknown as Record<string, unknown>[]}
        emptyMessage="No voice samples available"
      />
    </div>
  );
}
