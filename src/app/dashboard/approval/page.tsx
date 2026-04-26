'use client';

import { useState } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function ApprovalPage() {
  const { data: initialItems, loading, error, refetch } = useApi<Record<string, unknown>[]>('/api/approval');
  const [items, setItems] = useState<Record<string, unknown>[] | null>(null);

  const currentItems = items ?? initialItems ?? [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Approval Queue</h1>
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
          <h1 className="text-2xl font-bold text-white">Content Approval Queue</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const pendingCount = currentItems.filter(i => i.status === 'pending_approval').length;
  const approvedCount = currentItems.filter(i => i.status === 'approved').length;
  const rejectedCount = currentItems.filter(i => i.status === 'rejected').length;

  const handleApprove = (id: string) => {
    const source = items ?? initialItems ?? [];
    setItems(source.map(item =>
      item.id === id ? { ...item, status: 'approved' } : item
    ));
  };

  const handleReject = (id: string) => {
    const source = items ?? initialItems ?? [];
    setItems(source.map(item =>
      item.id === id ? { ...item, status: 'rejected' } : item
    ));
  };

  const columns = [
    { header: 'Content Type', key: 'contentType', render: (value: unknown) =>
      String(value).replace(/_/g, ' ') },
    { header: 'Platform', key: 'platform', render: (value: unknown) =>
      value ? String(value).charAt(0).toUpperCase() + String(value).slice(1) : '--' },
    { header: 'Status', key: 'status', render: (value: unknown) =>
      <StatusBadge status={String(value)} /> },
    { header: 'Created', key: 'createdAt', render: (value: unknown) =>
      new Date(String(value)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
    { header: 'Actions', key: 'actions', render: (_: unknown, row: Record<string, unknown>) =>
      row.status === 'pending_approval' ? (
        <div className="flex gap-2">
          <button
            onClick={() => handleApprove(String(row.id))}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => handleReject(String(row.id))}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
          >
            Reject
          </button>
        </div>
      ) : (
        <span className="text-gray-500 text-xs">--</span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Content Approval Queue</h1>
        <p className="text-gray-400 text-sm mt-1">Review and approve content before it gets published to your platforms.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Approval" value={pendingCount} icon="⏳" />
        <StatCard label="Approved" value={approvedCount} icon="✅" />
        <StatCard label="Rejected" value={rejectedCount} icon="❌" />
        <StatCard label="Total Items" value={currentItems.length} icon="📋" />
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        {currentItems.length === 0 ? (
          <EmptyState title="No items in queue" description="Content awaiting approval will appear here." />
        ) : (
          <DataTable columns={columns} data={currentItems as Record<string, unknown>[]} emptyMessage="No items in the approval queue." />
        )}
      </div>
    </div>
  );
}
