'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';

const entries = MOCK_DATA.knowledgeBaseBuilder.getEntries('t1', { category: 'services' });
const serviceEntries = entries.filter(e => e.category === 'services');

const columns = [
  { header: 'Title', key: 'title' },
  {
    header: 'Pricing Details',
    key: 'content',
    render: (v: unknown) => {
      const text = String(v ?? '');
      return text.length > 80 ? text.slice(0, 80) + '...' : text;
    },
  },
  {
    header: 'Active',
    key: 'isActive',
    render: (v: unknown) => <StatusBadge status={v ? 'active' : 'draft'} />,
  },
];

export default function PriceListEditor(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Service Entries" value={serviceEntries.length} icon="$" />
        <StatCard label="Active" value={serviceEntries.filter(e => e.isActive).length} icon="ON" />
      </div>
      <DataTable
        columns={columns}
        data={serviceEntries as unknown as Record<string, unknown>[]}
        emptyMessage="No service/pricing entries found"
      />
    </div>
  );
}
