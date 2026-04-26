'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';

const posts = MOCK_DATA.communityModule.getPosts('t1', {});
const comments = MOCK_DATA.communityModule.getComments('t1', 'comm1', {});

export default function CommunityFeed(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Posts" value={posts.length} icon="POST" />
        <StatCard label="Total Likes" value={posts.reduce((s, p) => s + p.likesCount, 0)} icon="LIKE" />
        <StatCard label="Total Comments" value={posts.reduce((s, p) => s + p.commentsCount, 0)} icon="CMNT" />
      </div>
      <div className="space-y-3">
        {posts.map(post => (
          <div key={post.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Author: {post.authorId}</span>
              <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-gray-200">{post.content}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span>{post.likesCount} likes</span>
              <span>{post.commentsCount} comments</span>
            </div>
            {comments.length > 0 && (
              <div className="mt-3 pl-4 border-l border-gray-700 space-y-2">
                {comments.map(c => (
                  <div key={c.id}>
                    <span className="text-xs text-gray-500">{c.authorId}: </span>
                    <span className="text-xs text-gray-300">{c.content}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
