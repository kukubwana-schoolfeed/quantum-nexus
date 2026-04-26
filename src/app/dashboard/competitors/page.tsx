'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import ProgressBar from '@/components/shared/ProgressBar';

export default function CompetitorsPage() {
  const { data: competitors, loading, error, refetch } = useApi<Record<string, unknown>[]>('/api/competitors');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Competitor Intelligence</h1>
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
          <h1 className="text-2xl font-bold text-white">Competitor Intelligence</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const competitorList = competitors ?? [];
  const avgDA = competitorList.length > 0
    ? Math.round(competitorList.reduce((sum, c) => sum + (Number(c.domainAuthority) || 0), 0) / competitorList.length)
    : 0;
  const totalIndexedPages = competitorList.reduce((sum, c) => sum + (Number(c.indexedPages) || 0), 0);
  const totalBacklinks = competitorList.reduce((sum, c) => sum + (Number(c.backlinks) || 0), 0);

  const columns = [
    { header: 'Domain', key: 'domain' },
    { header: 'Domain Authority', key: 'domainAuthority', render: (value: unknown) => (
      <div className="w-32">
        <ProgressBar value={Number(value)} max={100} showPercent />
      </div>
    )},
    { header: 'Indexed Pages', key: 'indexedPages' },
    { header: 'Backlinks', key: 'backlinks', render: (value: unknown) =>
      Number(value).toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Competitor Intelligence</h1>
        <p className="text-gray-400 text-sm mt-1">Monitor competitor domains, authority, and SEO metrics to stay ahead.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tracked Competitors" value={competitorList.length} icon="🔍" />
        <StatCard label="Avg Domain Authority" value={avgDA} icon="📊" sublabel="Across competitors" />
        <StatCard label="Total Indexed Pages" value={totalIndexedPages.toLocaleString()} icon="📄" />
        <StatCard label="Total Backlinks" value={totalBacklinks.toLocaleString()} icon="🔗" />
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
          Add Competitor
        </button>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
          Refresh Data
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        {competitorList.length === 0 ? (
          <EmptyState title="No competitors tracked" description="Add a competitor to start monitoring their SEO metrics." />
        ) : (
          <DataTable columns={columns} data={competitorList as Record<string, unknown>[]} emptyMessage="No competitors tracked yet." />
        )}
      </div>
    </div>
  );
}
