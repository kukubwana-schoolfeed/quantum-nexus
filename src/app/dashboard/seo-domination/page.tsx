'use client';

/**
 * SEO Domination — Long-term SEO domination strategy
 * Module: seoDominationEngine
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import type { DailyBlogScheduleDTO, QaTaskDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import EmptyState from '@/components/shared/EmptyState';

interface SeoDominationData {
  blogSchedule: DailyBlogScheduleDTO;
  qaTasks: {
    pending: QaTaskDTO[];
    awaitingConfirmation: QaTaskDTO[];
  };
}

export default function Page(): JSX.Element {
  const { data, loading, error, refetch } = useApi<SeoDominationData>('/api/seo-domination');
  const blogSchedule = data?.blogSchedule ?? { posts: [] };
  const qaTasks = data?.qaTasks ?? { pending: [], awaitingConfirmation: [] };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">SEO Domination</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <SkeletonTable />
        <SkeletonGrid count={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">SEO Domination</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">SEO Domination</h1>
        <p className="text-sm text-gray-400 mt-1">
          Long-term SEO domination strategy with daily blog scheduling and Q&amp;A tasks
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Blog Posts Today"
          value={blogSchedule.posts.length}
          icon="BP"
          sublabel="scheduled posts"
        />
        <StatCard
          label="Q&A Pending"
          value={qaTasks.pending.length}
          icon="QA"
          sublabel="awaiting answers"
        />
        <StatCard
          label="Q&A Awaiting Confirmation"
          value={qaTasks.awaitingConfirmation.length}
          icon="AC"
          sublabel="confirm posted"
        />
        <StatCard
          label="Directories Submitted"
          value={0}
          icon="DR"
          sublabel="total submissions"
        />
      </div>

      {/* Daily Blog Schedule */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Daily Blog Schedule</h2>
        <DataTable
          columns={[
            { header: 'Time', key: 'time' },
            { header: 'Target Keyword', key: 'keyword' },
          ]}
          data={blogSchedule.posts.map((p, i) => ({
            id: p.postId ?? `blog_${i}`,
            time: p.time,
            keyword: p.keyword,
          })) as unknown as Record<string, unknown>[]}
          emptyMessage="No blog posts scheduled for today."
        />
      </div>

      {/* Q&A Tasks */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Q&amp;A Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
              Pending Answers
            </h3>
            {qaTasks.pending.length === 0 ? (
              <EmptyState
                title="No pending Q&A"
                description="All questions have been answered."
              />
            ) : (
              <DataTable
                columns={[
                  { header: 'Question', key: 'question' },
                  { header: 'Status', key: 'status' },
                ]}
                data={qaTasks.pending as unknown as Record<string, unknown>[]}
                emptyMessage="No pending questions."
              />
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
              Awaiting Confirmation
            </h3>
            {qaTasks.awaitingConfirmation.length === 0 ? (
              <EmptyState
                title="No confirmations needed"
                description="All Q&A posts have been confirmed."
              />
            ) : (
              <DataTable
                columns={[
                  { header: 'Question', key: 'question' },
                  { header: 'Status', key: 'status' },
                ]}
                data={qaTasks.awaitingConfirmation as unknown as Record<string, unknown>[]}
                emptyMessage="No confirmations pending."
              />
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Submit to Directory
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
        >
          Refresh Schedule
        </button>
      </div>
    </div>
  );
}
