'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';
import StatCard from '@/components/shared/StatCard';
import ProgressBar from '@/components/shared/ProgressBar';

export default function ClientHealthOverview(): JSX.Element {
  const score = MOCK_DATA.clientHealthScore.getScore('t1');

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="mb-4">
        <StatCard
          label="Total Health Score"
          value={score.totalScore}
          sublabel={`Trend: ${score.trend}`}
          trend={score.trend === 'improving' ? 'up' : score.trend === 'declining' ? 'down' : 'stable'}
        />
      </div>
      <div className="space-y-2">
        <ProgressBar value={score.seoScore} label="SEO" />
        <ProgressBar value={score.contentScore} label="Content" />
        <ProgressBar value={score.reviewScore} label="Reviews" />
        <ProgressBar value={score.socialScore} label="Social" />
        <ProgressBar value={score.entityScore} label="Entity" />
      </div>
      {score.topRecommendations.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-medium text-gray-400 mb-2">Top Recommendations</h4>
          <ul className="space-y-1">
            {score.topRecommendations.map((r, i) => (
              <li key={i} className="text-xs text-gray-300">
                <span className="text-yellow-400 mr-1">-</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
