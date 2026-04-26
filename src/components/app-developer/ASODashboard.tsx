'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';

const TENANT = 'tenant_1';
const APP_ID = 'ap1';

export default function ASODashboard(): JSX.Element {
  const aso = MOCK_DATA.appStoreOptimizer.getASOScore(TENANT, APP_ID);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">ASO Dashboard</h3>
      <StatCard label="ASO Score" value={aso.score} sublabel="out of 100" icon="🎯" />
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Suggestions</p>
        <ul className="space-y-1">
          {aso.suggestions.map((s, i) => (
            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-yellow-400 mt-0.5">•</span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
