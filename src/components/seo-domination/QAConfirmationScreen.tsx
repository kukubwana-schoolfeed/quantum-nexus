'use client';

import { useState, useCallback } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import { SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import type { QaTaskDTO } from '@/lib/api/schema';

export default function QAConfirmationScreen(): JSX.Element {
  const { data: tasks, loading, error, refetch } = useApi<QaTaskDTO[]>('/api/seo-domination/qa-tasks');
  const [confirming, setConfirming] = useState<Record<string, boolean>>({});
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const handleConfirm = useCallback(async (taskId: string) => {
    setConfirming(prev => ({ ...prev, [taskId]: true }));
    setConfirmError(null);
    try {
      const res = await fetch('/api/seo-domination/qa-tasks/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
      if (!res.ok) throw new Error(`Confirm failed: ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Confirm failed');
      setConfirmed(prev => ({ ...prev, [taskId]: true }));
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Failed to confirm task');
    } finally {
      setConfirming(prev => ({ ...prev, [taskId]: false }));
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonPanel />
        <SkeletonPanel />
      </div>
    );
  }

  if (error) {
    return <ApiError message={error} onRetry={refetch} />;
  }

  if (!tasks || tasks.length === 0) {
    return <EmptyState title="No Q&A tasks" description="No Q&A seeding tasks found. Check back later." />;
  }

  const awaiting = tasks.filter(t => t.status === 'awaiting_confirmation' && !confirmed[t.id]);
  const pending = tasks.filter(t => t.status === 'pending');
  const answered = tasks.filter(t => t.status === 'answered' || confirmed[t.id]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Awaiting Confirmation" value={awaiting.length} icon="WAIT" sublabel="Confirm posted questions" />
        <StatCard label="Pending Answers" value={pending.length} icon="PEND" sublabel="Questions to answer" />
        <StatCard label="Answered" value={answered.length} icon="DONE" sublabel="Completed tasks" />
      </div>

      {confirmError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {confirmError}
        </div>
      )}

      {awaiting.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Awaiting Your Confirmation</h2>
          <p className="text-gray-400 text-sm">These Q&amp;A tasks have answers drafted. Confirm that the question has been manually posted on the target platform.</p>
          <div className="space-y-3">
            {awaiting.map(task => (
              <div key={task.id} className="bg-gray-800 rounded-lg border border-gray-700 p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full capitalize">{task.platform}</span>
                      <StatusBadge status="in_progress" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Question</label>
                      <p className="text-sm text-white">{task.questionText}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Drafted Answer</label>
                      <p className="text-sm text-gray-300 leading-relaxed">{task.answerText}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                  <span className="text-xs text-gray-500">
                    {task.questionPostedAt
                      ? `Posted on ${new Date(task.questionPostedAt).toLocaleDateString()}`
                      : 'Not yet posted'}
                  </span>
                  <button
                    onClick={() => handleConfirm(task.id)}
                    disabled={confirming[task.id]}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {confirming[task.id] ? 'Confirming...' : 'Confirm Posted'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Pending Answers</h2>
          <div className="space-y-2">
            {pending.map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full capitalize">{task.platform}</span>
                  </div>
                  <p className="text-sm text-gray-300 truncate">{task.questionText}</p>
                </div>
                <StatusBadge status="pending" />
              </div>
            ))}
          </div>
        </div>
      )}

      {answered.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Completed</h2>
          <div className="space-y-2">
            {answered.map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-400 truncate">{task.questionText}</p>
                </div>
                <StatusBadge status="complete" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
