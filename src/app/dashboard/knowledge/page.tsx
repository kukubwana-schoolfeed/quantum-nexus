'use client';

import { useApi } from '@/lib/hooks/useApi';
import type { KnowledgeBaseEntryDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function KnowledgePage() {
  const { data: entries, loading, error, refetch } = useApi<KnowledgeBaseEntryDTO[]>('/api/knowledge');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
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
          <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const entryList = entries ?? [];
  const activeEntries = entryList.filter(e => e.isActive).length;
  const categories = [...new Set(entryList.map(e => e.category))];

  const columns = [
    { header: 'Title', key: 'title' },
    { header: 'Content', key: 'content', render: (value: unknown) =>
      String(value).length > 50 ? `${String(value).substring(0, 50)}...` : String(value) },
    { header: 'Category', key: 'category', render: (value: unknown) =>
      String(value).charAt(0).toUpperCase() + String(value).slice(1) },
    { header: 'Source', key: 'source', render: (value: unknown) =>
      String(value).charAt(0).toUpperCase() + String(value).slice(1) },
    { header: 'Active', key: 'isActive', render: (value: unknown) =>
      <StatusBadge status={value ? 'active' : 'inactive'} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
        <p className="text-gray-400 text-sm mt-1">Build and manage the knowledge base that powers AI-generated content and responses.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Entries" value={entryList.length} icon="📚" />
        <StatCard label="Active" value={activeEntries} icon="✅" sublabel="Currently in use" />
        <StatCard label="Categories" value={categories.length} icon="🏷️" />
        <StatCard label="Sources" value={[...new Set(entryList.map(e => e.source))].length} icon="📋" />
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
          Add Entry
        </button>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
          Import from URL
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        {entryList.length === 0 ? (
          <EmptyState title="No knowledge base entries" description="Add entries to build the knowledge base that powers AI-generated content." />
        ) : (
          <DataTable columns={columns} data={entryList as unknown as Record<string, unknown>[]} emptyMessage="No knowledge base entries found." />
        )}
      </div>
    </div>
  );
}
