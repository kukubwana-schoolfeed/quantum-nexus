'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function SupportInbox(): JSX.Element {
  const tickets = MOCK_DATA.appSupportInbox.getTickets('t1', {});

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Support Inbox</h3>
      <DataTable
        columns={[
          { header: 'Subject', key: 'subject' },
          { header: 'User', key: 'userEmail' },
          {
            header: 'Status',
            key: 'status',
            render: (val) => <StatusBadge status={String(val)} />,
          },
          {
            header: 'Created',
            key: 'createdAt',
            render: (val) => new Date(String(val)).toLocaleDateString(),
          },
        ]}
        data={tickets as unknown as Record<string, unknown>[]}
        emptyMessage="No support tickets"
      />
    </div>
  );
}
