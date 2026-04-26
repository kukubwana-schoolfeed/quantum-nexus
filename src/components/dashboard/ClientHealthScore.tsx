'use client';

import { useApi } from '@/lib/hooks/useApi';
import StatusBadge from '@/components/shared/StatusBadge';
import ProgressBar from '@/components/shared/ProgressBar';
import type { ClientHealthScoreDTO } from '@/lib/api/schema';

export default function ClientHealthScore(): JSX.Element {
  const { data: health } = useApi<ClientHealthScoreDTO>('/api/health-score');

  if (!health) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 animate-pulse">
        <h3 className="text-xs text-gray-400 uppercase tracking-wider">Client Health Score</h3>
        <div className="mt-2 h-6 bg-gray-700 rounded w-24" />
        <div className="mt-3 space-y-1">
          <div className="h-3 bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-700 rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-xs text-gray-400 uppercase tracking-wider">Client Health Score</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">{health.totalScore}</span>
        <span className="text-xs text-gray-500">/ 100</span>
        <StatusBadge status={health.trend} />
      </div>
      <div className="mt-3 space-y-1">
        <ProgressBar label="SEO" value={health.seoScore} showPercent />
        <ProgressBar label="Content" value={health.contentScore} showPercent />
        <ProgressBar label="Reviews" value={health.reviewScore} showPercent />
        <ProgressBar label="Social" value={health.socialScore} showPercent />
        <ProgressBar label="Entity" value={health.entityScore} showPercent />
      </div>
      <div className="mt-3 border-t border-gray-700 pt-2">
        <p className="text-xs text-gray-500 mb-1">Top Recommendations</p>
        {health.topRecommendations.map((rec, idx) => (
          <p key={idx} className="text-xs text-gray-300">
            {idx + 1}. {rec}
          </p>
        ))}
      </div>
    </div>
  );
}
