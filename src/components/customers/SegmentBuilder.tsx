'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

const customers = MOCK_DATA.customerDatabase.getCustomers('', {});

const tiers = [...new Set(customers.map(c => c.tier))];
const sources = [...new Set(customers.map(c => c.source))];

const segments = tiers.map(tier => ({
  tier,
  count: customers.filter(c => c.tier === tier).length,
  avgSpend: Math.round(customers.filter(c => c.tier === tier).reduce((s, c) => s + c.totalSpend, 0) / (customers.filter(c => c.tier === tier).length || 1)),
  avgVisits: Math.round(customers.filter(c => c.tier === tier).reduce((s, c) => s + c.visitCount, 0) / (customers.filter(c => c.tier === tier).length || 1)),
}));

export default function SegmentBuilder(): JSX.Element {
  const columns = [
    { header: 'Tier', key: 'tier', render: (v: unknown) => <StatusBadge status={String(v)} /> },
    { header: 'Customers', key: 'count' },
    { header: 'Avg Spend', key: 'avgSpend', render: (v: unknown) => `K${Number(v).toLocaleString()}` },
    { header: 'Avg Visits', key: 'avgVisits' },
  ];

  const sourceColumns = [
    { header: 'Source', key: 'source' },
    { header: 'Customers', key: 'count' },
  ];

  const sourceData = sources.map(source => ({
    source,
    count: customers.filter(c => c.source === source).length,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Customers" value={customers.length} icon="👥" />
        <StatCard label="Segments" value={tiers.length} icon="📊" />
        <StatCard label="Sources" value={sources.length} icon="🔗" />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-2">Tier Segments</h3>
        <DataTable columns={columns} data={segments as unknown as Record<string, unknown>[]} />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-2">Source Segments</h3>
        <DataTable columns={sourceColumns} data={sourceData as unknown as Record<string, unknown>[]} />
      </div>
    </div>
  );
}
