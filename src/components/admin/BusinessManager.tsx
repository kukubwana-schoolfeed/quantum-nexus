'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function BusinessManager(): JSX.Element {
  const tenants = MOCK_DATA.superAdminDashboard.getTenantList('t1', {});

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Business Manager</h3>
      <DataTable
        columns={[
          { header: 'Business', key: 'businessName' },
          { header: 'Tier', key: 'tier' },
          {
            header: 'Status',
            key: 'status',
            render: (val) => <StatusBadge status={String(val)} />,
          },
          {
            header: 'Health',
            key: 'healthScore',
            render: (val) => (val != null ? `${val}/100` : '--'),
          },
        ]}
        data={tenants as unknown as Record<string, unknown>[]}
        emptyMessage="No tenants"
      />
    </div>
  );
}
