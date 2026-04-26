'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';
import ProgressBar from '@/components/shared/ProgressBar';

const campaigns = MOCK_DATA.outboundSalesEngine.getCampaigns('');

export default function OutreachTracker(): JSX.Element {
  const totalSent = campaigns.reduce((sum, c) => sum + c.targetsCount, 0);
  const totalReplied = campaigns.reduce((sum, c) => sum + c.responsesCount, 0);

  const columns = [
    { header: 'Campaign', key: 'name' },
    { header: 'Status', key: 'status', render: (v: unknown) => <StatusBadge status={String(v)} /> },
    { header: 'Reached', key: 'targetsCount' },
    { header: 'Replied', key: 'responsesCount' },
    {
      header: 'Progress',
      key: 'targetsCount',
      render: (_: unknown, row: Record<string, unknown>) => {
        const targets = row.targetsCount as number;
        const responses = row.responsesCount as number;
        const pct = targets > 0 ? Math.round((responses / targets) * 100) : 0;
        return <ProgressBar value={pct} showPercent />;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Reached" value={totalSent} icon="📤" />
        <StatCard label="Total Replies" value={totalReplied} icon="💬" />
        <StatCard label="Reply Rate" value={totalSent > 0 ? `${((totalReplied / totalSent) * 100).toFixed(1)}%` : '0%'} icon="📊" />
      </div>
      <DataTable columns={columns} data={campaigns as unknown as Record<string, unknown>[]} emptyMessage="No outreach campaigns" />
    </div>
  );
}
