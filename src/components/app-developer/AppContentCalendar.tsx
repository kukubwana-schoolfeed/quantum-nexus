'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';

export default function AppContentCalendar(): JSX.Element {
  const posts = MOCK_DATA.contentMachine.getPosts('t1', {});

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Content Calendar</h3>
      <div className="space-y-2">
        {posts.map((post) => (
          <div key={post.id} className="flex items-center justify-between p-2 rounded bg-gray-900 border border-gray-700">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white truncate">
                {post.caption ?? post.blogContent?.slice(0, 60) ?? post.contentType}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {post.platform ?? 'blog'} &middot;{' '}
                {post.scheduledFor
                  ? new Date(post.scheduledFor).toLocaleDateString()
                  : post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString()
                    : 'Unscheduled'}
              </p>
            </div>
            <StatusBadge status={post.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
