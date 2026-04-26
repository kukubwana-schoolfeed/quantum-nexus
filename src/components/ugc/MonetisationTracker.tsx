'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import ProgressBar from '@/components/shared/ProgressBar';

const TENANT_ID = 't1';

export default function MonetisationTracker(): JSX.Element {
  const opportunities = MOCK_DATA.ugcMonetisationIntelligence.getOpportunities(TENANT_ID);
  const brandDeals = MOCK_DATA.ugcMonetisationIntelligence.getBrandDeals(TENANT_ID);
  const rates = MOCK_DATA.ugcMonetisationIntelligence.getSuggestedRates(TENANT_ID);

  const columns = [
    { header: 'Brand', key: 'brandName' },
    { header: 'Type', key: 'campaignType' },
    {
      header: 'Est. Pay',
      key: 'estimatedPay',
      render: (val: unknown) => `K${(val as number).toLocaleString()}`,
    },
    {
      header: 'Deadline',
      key: 'deadline',
      render: (val: unknown) => new Date(val as string).toLocaleDateString(),
    },
    { header: 'Status', key: 'status', render: (val: unknown) => <StatusBadge status={val as string} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Opportunities" value={opportunities.length} />
        <StatCard label="Brand Deals" value={brandDeals.length} />
        <StatCard label="Suggested Rate" value={`K${rates.suggestedRate.toLocaleString()}`} sublabel={`K${rates.minRate} - K${rates.maxRate}`} />
      </div>
      <div>
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Rate Position</h4>
        <ProgressBar value={rates.suggestedRate} max={rates.maxRate} label="Suggested vs Max" />
      </div>
      <DataTable columns={columns} data={opportunities as unknown as Record<string, unknown>[]} />
    </div>
  );
}
