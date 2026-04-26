'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ProgressBar from '@/components/shared/ProgressBar';

const customer = MOCK_DATA.customerDatabase.getCustomer('', 'c1');

export default function CustomerProfile(): JSX.Element {
  if (!customer) {
    return <div className="text-gray-500 text-sm">Customer not found</div>;
  }

  const tierProgress = customer.tier === 'vip' ? 100 : customer.tier === 'priority' ? 66 : customer.tier === 'standard' ? 33 : 0;

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-white">{customer.firstName} {customer.lastName}</h3>
            <p className="text-xs text-gray-400">{customer.phoneNumber} · {customer.email ?? 'No email'}</p>
          </div>
          <StatusBadge status={customer.status} />
        </div>
        <div className="mb-3">
          <span className="text-xs text-gray-400">Tier</span>
          <ProgressBar value={tierProgress} label={customer.tier} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Loyalty Points" value={customer.loyaltyPoints} icon="⭐" />
        <StatCard label="Total Spend" value={`K${customer.totalSpend.toLocaleString()}`} icon="💰" />
        <StatCard label="Visits" value={customer.visitCount} icon="🏪" />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-white mb-2">Details</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-400">Source:</span> <span className="text-gray-300">{customer.source}</span></div>
          <div><span className="text-gray-400">Birthday:</span> <span className="text-gray-300">{customer.hasBirthday ? (customer.daysUntilBirthday !== null ? `${customer.daysUntilBirthday} days away` : 'This month') : 'Not set'}</span></div>
        </div>
      </div>
    </div>
  );
}
