'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

const customers = MOCK_DATA.customerDatabase.getCustomers('', {});
const activeCount = customers.filter(c => c.status === 'active').length;
const totalSpend = customers.reduce((sum, c) => sum + c.totalSpend, 0);
const totalVisits = customers.reduce((sum, c) => sum + c.visitCount, 0);

export default function CustomerList(): JSX.Element {
  const columns = [
    { header: 'Name', key: 'firstName', render: (_: unknown, row: Record<string, unknown>) => `${row.firstName} ${row.lastName ?? ''}` },
    { header: 'Phone', key: 'phoneNumber' },
    { header: 'Tier', key: 'tier', render: (v: unknown) => <StatusBadge status={String(v)} /> },
    { header: 'Points', key: 'loyaltyPoints' },
    { header: 'Visits', key: 'visitCount' },
    { header: 'Total Spend', key: 'totalSpend', render: (v: unknown) => `K${Number(v).toLocaleString()}` },
    { header: 'Status', key: 'status', render: (v: unknown) => <StatusBadge status={String(v)} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Customers" value={customers.length} icon="👥" />
        <StatCard label="Active" value={activeCount} icon="✅" />
        <StatCard label="Total Spend" value={`K${totalSpend.toLocaleString()}`} icon="💰" />
        <StatCard label="Total Visits" value={totalVisits} icon="🏪" />
      </div>
      <DataTable columns={columns} data={customers as unknown as Record<string, unknown>[]} emptyMessage="No customers found" />
    </div>
  );
}
