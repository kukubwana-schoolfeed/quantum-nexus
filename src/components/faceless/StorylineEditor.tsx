'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function StorylineEditor(): JSX.Element {
  const storylines = MOCK_DATA.facelessStorylineEditor.getStorylines('t1');
  const totalEpisodes = storylines.reduce((sum, s) => sum + s.episodeCount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Storylines" value={storylines.length} />
        <StatCard label="Total Episodes" value={totalEpisodes} />
      </div>
      <DataTable
        columns={[
          { header: 'Title', key: 'title' },
          { header: 'Character', key: 'characterId' },
          { header: 'Episodes', key: 'episodeCount' },
          {
            header: 'Status', key: 'status',
            render: (val) => <StatusBadge status={String(val)} />,
          },
          {
            header: 'Description', key: 'description',
            render: (val) => <span className="text-gray-400 text-xs">{val ? String(val).slice(0, 60) + '...' : '\u2014'}</span>,
          },
        ]}
        data={storylines as unknown as Record<string, unknown>[]}
        emptyMessage="No storylines created yet"
      />
    </div>
  );
}
