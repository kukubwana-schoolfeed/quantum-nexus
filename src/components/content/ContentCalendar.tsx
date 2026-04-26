'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';

const TENANT_ID = 't1';

export default function ContentCalendar(): JSX.Element {
  const posts = MOCK_DATA.contentMachine.getPosts(TENANT_ID, {});

  const scheduled = posts.filter((p: { status: string }) => p.status === 'scheduled' || p.status === 'published');
  const sorted = [...scheduled].sort((a: { scheduledFor: string | null; publishedAt: string | null }, b: { scheduledFor: string | null; publishedAt: string | null }) => {
    const dateA = a.scheduledFor ?? a.publishedAt ?? '';
    const dateB = b.scheduledFor ?? b.publishedAt ?? '';
    return dateA.localeCompare(dateB);
  });

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Content Calendar</h3>
      <div className="space-y-2">
        {sorted.map((post: { id: string; status: string; contentType: string; platform: string | null; scheduledFor: string | null; publishedAt: string | null; caption: string | null; blogContent: string | null }) => {
          const date = post.scheduledFor ?? post.publishedAt;
          const label = post.caption ? post.caption.slice(0, 60) : post.blogContent ? post.blogContent.slice(0, 60) : '—';
          return (
            <div key={post.id} className="flex items-center gap-3 bg-gray-900 rounded p-2 text-xs">
              <span className="text-gray-500 w-24 shrink-0">{date ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}</span>
              <StatusBadge status={post.status} />
              <span className="text-gray-300 truncate flex-1">{label}</span>
              <span className="text-gray-500 shrink-0">{post.platform ?? post.contentType}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
