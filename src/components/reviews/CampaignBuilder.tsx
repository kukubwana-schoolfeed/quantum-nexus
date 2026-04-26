'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

const campaigns = MOCK_DATA.reviewCampaignManager.getCampaigns('');
const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
const totalResponses = campaigns.reduce((sum, c) => sum + c.responseCount, 0);

export default function CampaignBuilder(): JSX.Element {
  const columns = [
    { header: 'Campaign', key: 'name' },
    { header: 'Status', key: 'status', render: (v: unknown) => <StatusBadge status={String(v)} /> },
    { header: 'Sent', key: 'sentCount' },
    { header: 'Responses', key: 'responseCount' },
    {
      header: 'Response Rate',
      key: 'sentCount',
      render: (_: unknown, row: Record<string, unknown>) => {
        const sent = row.sentCount as number;
        const resp = row.responseCount as number;
        return sent > 0 ? `${((resp / sent) * 100).toFixed(1)}%` : '0%';
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Campaigns" value={campaigns.length} icon="📝" />
        <StatCard label="Review Requests Sent" value={totalSent} icon="📤" />
        <StatCard label="Reviews Received" value={totalResponses} icon="⭐" />
      </div>
      <DataTable columns={columns} data={campaigns as unknown as Record<string, unknown>[]} emptyMessage="No review campaigns" />
    </div>
  );
}
