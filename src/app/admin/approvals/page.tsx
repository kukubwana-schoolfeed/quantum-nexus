'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import { SkeletonPanel } from '@/components/shared/Skeleton';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';

interface PendingAccount {
  id: string;
  businessName: string;
  tier: string;
  submittedAt: string;
}

export default function ApprovalQueuePage(): JSX.Element {
  const { data, loading, error, refetch } = useApi<PendingAccount[]>('/api/admin/approvals');
  const pending = data ?? [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Approval Queue</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Approval Queue</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Approval Queue</h1>
        <p className="text-sm text-gray-400 mt-1">Review and approve pending business accounts</p>
      </div>
      <div className="space-y-3">
        {pending.map((account) => (
          <div key={account.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <StatusBadge status="pending_approval" />
              <div>
                <p className="text-sm font-medium text-white">{account.businessName}</p>
                <p className="text-xs text-gray-500">Tier: {account.tier} | Submitted: {new Date(account.submittedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-500">Approve</button>
              <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500">Reject</button>
            </div>
          </div>
        ))}
        {pending.length === 0 && (
          <EmptyState
            title="No pending approvals"
            description="All business accounts have been reviewed. New pending approvals will appear here."
          />
        )}
      </div>
    </div>
  );
}
