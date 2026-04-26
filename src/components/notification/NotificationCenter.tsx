'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import type { NotificationDTO, UnreadCountDTO } from '@/lib/api/schema';

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

export default function NotificationCenter(): JSX.Element {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: unreadData, refetch: refetchUnread } = useApi<UnreadCountDTO>('/api/notifications/unread');
  const { data: notifications, loading, refetch: refetchList } = useApi<NotificationDTO[]>('/api/notifications');

  const [markingRead, setMarkingRead] = useState<Record<string, boolean>>({});
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = unreadData?.count ?? 0;

  // Poll for unread count every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      refetchUnread();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchUnread]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleOpen = useCallback(() => {
    setOpen(prev => {
      if (!prev) refetchList();
      return !prev;
    });
  }, [refetchList]);

  const markRead = useCallback(async (id: string) => {
    setMarkingRead(prev => ({ ...prev, [id]: true }));
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      refetchUnread();
      refetchList();
    } finally {
      setMarkingRead(prev => ({ ...prev, [id]: false }));
    }
  }, [refetchUnread, refetchList]);

  const markAllRead = useCallback(async () => {
    setMarkingAll(true);
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      refetchUnread();
      refetchList();
    } finally {
      setMarkingAll(false);
    }
  }, [refetchUnread, refetchList]);

  const items = notifications ?? [];

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative text-gray-400 hover:text-white transition-colors p-1"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-medium px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-[480px] bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                className="text-xs text-nexus-400 hover:text-nexus-300 transition-colors disabled:opacity-50"
              >
                {markingAll ? 'Marking...' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-700 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {items.map(n => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-l-2 ${PRIORITY_STYLES[n.priority] ?? PRIORITY_STYLES.low} ${
                      n.read ? 'opacity-60' : ''
                    } transition-opacity`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.read ? 'bg-gray-600' : PRIORITY_DOT[n.priority] ?? 'bg-blue-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm ${n.read ? 'text-gray-400' : 'text-white font-medium'}`}>{n.title}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-gray-600">{formatTimeAgo(n.createdAt)}</span>
                          {!n.read && (
                            <button
                              onClick={() => markRead(n.id)}
                              disabled={markingRead[n.id]}
                              className="text-[10px] text-nexus-400 hover:text-nexus-300 transition-colors disabled:opacity-50"
                            >
                              {markingRead[n.id] ? 'Marking...' : 'Mark read'}
                            </button>
                          )}
                          {n.actionUrl && (
                            <a href={n.actionUrl} onClick={() => setOpen(false)} className="text-[10px] text-nexus-400 hover:text-nexus-300 transition-colors">
                              View
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

          {/* Footer */}
          <div className="border-t border-gray-700 px-4 py-2">
            <a href="/dashboard/notifications" className="text-xs text-nexus-400 hover:text-nexus-300 transition-colors block text-center">
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
