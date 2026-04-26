'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import ProgressBar from '@/components/shared/ProgressBar';
import DataTable from '@/components/shared/DataTable';

export default function SceneBreakdown(): JSX.Element {
  const scenes = MOCK_DATA.facelessSceneBreakdown.getScenes('t1', 'eo1');
  const totalDuration = scenes.reduce((sum, s) => sum + s.durationSeconds, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Scenes" value={scenes.length} />
        <StatCard label="Total Duration" value={`${totalDuration}s`} />
      </div>
      <DataTable
        columns={[
          { header: '#', key: 'sceneNumber' },
          {
            header: 'Description', key: 'description',
            render: (val) => <span className="text-gray-300 text-xs">{String(val)}</span>,
          },
          { header: 'Style', key: 'visualStyle' },
          { header: 'Duration', key: 'durationSeconds' },
          {
            header: 'Script', key: 'scriptText',
            render: (val) => <span className="text-gray-400 text-xs">{String(val).slice(0, 50)}...</span>,
          },
        ]}
        data={scenes as unknown as Record<string, unknown>[]}
        emptyMessage="No scenes defined yet"
      />
    </div>
  );
}
