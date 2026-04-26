'use client';

import { useApi } from '@/lib/hooks/useApi';
import type { CallLogDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';

export default function CallsPage() {
  const { data: callLog, loading, error, refetch } = useApi<CallLogDTO[]>('/api/calls');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Inbound Calls</h1>
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
          <h1 className="text-2xl font-bold text-white">Inbound Calls</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const totalCalls = callLog?.length ?? 0;
  const resolvedCalls = callLog?.filter(c => c.classification === 'resolved').length ?? 0;
  const avgDuration = totalCalls > 0
    ? Math.round((callLog?.reduce((sum, c) => sum + c.duration, 0) ?? 0) / totalCalls)
    : 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const columns = [
    { header: 'Caller', key: 'callerPhone' },
    { header: 'Duration', key: 'duration', render: (value: unknown) =>
      formatDuration(Number(value)) },
    { header: 'Classification', key: 'classification', render: (value: unknown) =>
      <StatusBadge status={String(value)} /> },
    { header: 'Timestamp', key: 'timestamp', render: (value: unknown) =>
      new Date(String(value)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
    { header: 'Transcript', key: 'transcript', render: (value: unknown) =>
      String(value).length > 40 ? `${String(value).substring(0, 40)}...` : String(value) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Inbound Calls</h1>
        <p className="text-gray-400 text-sm mt-1">Monitor inbound calls, view transcripts, and manage AI-powered call handling.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Calls" value={totalCalls} icon="📞" sublabel="All time" />
        <StatCard label="Resolved" value={resolvedCalls} icon="✅" sublabel="AI-handled" />
        <StatCard label="Avg Duration" value={formatDuration(avgDuration)} icon="⏱️" sublabel="Per call" />
        <StatCard label="Handoff Rate" value="0%" icon="🤝" sublabel="To human agent" />
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
          View Settings
        </button>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
          Test Handoff
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        {callLog && callLog.length > 0 ? (
          <DataTable columns={columns} data={callLog as unknown as Record<string, unknown>[]} emptyMessage="No call logs found." />
        ) : (
          <EmptyState title="No call logs yet" description="Call logs will appear here once inbound calls are received." />
        )}
      </div>
    </div>
  );
}
