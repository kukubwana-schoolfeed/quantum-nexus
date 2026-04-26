'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';

export default function PlatformHealth(): JSX.Element {
  const health = MOCK_DATA.platformHealthMonitor.getHealth('t1');

  return (
    <div className="space-y-4">
      <StatCard label="Uptime" value={`${health.uptime}%`} trend="stable" trendValue="stable" />
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-3">Infrastructure</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex items-center justify-between p-2 rounded bg-gray-900 border border-gray-700">
            <span className="text-xs text-gray-400">Redis</span>
            <StatusBadge status={health.redis} />
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-gray-900 border border-gray-700">
            <span className="text-xs text-gray-400">Supabase</span>
            <StatusBadge status={health.supabase} />
          </div>
          {Object.entries(health.workers).map(([name, status]) => (
            <div key={name} className="flex items-center justify-between p-2 rounded bg-gray-900 border border-gray-700">
              <span className="text-xs text-gray-400">{name}</span>
              <StatusBadge status={String(status)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
