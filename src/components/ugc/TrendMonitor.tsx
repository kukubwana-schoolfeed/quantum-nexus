'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import ProgressBar from '@/components/shared/ProgressBar';

const TENANT_ID = 't1';

export default function TrendMonitor(): JSX.Element {
  const trends = MOCK_DATA.ugcTrendMonitor.getTrends(TENANT_ID);
  const avgScore = trends.length > 0 ? Math.round(trends.reduce((s, t) => s + t.score, 0) / trends.length) : 0;
  const soundCount = trends.filter(t => t.trendType === 'sound').length;

  const columns = [
    { header: 'Trend', key: 'trendText' },
    { header: 'Type', key: 'trendType' },
    { header: 'Platform', key: 'platform' },
    {
      header: 'Score',
      key: 'score',
      render: (val: unknown, _row: Record<string, unknown>) => (
        <ProgressBar value={val as number} showPercent={true} />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Active Trends" value={trends.length} />
        <StatCard label="Avg Score" value={avgScore} />
        <StatCard label="Sound Trends" value={soundCount} />
      </div>
      <DataTable columns={columns} data={trends as unknown as Record<string, unknown>[]} />
    </div>
  );
}
