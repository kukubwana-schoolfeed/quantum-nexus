'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';

export default function AppAnalyticsDashboard(): JSX.Element {
  const overview = MOCK_DATA.appAnalyticsDashboard.getOverview('t1');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Downloads" value={overview.downloads.toLocaleString()} />
        <StatCard label="Active Users" value={overview.activeUsers.toLocaleString()} />
        <StatCard label="Revenue" value={`K${overview.revenue.toLocaleString()}`} />
        <StatCard label="Crash Rate" value={`${overview.crashRate}%`} trend="stable" />
      </div>
    </div>
  );
}
