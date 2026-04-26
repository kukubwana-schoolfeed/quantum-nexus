'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import ProgressBar from '@/components/shared/ProgressBar';

export default function ASOPerformance(): JSX.Element {
  const aso = MOCK_DATA.appStoreOptimizer.getASOScore('t1', 'ap1');

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="mb-4">
        <StatCard label="ASO Score" value={aso.score} sublabel="out of 100" />
      </div>
      <ProgressBar value={aso.score} label="Overall Score" />
      {aso.suggestions.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-medium text-gray-400 mb-2">Suggestions</h4>
          <ul className="space-y-1">
            {aso.suggestions.map((s, i) => (
              <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                <span className="text-yellow-400">-</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
