'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';

export default function RevenueAnalytics(): JSX.Element {
  const revenue = MOCK_DATA.appPaymentIntelligence.getRevenue('t1');
  const churn = MOCK_DATA.appPaymentIntelligence.getChurnRate('t1');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Revenue Today" value={`K${revenue.today.toLocaleString()}`} />
        <StatCard label="Revenue This Week" value={`K${revenue.thisWeek.toLocaleString()}`} />
        <StatCard label="Revenue This Month" value={`K${revenue.thisMonth.toLocaleString()}`} />
        <StatCard
          label="Churn Rate"
          value={`${churn.rate}%`}
          trend={churn.trend === 'improving' ? 'down' : 'up'}
          trendValue={churn.trend}
        />
      </div>
    </div>
  );
}
