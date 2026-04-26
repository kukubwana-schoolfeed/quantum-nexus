'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

const items = MOCK_DATA.approvalQueue.getItems('');
const pendingCount = items.filter(i => i.status === 'pending_approval').length;

export default function ApprovalQueue(): JSX.Element {
  const columns = [
    { header: 'Type', key: 'contentType' },
    { header: 'Platform', key: 'platform' },
    { header: 'Status', key: 'status', render: (v: unknown) => <StatusBadge status={String(v)} /> },
    {
      header: 'Submitted',
      key: 'createdAt',
      render: (v: unknown) => new Date(String(v)).toLocaleString(),
    },
    {
      header: 'Actions',
      key: 'id',
      render: () => (
        <div className="flex gap-2">
          <button className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-500">Approve</button>
          <button className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500">Reject</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Pending Approval" value={pendingCount} icon="⏳" />
        <StatCard label="Total Items" value={items.length} icon="📋" />
      </div>
      <DataTable columns={columns} data={items as unknown as Record<string, unknown>[]} emptyMessage="No items in approval queue" />
    </div>
  );
}
