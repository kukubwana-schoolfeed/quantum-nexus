'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function LeadMagnetsPage() {
  const { data: magnets, loading, error, refetch } = useApi<Record<string, unknown>[]>('/api/lead-magnets');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Magnets</h1>
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
          <h1 className="text-2xl font-bold text-white">Lead Magnets</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const magnetList = magnets ?? [];
  const totalDownloads = magnetList.reduce((sum, m) => sum + (Number(m.downloads) || 0), 0);
  const activeMagnets = magnetList.filter(m => m.status === 'active').length;

  const columns = [
    { header: 'Title', key: 'title' },
    { header: 'Type', key: 'type', render: (value: unknown) => String(value).toUpperCase() },
    { header: 'Status', key: 'status', render: (value: unknown) =>
      <StatusBadge status={String(value)} /> },
    { header: 'Downloads', key: 'downloads' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Lead Magnets</h1>
        <p className="text-gray-400 text-sm mt-1">Create and manage lead magnets to capture and nurture potential customers.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Magnets" value={magnetList.length} icon="🧲" sublabel="All lead magnets" />
        <StatCard label="Active" value={activeMagnets} icon="✅" sublabel="Currently live" />
        <StatCard label="Total Downloads" value={totalDownloads} icon="📥" trend="up" trendValue="+12%" />
        <StatCard label="Conversion Rate" value="18.5%" icon="📈" sublabel="Visitors to leads" />
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
          Create Magnet
        </button>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
          Generate PDF
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        {magnetList.length === 0 ? (
          <EmptyState title="No lead magnets" description="Create a lead magnet to start capturing potential customers." />
        ) : (
          <DataTable columns={columns} data={magnetList as Record<string, unknown>[]} emptyMessage="No lead magnets found." />
        )}
      </div>
    </div>
  );
}
