'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function SalesPage() {
  const { data: campaigns, loading, error, refetch } = useApi<Record<string, unknown>[]>('/api/sales');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Outbound Sales</h1>
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
          <h1 className="text-2xl font-bold text-white">Outbound Sales</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const campaignList = campaigns ?? [];
  const totalTargets = campaignList.reduce((sum, c) => sum + (Number(c.targetsCount) || 0), 0);
  const totalResponses = campaignList.reduce((sum, c) => sum + (Number(c.responsesCount) || 0), 0);
  const activeCampaigns = campaignList.filter(c => c.status === 'active').length;

  const columns = [
    { header: 'Campaign', key: 'name' },
    { header: 'Status', key: 'status', render: (value: unknown) =>
      <StatusBadge status={String(value)} /> },
    { header: 'Targets', key: 'targetsCount' },
    { header: 'Responses', key: 'responsesCount' },
    { header: 'Conversion', key: 'conversion', render: (_: unknown, row: Record<string, unknown>) => {
      const targets = Number(row.targetsCount) || 0;
      const responses = Number(row.responsesCount) || 0;
      return targets > 0 ? `${((responses / targets) * 100).toFixed(1)}%` : '--';
    }},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Outbound Sales</h1>
        <p className="text-gray-400 text-sm mt-1">Manage cold outreach campaigns and track prospect responses.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Campaigns" value={activeCampaigns} icon="📣" />
        <StatCard label="Total Targets" value={totalTargets} icon="🎯" sublabel="Prospects contacted" />
        <StatCard label="Total Responses" value={totalResponses} icon="💬" trend="up" trendValue="+12" />
        <StatCard label="Avg Conversion" value={totalTargets > 0 ? `${((totalResponses / totalTargets) * 100).toFixed(1)}%` : '0%'} icon="📊" sublabel="Response rate" />
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
          Create Campaign
        </button>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
          Pause All
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        {campaignList.length === 0 ? (
          <EmptyState title="No sales campaigns" description="Create a campaign to start reaching out to prospects." />
        ) : (
          <DataTable columns={columns} data={campaignList as Record<string, unknown>[]} emptyMessage="No sales campaigns found." />
        )}
      </div>
    </div>
  );
}
