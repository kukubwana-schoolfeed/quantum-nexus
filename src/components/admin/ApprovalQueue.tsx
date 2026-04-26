'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function ApprovalQueue(): JSX.Element {
  const pending = MOCK_DATA.adminApprovalGate.getPendingAccounts('t1');

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Approval Queue</h3>
      <DataTable
        columns={[
          { header: 'Business Name', key: 'businessName' },
          { header: 'Tier', key: 'tier' },
          {
            header: 'Status',
            key: 'status',
            render: () => <StatusBadge status="pending_approval" />,
          },
          {
            header: 'Submitted',
            key: 'submittedAt',
            render: (val) => new Date(String(val)).toLocaleDateString(),
          },
        ]}
        data={pending as unknown as Record<string, unknown>[]}
        emptyMessage="No pending approvals"
      />
    </div>
  );
}
