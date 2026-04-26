'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';

const entries = MOCK_DATA.knowledgeBaseBuilder.getEntries('t1', {});

const columns = [
  { header: 'Title', key: 'title' },
  { header: 'Category', key: 'category' },
  {
    header: 'Content',
    key: 'content',
    render: (v: unknown) => {
      const text = String(v ?? '');
      return text.length > 60 ? text.slice(0, 60) + '...' : text;
    },
  },
  {
    header: 'Active',
    key: 'isActive',
    render: (v: unknown) => <StatusBadge status={v ? 'active' : 'draft'} />,
  },
];

export default function KnowledgeBase(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Entries" value={entries.length} icon="KB" />
        <StatCard
          label="Active"
          value={entries.filter(e => e.isActive).length}
          icon="ON"
        />
        <StatCard
          label="Categories"
          value={new Set(entries.map(e => e.category)).size}
          icon="TAG"
        />
      </div>
      <DataTable
        columns={columns}
        data={entries as unknown as Record<string, unknown>[]}
        emptyMessage="No knowledge base entries"
      />
    </div>
  );
}
