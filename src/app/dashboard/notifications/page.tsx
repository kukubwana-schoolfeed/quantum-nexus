'use client';

import { useState, useCallback } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import { SkeletonPanel } from '@/components/shared/Skeleton';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import type { NotificationDTO } from '@/lib/api/schema';

const PRIORITY_STYLES: Record<string, string> = {
  urgent: 'border-l-red-500 bg-red-500/5',
  high: 'border-l-orange-500 bg-orange-500/5',
  normal: 'border-l-blue-500 bg-blue-500/5',
  low: 'border-l-gray-600 bg-gray-800',
};

const PRIORITY_DOT: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  normal: 'bg-blue-500',
  low: 'bg-gray-600',
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsPage(): JSX.Element {
  const { data: notifications, loading, error, refetch } = useApi<NotificationDTO[]>('/api/notifications');
  const [markingRead, setMarkingRead] = useState<Record<string, boolean>>({});
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const markRead = useCallback(async (id: string) => {
    setMarkingRead(prev => ({ ...prev, [id]: true }));
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      refetch();
    } finally {
      setMarkingRead(prev => ({ ...prev, [id]: false }));
    }
  }, [refetch]);

  const markAllRead = useCallback(async () => {
    setMarkingAll(true);
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      refetch();
    } finally {
      setMarkingAll(false);
    }
  }, [refetch]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <SkeletonPanel />
        <SkeletonPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  const items = notifications ?? [];
  const unreadCount = items.filter(n => !n.read).length;
  const filtered = filter === 'unread' ? items.filter(n => !n.read) : items;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-gray-400 text-sm mt-1">Stay on top of alerts, trends, and account activity.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {markingAll ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700 w-fit">
        {(['all', 'unread'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              filter === f ? 'bg-nexus-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {f === 'all' ? `All (${items.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-white mt-1">{items.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Unread</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{unreadCount}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Urgent</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">{items.filter(n => n.priority === 'urgent').length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Read</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">{items.filter(n => n.read).length}</p>
        </div>
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <EmptyState
          title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          description="You're all caught up."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(n => (
            <div
              key={n.id}
              className={`rounded-lg border border-gray-700 border-l-2 p-4 ${PRIORITY_STYLES[n.priority] ?? PRIORITY_STYLES.low} ${
                n.read ? 'opacity-60' : ''
              } transition-opacity`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${n.read ? 'bg-gray-600' : PRIORITY_DOT[n.priority] ?? 'bg-blue-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm ${n.read ? 'text-gray-400' : 'text-white font-medium'}`}>{n.title}</p>
                    <StatusBadge status={n.priority === 'urgent' ? 'held' : n.priority === 'high' ? 'pending_approval' : n.type} />
                  </div>
                  <p className="text-sm text-gray-400">{n.body}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-600">{formatTimeAgo(n.createdAt)}</span>
                    {!n.read && (
                      <button
                        onClick={() => markRead(n.id)}
                        disabled={markingRead[n.id]}
                        className="text-xs text-nexus-400 hover:text-nexus-300 transition-colors disabled:opacity-50"
                      >
                        {markingRead[n.id] ? 'Marking...' : 'Mark read'}
                      </button>
                    )}
                    {n.actionUrl && (
                      <a href={n.actionUrl} className="text-xs text-nexus-400 hover:text-nexus-300 transition-colors">
                        View details
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
