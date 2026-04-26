'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function SupportKnowledgeBase(): JSX.Element {
  const entries = MOCK_DATA.knowledgeBaseBuilder.getEntries('t1', {});

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Knowledge Base</h3>
      <DataTable
        columns={[
          { header: 'Title', key: 'title' },
          { header: 'Category', key: 'category' },
          {
            header: 'Active',
            key: 'isActive',
            render: (val) => <StatusBadge status={val ? 'active' : 'archived'} />,
          },
        ]}
        data={entries as unknown as Record<string, unknown>[]}
        emptyMessage="No knowledge base entries"
      />
    </div>
  );
}
