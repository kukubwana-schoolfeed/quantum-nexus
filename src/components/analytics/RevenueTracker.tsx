'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import ProgressBar from '@/components/shared/ProgressBar';

const TENANT_ID = 't1';

export default function RevenueTracker(): JSX.Element {
  const overview = MOCK_DATA.analyticsDashboard.getOverview(TENANT_ID);
  const chart = MOCK_DATA.analyticsDashboard.getChart(TENANT_ID, 'performance', '7d');
  const maxValue = Math.max(...chart.data.map((d: { label: string; value: number }) => d.value));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Revenue Today" value={`K${overview.revenueToday.toLocaleString()}`} />
        <StatCard label="Revenue This Week" value={`K${overview.revenueThisWeek.toLocaleString()}`} />
        <StatCard label="Revenue This Month" value={`K${(overview.revenueThisMonth / 1000).toFixed(0)}K`} />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-3">Revenue Trend — Last 7 Days</h3>
        <div className="space-y-2">
          {chart.data.map((item: { label: string; value: number }) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-8">{item.label}</span>
              <ProgressBar value={item.value} max={maxValue} showPercent={false} colorClass="bg-blue-500" />
              <span className="text-xs text-gray-300 w-16 text-right">K{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
