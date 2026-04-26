'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function IntegrationsPage() {
  const { data: keys, loading, error, refetch } = useApi<{ keyName: string; isConnected: boolean; expiresAt: string | null }[]>('/api/integrations');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Integrations</h1>
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
          <h1 className="text-2xl font-bold text-white">Integrations</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const connectedCount = (keys ?? []).filter(k => k.isConnected).length;
  const expiringSoon = (keys ?? []).filter(k => {
    if (!k.expiresAt) return false;
    const expiry = new Date(k.expiresAt);
    const now = new Date();
    const daysToExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysToExpiry <= 30 && daysToExpiry > 0;
  }).length;

  const columns = [
    { header: 'Key Name', key: 'keyName', render: (value: unknown) =>
      String(value).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) },
    { header: 'Connected', key: 'isConnected', render: (value: unknown) =>
      <StatusBadge status={value ? 'active' : 'held'} /> },
    { header: 'Expires', key: 'expiresAt', render: (value: unknown) =>
      value ? new Date(String(value)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No expiry' },
    { header: 'Actions', key: 'actions', render: (_: unknown, row: Record<string, unknown>) => (
      <div className="flex gap-2">
        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
          Test
        </button>
        <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
          Delete
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Integrations</h1>
        <p className="text-gray-400 text-sm mt-1">Manage API keys, connected accounts, and third-party service integrations.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Keys" value={(keys ?? []).length} icon="🔑" />
        <StatCard label="Connected" value={connectedCount} icon="✅" sublabel="Active connections" />
        <StatCard label="Disconnected" value={(keys ?? []).length - connectedCount} icon="❌" />
        <StatCard label="Expiring Soon" value={expiringSoon} icon="⚠️" sublabel="Within 30 days" />
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
          Add Integration
        </button>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
          Refresh Tokens
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        {!keys || keys.length === 0 ? (
          <EmptyState title="No integrations configured" description="Add an integration to connect third-party services." />
        ) : (
          <DataTable columns={columns} data={keys as unknown as Record<string, unknown>[]} emptyMessage="No integrations configured." />
        )}
      </div>
    </div>
  );
}
