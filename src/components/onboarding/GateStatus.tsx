'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';

export default function GateStatus(): JSX.Element {
  const score = MOCK_DATA.completenessScoring.getScore('t1');

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Gate Status</h3>
      <div className="space-y-2">
        {Object.entries(score.unlocks).map(([feature, unlocked]) => (
          <div key={feature} className="flex items-center justify-between p-2 rounded bg-gray-900 border border-gray-700">
            <span className="text-xs text-gray-300">{feature.replace(/_/g, ' ')}</span>
            <StatusBadge status={unlocked ? 'active' : 'held'} />
          </div>
        ))}
      </div>
    </div>
  );
}
