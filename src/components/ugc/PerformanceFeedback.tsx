'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';

const TENANT_ID = 't1';

export default function PerformanceFeedback(): JSX.Element {
  const performance = MOCK_DATA.ugcPerformanceFeedback.getPerformance(TENANT_ID, 'clip1');
  const topClips = MOCK_DATA.ugcPerformanceFeedback.getTopPerforming(TENANT_ID, {});

  const columns = [
    { header: 'Clip', key: 'hookText' },
    { header: 'Score', key: 'score' },
    { header: 'Duration', key: 'startTime', render: (val: unknown, row: Record<string, unknown>) => `${(val as number).toFixed(1)}s - ${(row.endTime as number).toFixed(1)}s` },
    { header: 'Status', key: 'status', render: (val: unknown) => <StatusBadge status={val as string} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Views" value={performance.views.toLocaleString()} />
        <StatCard label="Engagement" value={`${performance.engagement}%`} />
        <StatCard label="Saves" value={performance.saves} />
        <StatCard label="Shares" value={performance.shares} />
      </div>
      <div>
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Top Performing Clips</h4>
        <DataTable columns={columns} data={topClips as unknown as Record<string, unknown>[]} />
      </div>
    </div>
  );
}
