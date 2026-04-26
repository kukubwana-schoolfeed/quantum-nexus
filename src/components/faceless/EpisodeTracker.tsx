'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ProgressBar from '@/components/shared/ProgressBar';
import DataTable from '@/components/shared/DataTable';

export default function EpisodeTracker(): JSX.Element {
  const episodes = MOCK_DATA.facelessEpisodeTracker.getEpisodes('t1', 'sl1');
  const totalViews = episodes.reduce((sum, e) => sum + e.views, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Episodes" value={episodes.length} />
        <StatCard label="Total Views" value={totalViews.toLocaleString()} />
        <StatCard label="Avg Engagement" value={episodes.length ? Math.round(episodes.reduce((s, e) => s + e.engagement, 0) / episodes.length) + '%' : '0%'} />
      </div>
      <DataTable
        columns={[
          { header: '#', key: 'episodeNumber' },
          { header: 'Title', key: 'title' },
          {
            header: 'Status', key: 'status',
            render: (val) => <StatusBadge status={String(val)} />,
          },
          { header: 'Views', key: 'views' },
          {
            header: 'Engagement', key: 'engagement',
            render: (val) => <ProgressBar value={val as number} label="" showPercent />,
          },
        ]}
        data={episodes as unknown as Record<string, unknown>[]}
        emptyMessage="No episodes tracked yet"
      />
    </div>
  );
}
