'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function ClientOverview(): JSX.Element {
  const clients = MOCK_DATA.resellerDashboard.getClients('t1');

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Client Overview</h3>
      <DataTable
        columns={[
          { header: 'Client', key: 'name' },
          {
            header: 'Status',
            key: 'status',
            render: (val) => <StatusBadge status={String(val)} />,
          },
          { header: 'Tier', key: 'tier' },
          {
            header: 'Monthly Spend',
            key: 'monthlySpend',
            render: (val) => `K${Number(val).toLocaleString()}`,
          },
        ]}
        data={clients as unknown as Record<string, unknown>[]}
        emptyMessage="No clients"
      />
    </div>
  );
}
