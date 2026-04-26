'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function BroadcastsPage() {
  const { data: broadcasts, loading, error, refetch } = useApi<Record<string, unknown>[]>('/api/broadcasts');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Broadcasts</h1>
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
          <h1 className="text-2xl font-bold text-white">Broadcasts</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const broadcastList = broadcasts ?? [];
  const totalRecipients = broadcastList.reduce((sum, b) => sum + (Number(b.recipientCount) || 0), 0);
  const sentBroadcasts = broadcastList.filter(b => b.status === 'sent').length;

  const columns = [
    { header: 'Type', key: 'type', render: (value: unknown) => String(value).toUpperCase() },
    { header: 'Body', key: 'body' },
    { header: 'Status', key: 'status', render: (value: unknown) =>
      <StatusBadge status={String(value)} /> },
    { header: 'Recipients', key: 'recipientCount' },
    { header: 'Sent Date', key: 'sentAt', render: (value: unknown) =>
      value ? new Date(String(value)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '--' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Broadcasts</h1>
        <p className="text-gray-400 text-sm mt-1">Send WhatsApp, SMS, and email broadcasts to your customer base.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Broadcasts" value={broadcastList.length} icon="📢" />
        <StatCard label="Sent" value={sentBroadcasts} icon="✅" sublabel="Successfully delivered" />
        <StatCard label="Total Recipients" value={totalRecipients.toLocaleString()} icon="👥" />
        <StatCard label="Avg Open Rate" value="72%" icon="👀" trend="up" trendValue="+3%" />
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
          Create Broadcast
        </button>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
          Schedule Broadcast
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        {broadcastList.length === 0 ? (
          <EmptyState title="No broadcasts found" description="Create a broadcast to send messages to your customer base." />
        ) : (
          <DataTable columns={columns} data={broadcastList as Record<string, unknown>[]} emptyMessage="No broadcasts found." />
        )}
      </div>
    </div>
  );
}
