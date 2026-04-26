'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

const campaigns = MOCK_DATA.seasonalCampaignEngine.getCampaigns('');

export default function CampaignPlanner(): JSX.Element {
  const columns = [
    { header: 'Campaign', key: 'name' },
    { header: 'Status', key: 'status', render: (v: unknown) => <StatusBadge status={String(v)} /> },
    {
      header: 'Starts',
      key: 'startsAt',
      render: (v: unknown) => new Date(String(v)).toLocaleDateString(),
    },
    {
      header: 'Ends',
      key: 'endsAt',
      render: (v: unknown) => new Date(String(v)).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Campaigns" value={campaigns.length} icon="🗓️" />
        <StatCard label="Scheduled" value={campaigns.filter(c => c.status === 'scheduled').length} icon="📅" />
        <StatCard label="Drafts" value={campaigns.filter(c => c.status === 'draft').length} icon="📝" />
      </div>
      <DataTable columns={columns} data={campaigns as unknown as Record<string, unknown>[]} emptyMessage="No seasonal campaigns" />
    </div>
  );
}
