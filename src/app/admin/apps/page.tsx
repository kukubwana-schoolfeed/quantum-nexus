'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';

interface AppSubmission {
  id: string;
  [key: string]: unknown;
}

export default function AppPublishingPipelinePage(): JSX.Element {
  const { data, loading, error, refetch } = useApi<AppSubmission[]>('/api/admin/apps');
  const submissions = data ?? [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">App Publishing Pipeline</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={3} />
        <SkeletonPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">App Publishing Pipeline</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">App Publishing Pipeline</h1>
        <p className="text-sm text-gray-400 mt-1">Review and manage white-label app submissions</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Submissions" value={submissions.length} />
        <StatCard label="Pending Review" value={0} />
        <StatCard label="Published" value={0} />
      </div>
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
        <p className="text-gray-500 text-sm">No app submissions in queue</p>
        <p className="text-xs text-gray-600 mt-1">White-label app submissions appear here when businesses submit apps for review</p>
      </div>
    </div>
  );
}
