'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';

const TENANT_ID = 't1';

export default function CommentFeed(): JSX.Element {
  const posts = MOCK_DATA.socialMediaLayer.getPostHistory(TENANT_ID, {});
  const totalImpressions = posts.reduce((sum: number, p: { impressions: number }) => sum + p.impressions, 0);
  const totalEngagement = posts.reduce((sum: number, p: { engagement: number }) => sum + p.engagement, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Total Impressions" value={totalImpressions.toLocaleString()} />
        <StatCard label="Total Engagement" value={totalEngagement.toLocaleString()} />
        <StatCard label="Published Posts" value={posts.length} />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-3">Engagement Feed</h3>
        <div className="space-y-2">
          {posts.map((post: { id: string; platform: string | null; caption: string | null; impressions: number; engagement: number; engagementRate: number | null; publishedAt: string | null }) => (
            <div key={post.id} className="bg-gray-900 rounded p-2 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status="published" />
                <span className="text-gray-400">{post.platform ?? 'blog'}</span>
                <span className="text-gray-500 ml-auto">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}</span>
              </div>
              <p className="text-gray-300 truncate">{post.caption ? post.caption.slice(0, 80) : 'Blog post'}</p>
              <div className="flex gap-3 mt-1 text-gray-500">
                <span>{post.impressions.toLocaleString()} views</span>
                <span>{post.engagement} engaged</span>
                {post.engagementRate != null && <span>{post.engagementRate}% rate</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
