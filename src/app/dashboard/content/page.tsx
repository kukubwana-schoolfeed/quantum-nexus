'use client';

import { useApi } from '@/lib/hooks/useApi';
import type { ContentPostDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';

/**
 * ContentMachine — Content generation and management page.
 * Module: content-machine | Phase: 2 (API integration)
 */

export default function ContentMachinePage(): JSX.Element {
  const { data: posts, loading, error, refetch } = useApi<ContentPostDTO[]>('/api/content/posts');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Content Machine</h1>
            <p className="text-sm text-gray-400 mt-1">Loading...</p>
          </div>
        </div>
        <SkeletonGrid count={3} />
        <SkeletonTable />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Content Machine</h1>
          </div>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Machine</h1>
          <p className="text-sm text-gray-400 mt-1">Generate, manage, and schedule content</p>
        </div>
        <button className="px-4 py-2 bg-nexus-700 text-white text-sm rounded-lg hover:bg-nexus-600 transition-colors">
          + Generate Content
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Posts" value={posts?.length ?? 0} />
        <StatCard label="Published" value={posts?.filter(p => p.status === 'published').length ?? 0} />
        <StatCard label="Scheduled" value={posts?.filter(p => p.status === 'scheduled').length ?? 0} />
      </div>

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h2 className="text-sm font-semibold text-white mb-3">Content Queue</h2>
        {posts && posts.length > 0 ? (
          <DataTable
            columns={[
              { header: 'Type', key: 'contentType', render: (v: unknown) => <span className="capitalize">{String(v).replace(/_/g, ' ')}</span> },
              { header: 'Platform', key: 'platform', render: (v: unknown) => <span>{String(v ?? '—')}</span> },
              { header: 'Caption', key: 'caption', render: (v: unknown) => <span className="truncate max-w-[200px] block">{String(v ?? '—')}</span> },
              { header: 'Status', key: 'status', render: (v: unknown) => <StatusBadge status={String(v)} /> },
              { header: 'Scheduled', key: 'scheduledFor', render: (v: unknown) => <span className="text-xs text-gray-400">{v ? new Date(String(v)).toLocaleString() : '—'}</span> },
            ]}
            data={posts as unknown as Record<string, unknown>[]}
            emptyMessage="No content created yet"
          />
        ) : (
          <EmptyState title="No content yet" description="Generate your first piece of content to get started." />
        )}
      </div>
    </div>
  );
}
