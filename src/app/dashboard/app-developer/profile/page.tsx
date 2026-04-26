'use client';

/**
 * App Profile — App profile setup and management
 * Module: app-profile-engine
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import type { AppDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

const columns = [
  { header: 'Name', key: 'name' },
  { header: 'Platform', key: 'platform' },
  { header: 'Category', key: 'category' },
  {
    header: 'Status',
    key: 'status',
    render: (value: unknown) => (
      <StatusBadge status={String(value)} />
    ),
  },
  {
    header: 'Downloads',
    key: 'downloads',
    render: (value: unknown) => (value as number)?.toLocaleString() ?? '0',
  },
];

export default function Page(): JSX.Element {
  const { data, loading, error, refetch } = useApi<AppDTO[]>('/api/app-developer/profile');
  const apps = data ?? [];
  const publishedApps = apps.filter((a) => a.status === 'published').length;
  const totalDownloads = apps.reduce((acc, a) => acc + a.downloads, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">App Profile</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={3} />
        <SkeletonTable />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">App Profile</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">App Profile</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage your app profiles, platforms, and publication status.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Apps"
          value={apps.length}
          icon="📱"
        />
        <StatCard
          label="Published"
          value={publishedApps}
          icon="✅"
        />
        <StatCard
          label="Total Downloads"
          value={totalDownloads.toLocaleString()}
          icon="📥"
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Apps</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Create App
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <DataTable
          columns={columns}
          data={apps as unknown as Record<string, unknown>[]}
          emptyMessage="No apps yet. Create your first app profile to get started."
        />
      </div>
    </div>
  );
}
