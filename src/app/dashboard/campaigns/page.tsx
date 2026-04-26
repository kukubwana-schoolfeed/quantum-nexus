'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function CampaignsPage() {
  const { data: campaigns, loading, error, refetch } = useApi<Record<string, unknown>[]>('/api/campaigns');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Seasonal Campaigns</h1>
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
          <h1 className="text-2xl font-bold text-white">Seasonal Campaigns</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const campaignList = campaigns ?? [];
  const activeCampaigns = campaignList.filter(c => c.status === 'active').length;
  const scheduledCampaigns = campaignList.filter(c => c.status === 'scheduled').length;

  const columns = [
    { header: 'Campaign', key: 'name' },
    { header: 'Status', key: 'status', render: (value: unknown) =>
      <StatusBadge status={String(value)} /> },
    { header: 'Starts', key: 'startsAt', render: (value: unknown) =>
      new Date(String(value)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
    { header: 'Ends', key: 'endsAt', render: (value: unknown) =>
      new Date(String(value)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
    { header: 'Duration', key: 'duration', render: (_: unknown, row: Record<string, unknown>) => {
      const start = new Date(String(row.startsAt));
      const end = new Date(String(row.endsAt));
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return `${days} days`;
    }},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Seasonal Campaigns</h1>
        <p className="text-gray-400 text-sm mt-1">Plan and schedule seasonal marketing campaigns aligned with holidays and events.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Campaigns" value={campaignList.length} icon="🎉" />
        <StatCard label="Active" value={activeCampaigns} icon="▶️" />
        <StatCard label="Scheduled" value={scheduledCampaigns} icon="🗓️" />
        <StatCard label="Completed" value={campaignList.filter(c => c.status === 'complete').length} icon="✅" />
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
          Create Campaign
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        {campaignList.length === 0 ? (
          <EmptyState title="No seasonal campaigns" description="Create a seasonal campaign to align marketing with holidays and events." />
        ) : (
          <DataTable columns={columns} data={campaignList as Record<string, unknown>[]} emptyMessage="No seasonal campaigns found." />
        )}
      </div>
    </div>
  );
}
