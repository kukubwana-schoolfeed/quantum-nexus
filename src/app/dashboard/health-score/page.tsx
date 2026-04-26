'use client';

import { useApi } from '@/lib/hooks/useApi';
import ApiError from '@/components/shared/ApiError';
import { SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ProgressBar from '@/components/shared/ProgressBar';
import EmptyState from '@/components/shared/EmptyState';
import type { ClientHealthScoreDTO } from '@/lib/api/schema';

const SCORE_CATEGORIES = [
  { key: 'seoScore', label: 'SEO', icon: 'SEO', description: 'Search visibility, indexed pages, domain authority' },
  { key: 'contentScore', label: 'Content', icon: 'CON', description: 'Publishing frequency, algorithm scores, variety' },
  { key: 'reviewScore', label: 'Reviews', icon: 'REV', description: 'Review count, average rating, response rate' },
  { key: 'socialScore', label: 'Social', icon: 'SOC', description: 'Follower growth, engagement rate, posting consistency' },
  { key: 'entityScore', label: 'Entity', icon: 'ENT', description: 'NAP consistency, directory listings, GBP completeness' },
] as const;

function scoreColor(value: number): string {
  if (value >= 70) return 'text-green-400';
  if (value >= 40) return 'text-yellow-400';
  return 'text-red-400';
}

function scoreBarColor(value: number): string {
  if (value >= 70) return 'bg-green-500';
  if (value >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

export default function HealthScorePage(): JSX.Element {
  const { data: health, loading, error, refetch } = useApi<ClientHealthScoreDTO>('/api/health-score');

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Health Score</h1>
        <SkeletonPanel />
        <SkeletonPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Health Score</h1>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!health) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Health Score</h1>
        <EmptyState title="No health score data" description="Health score will appear once your account is active." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Health Score</h1>
        <p className="text-gray-400 text-sm mt-1">Composite score measuring your business's digital health across five pillars.</p>
      </div>

      {/* Overall Score */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Overall Score</h2>
            <p className="text-sm text-gray-400 mt-0.5">Weighted composite of all health pillars</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-4xl font-bold ${scoreColor(health.totalScore)}`}>{health.totalScore}</span>
            <span className="text-lg text-gray-500">/ 100</span>
            <StatusBadge status={health.trend} />
          </div>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${scoreBarColor(health.totalScore)}`}
            style={{ width: `${health.totalScore}%` }}
          />
        </div>
      </div>

      {/* Pillar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {SCORE_CATEGORIES.map(cat => {
          const value = health[cat.key] as number;
          return (
            <div key={cat.key} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider">{cat.label}</span>
                <span className={`text-lg font-bold ${scoreColor(value)}`}>{value}</span>
              </div>
              <ProgressBar value={value} colorClass={scoreBarColor(value)} />
              <p className="text-[10px] text-gray-600 mt-2">{cat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Score Breakdown</h2>
        <div className="space-y-4">
          {SCORE_CATEGORIES.map(cat => {
            const value = health[cat.key] as number;
            return (
              <div key={cat.key} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-300 font-medium">{cat.label}</div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${scoreBarColor(value)}`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right">
                  <span className={`text-sm font-semibold ${scoreColor(value)}`}>{value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Recommendations */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Top Recommendations</h2>
        {health.topRecommendations.length === 0 ? (
          <EmptyState title="No recommendations" description="Your account is performing well across all pillars." />
        ) : (
          <div className="space-y-3">
            {health.topRecommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
                <span className="w-6 h-6 bg-nexus-500/20 text-nexus-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </span>
                <p className="text-sm text-gray-300">{rec}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Overall"
          value={health.totalScore}
          icon="H"
          trend={health.trend === 'improving' ? 'up' : health.trend === 'declining' ? 'down' : 'stable'}
          sublabel="out of 100"
        />
        <StatCard
          label="Strongest Pillar"
          value={SCORE_CATEGORIES.reduce((best, cat) => (health[cat.key] as number) > (health[best.key] as number) ? cat : best, SCORE_CATEGORIES[0]).label}
          icon="S"
          sublabel={`Score: ${Math.max(...SCORE_CATEGORIES.map(c => health[c.key] as number))}`}
        />
        <StatCard
          label="Weakest Pillar"
          value={SCORE_CATEGORIES.reduce((worst, cat) => (health[cat.key] as number) < (health[worst.key] as number) ? cat : worst, SCORE_CATEGORIES[0]).label}
          icon="W"
          sublabel={`Score: ${Math.min(...SCORE_CATEGORIES.map(c => health[c.key] as number))}`}
        />
      </div>
    </div>
  );
}
