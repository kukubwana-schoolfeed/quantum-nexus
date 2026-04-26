'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';

const TENANT_ID = 't1';

export default function LeadTracker(): JSX.Element {
  const overview = MOCK_DATA.analyticsDashboard.getOverview(TENANT_ID);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="New Customers Today" value={overview.newCustomersToday} trend="up" trendValue="+2" />
        <StatCard label="Total Indexed Pages" value={overview.totalIndexedPages} />
        <StatCard label="Pages Indexed Today" value={overview.pagesIndexedToday} trend="up" trendValue="+1" />
      </div>
    </div>
  );
}
