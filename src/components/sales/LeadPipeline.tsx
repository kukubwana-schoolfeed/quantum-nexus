'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

const campaigns = MOCK_DATA.outboundSalesEngine.getCampaigns('');
const totalTargets = campaigns.reduce((sum, c) => sum + c.targetsCount, 0);
const totalResponses = campaigns.reduce((sum, c) => sum + c.responsesCount, 0);
const responseRate = totalTargets > 0 ? ((totalResponses / totalTargets) * 100).toFixed(1) : '0';

export default function LeadPipeline(): JSX.Element {
  const columns = [
    { header: 'Campaign', key: 'name' },
    { header: 'Status', key: 'status', render: (v: unknown) => <StatusBadge status={String(v)} /> },
    { header: 'Targets', key: 'targetsCount' },
    { header: 'Responses', key: 'responsesCount' },
    {
      header: 'Conversion',
      key: 'targetsCount',
      render: (_: unknown, row: Record<string, unknown>) => {
        const targets = row.targetsCount as number;
        const responses = row.responsesCount as number;
        return targets > 0 ? `${((responses / targets) * 100).toFixed(1)}%` : '0%';
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Active Campaigns" value={campaigns.filter(c => c.status === 'active').length} icon="🎯" />
        <StatCard label="Total Targets" value={totalTargets} icon="📋" />
        <StatCard label="Response Rate" value={`${responseRate}%`} icon="📈" />
      </div>
      <DataTable columns={columns} data={campaigns as unknown as Record<string, unknown>[]} emptyMessage="No sales campaigns yet" />
    </div>
  );
}
