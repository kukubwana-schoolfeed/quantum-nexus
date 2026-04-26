'use client';

import { useApi } from '@/lib/hooks/useApi';
import type { CustomerDTO, AnalyticsOverviewDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function CustomersPage() {
  const { data: customers, loading, error, refetch } = useApi<CustomerDTO[]>('/api/customers');
  const { data: analyticsData } = useApi<AnalyticsOverviewDTO>('/api/analytics/overview');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <SkeletonTable />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const totalCustomers = customers?.length ?? 0;
  const totalLoyaltyPoints = customers?.reduce((sum, c) => sum + c.loyaltyPoints, 0) ?? 0;
  const priorityCount = customers?.filter(c => c.tier === 'priority').length ?? 0;

  const columns = [
    { header: 'Name', key: 'firstName', render: (_: unknown, row: Record<string, unknown>) =>
      `${row.firstName} ${row.lastName}` },
    { header: 'Phone', key: 'phoneNumber' },
    { header: 'Tier', key: 'tier', render: (value: unknown) =>
      <StatusBadge status={String(value)} /> },
    { header: 'Loyalty Points', key: 'loyaltyPoints' },
    { header: 'Source', key: 'source', render: (value: unknown) =>
      String(value).replace(/_/g, ' ') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your customer database, track loyalty tiers, and monitor acquisition sources.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={totalCustomers} icon="👥" sublabel="All time" />
        <StatCard label="New Today" value={analyticsData?.newCustomersToday ?? 0} icon="🆕" trend="up" trendValue="+5" />
        <StatCard label="Priority Tier" value={priorityCount} icon="⭐" sublabel="Loyal customers" />
        <StatCard label="Total Loyalty Points" value={totalLoyaltyPoints.toLocaleString()} icon="💎" sublabel="Across all customers" />
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
          Add Customer
        </button>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
          Import CSV
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        {customers && customers.length > 0 ? (
          <DataTable columns={columns} data={customers as unknown as Record<string, unknown>[]} emptyMessage="No customers found." />
        ) : (
          <EmptyState title="No customers yet" description="Customers will appear here once they are added to your database." />
        )}
      </div>
    </div>
  );
}
