'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';

export default function ContentPerformance(): JSX.Element {
  const posts = MOCK_DATA.contentMachine.getPosts('t1', {});
  const published = posts.filter((p) => p.status === 'published');
  const totalImpressions = published.reduce((sum, p) => sum + (p.impressions ?? 0), 0);
  const totalEngagement = published.reduce((sum, p) => sum + (p.engagement ?? 0), 0);
  const avgRate = published.length
    ? (published.reduce((sum, p) => sum + (p.engagementRate ?? 0), 0) / published.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Published Posts" value={published.length} />
        <StatCard label="Total Impressions" value={totalImpressions.toLocaleString()} />
        <StatCard label="Total Engagement" value={totalEngagement.toLocaleString()} />
        <StatCard label="Avg Engagement Rate" value={`${avgRate}%`} />
      </div>
    </div>
  );
}
