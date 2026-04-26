'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';

const schedule = MOCK_DATA.seoDominationEngine.getDailyBlogSchedule('t1');

export default function BlogPublishQueue(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Posts Today" value={schedule.posts.length} icon="BLOG" />
        <StatCard label="Keywords Targeted" value={new Set(schedule.posts.map(p => p.keyword)).size} icon="KEY" />
      </div>
      <div className="space-y-3">
        {schedule.posts.map((post, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">{post.keyword}</p>
              <p className="text-xs text-gray-400 mt-1">Scheduled: {post.time}</p>
            </div>
            <StatusBadge status={post.postId ? 'published' : 'scheduled'} />
          </div>
        ))}
      </div>
    </div>
  );
}
