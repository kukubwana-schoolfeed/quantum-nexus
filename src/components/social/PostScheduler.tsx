'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';

const TENANT_ID = 't1';

export default function PostScheduler(): JSX.Element {
  const posts = MOCK_DATA.contentMachine.getPosts(TENANT_ID, {});
  const platforms = MOCK_DATA.socialMediaLayer.getConnectedPlatforms(TENANT_ID);
  const scheduled = posts.filter((p: { status: string }) => p.status === 'scheduled');

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-3">Connected Platforms</h3>
        <div className="flex flex-wrap gap-2">
          {platforms.map((p: { platform: string; connected: boolean; username: string | null }) => (
            <StatusBadge key={p.platform} status={p.connected ? 'live' : 'draft'} />
          ))}
          {platforms.filter((p: { connected: boolean }) => p.connected).map((p: { platform: string; username: string | null }) => (
            <span key={p.platform} className="text-xs text-gray-400">{p.platform}{p.username ? ` (${p.username})` : ''}</span>
          ))}
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-3">Scheduled Posts</h3>
        <div className="space-y-2">
          {scheduled.length === 0 && <p className="text-xs text-gray-500">No scheduled posts</p>}
          {scheduled.map((post: { id: string; platform: string | null; contentType: string; scheduledFor: string | null; caption: string | null }) => (
            <div key={post.id} className="flex items-center gap-3 bg-gray-900 rounded p-2 text-xs">
              <StatusBadge status="scheduled" />
              <span className="text-gray-300 truncate flex-1">{post.caption ? post.caption.slice(0, 60) : post.contentType}</span>
              <span className="text-gray-500 shrink-0">{post.platform ?? '—'}</span>
              <span className="text-gray-500 shrink-0">{post.scheduledFor ? new Date(post.scheduledFor).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
