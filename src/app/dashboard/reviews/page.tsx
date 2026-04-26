'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function ReviewsPage() {
  const { data: campaigns, loading, error, refetch } = useApi<Record<string, unknown>[]>('/api/reviews/campaigns');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Review Campaigns</h1>
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
          <h1 className="text-2xl font-bold text-white">Review Campaigns</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const campaignList = campaigns ?? [];
  const totalSent = campaignList.reduce((sum, c) => sum + (Number(c.sentCount) || 0), 0);
  const totalResponses = campaignList.reduce((sum, c) => sum + (Number(c.responseCount) || 0), 0);
  const responseRate = totalSent > 0 ? ((totalResponses / totalSent) * 100).toFixed(1) : '0';

  const columns = [
    { header: 'Campaign', key: 'name' },
    { header: 'Status', key: 'status', render: (value: unknown) =>
      <StatusBadge status={String(value)} /> },
    { header: 'Sent', key: 'sentCount' },
    { header: 'Responses', key: 'responseCount' },
    { header: 'Response Rate', key: 'responseRate', render: (_: unknown, row: Record<string, unknown>) => {
      const sent = Number(row.sentCount) || 0;
      const resp = Number(row.responseCount) || 0;
      return sent > 0 ? `${((resp / sent) * 100).toFixed(1)}%` : '--';
    }},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Review Campaigns</h1>
        <p className="text-gray-400 text-sm mt-1">Create and manage campaigns to collect customer reviews and boost your online reputation.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Campaigns" value={campaignList.filter(c => c.status === 'active').length} icon="📣" />
        <StatCard label="Total Sent" value={totalSent} icon="📤" sublabel="Review requests sent" />
        <StatCard label="Total Responses" value={totalResponses} icon="⭐" trend="up" trendValue="+8" />
        <StatCard label="Response Rate" value={`${responseRate}%`} icon="📊" sublabel="Across all campaigns" />
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
          Create Campaign
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        {campaignList.length === 0 ? (
          <EmptyState title="No review campaigns" description="Create a campaign to start collecting customer reviews." />
        ) : (
          <DataTable columns={columns} data={campaignList as Record<string, unknown>[]} emptyMessage="No review campaigns found." />
        )}
      </div>
    </div>
  );
}
