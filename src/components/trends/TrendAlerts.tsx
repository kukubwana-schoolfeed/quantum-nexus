'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';

const trends = MOCK_DATA.trendIntelligenceEngine.getTrends('t1', {});
const activeTrends = trends.filter(t => t.status === 'ACTIVE' || t.status === 'NEW');

export default function TrendAlerts(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Active Alerts" value={activeTrends.length} icon="ALERT" />
        <StatCard label="Total Trends" value={trends.length} icon="TREND" />
        <StatCard label="Used in Content" value={trends.reduce((s, t) => s + t.timesUsedInContent, 0)} icon="USED" />
      </div>
      <div className="space-y-3">
        {activeTrends.map(trend => (
          <div key={trend.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-white">{trend.trendText}</p>
              <StatusBadge status={trend.status} />
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>Score: {trend.score}</span>
              {trend.platform && <span>Platform: {trend.platform}</span>}
              <span>Type: {trend.trendType}</span>
              <span>Used: {trend.timesUsedInContent}x</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
