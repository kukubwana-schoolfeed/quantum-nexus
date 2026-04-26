'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import ProgressBar from '@/components/shared/ProgressBar';

const TENANT_ID = 't1';

export default function PerformanceCharts(): JSX.Element {
  const chart = MOCK_DATA.analyticsDashboard.getChart(TENANT_ID, 'performance', '7d');
  const overview = MOCK_DATA.analyticsDashboard.getOverview(TENANT_ID);
  const maxValue = Math.max(...chart.data.map((d: { label: string; value: number }) => d.value));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Published Today" value={overview.postsPublishedToday} />
        <StatCard label="Scheduled 24h" value={overview.postsScheduled24h} />
        <StatCard label="Tasks Complete" value={`${overview.tasksTodayComplete}/${overview.tasksTodayTotal}`} />
        <StatCard label="Health Score" value={overview.latestHealthScore} trend={overview.healthTrend as 'up' | 'down' | 'stable'} />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-3">Performance — Last 7 Days</h3>
        <div className="space-y-2">
          {chart.data.map((item: { label: string; value: number }) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-8">{item.label}</span>
              <ProgressBar value={item.value} max={maxValue} showPercent={false} />
              <span className="text-xs text-gray-300 w-16 text-right">K{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
