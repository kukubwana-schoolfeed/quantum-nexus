'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';

export default function AudienceIntelligence(): JSX.Element {
  const insights = MOCK_DATA.facelessAudienceIntelligence.getInsights('t1');
  const growth = MOCK_DATA.facelessAudienceIntelligence.getGrowthData('t1');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Subscribers" value={growth.subscribers.toLocaleString()} trend="up" trendValue={`+${growth.growthRate}%`} />
        <StatCard label="Total Views" value={growth.views.toLocaleString()} />
        <StatCard label="Avg View Duration" value={`${insights.avgViewDuration}s`} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Top Demo" value={insights.topDemographic} />
        <StatCard label="Peak Day" value={insights.engagementPeakDay} />
        <StatCard label="Best Post Time" value={insights.suggestedPostTime} />
      </div>
    </div>
  );
}
