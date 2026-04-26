'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';

const trends = MOCK_DATA.trendIntelligenceEngine.getTrends('t1', {});

export default function TrendCalendar(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Tracked Trends" value={trends.length} icon="CAL" />
        <StatCard label="Active" value={trends.filter(t => t.status === 'ACTIVE').length} icon="ACT" />
      </div>
      <div className="space-y-2">
        {trends.map(trend => (
          <div key={trend.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <div>
                <p className="text-sm text-white">{trend.trendText}</p>
                <p className="text-xs text-gray-500">
                  Detected: {new Date(trend.detectedAt).toLocaleDateString()}
                  {trend.platform && ` | ${trend.platform}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Score: {trend.score}</span>
              <StatusBadge status={trend.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
