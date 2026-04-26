'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import ProgressBar from '@/components/shared/ProgressBar';

export default function CompletenessBar(): JSX.Element {
  const score = MOCK_DATA.completenessScoring.getScore('t1');

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-white mb-3">Completeness</h3>
      <ProgressBar value={score.overall} label="Overall" />
      <div className="mt-4 space-y-2">
        {Object.entries(score.sections).map(([key, val]) => (
          <ProgressBar key={key} value={val as number} label={key.replace(/_/g, ' ')} />
        ))}
      </div>
    </div>
  );
}
