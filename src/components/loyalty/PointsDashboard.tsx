'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

const balance = MOCK_DATA.loyaltyPointsEngine.getBalance('', 'c1');
const transactions = MOCK_DATA.loyaltyPointsEngine.getTransactions('', 'c1', {});

export default function PointsDashboard(): JSX.Element {
  const columns = [
    { header: 'Type', key: 'type', render: (v: unknown) => <StatusBadge status={String(v) === 'earn' ? 'active' : 'held'} /> },
    { header: 'Points', key: 'points', render: (v: unknown, row: Record<string, unknown>) => `${row.type === 'earn' ? '+' : '-'}${v}` },
    { header: 'Description', key: 'description' },
    { header: 'Balance After', key: 'balanceAfter' },
    {
      header: 'Date',
      key: 'createdAt',
      render: (v: unknown) => new Date(String(v)).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Current Points" value={balance.points} icon="⭐" />
        <StatCard label="Tier" value={balance.tier} icon="🏅" />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-2">Transaction History</h3>
        <DataTable columns={columns} data={transactions as unknown as Record<string, unknown>[]} emptyMessage="No transactions yet" />
      </div>
    </div>
  );
}
