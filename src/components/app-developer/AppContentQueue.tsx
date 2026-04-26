'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';

export default function AppContentQueue(): JSX.Element {
  const posts = MOCK_DATA.contentMachine.getPosts('t1', {}).filter(
    (p) => p.status === 'draft'
  );

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Content Queue</h3>
      {posts.length === 0 ? (
        <p className="text-xs text-gray-500">No drafts in queue</p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between p-2 rounded bg-gray-900 border border-gray-700">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-white truncate">
                  {post.caption ?? post.blogContent?.slice(0, 60) ?? post.contentType}
                </p>
                <p className="text-xs text-gray-500">{post.contentType}</p>
              </div>
              <StatusBadge status={post.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
