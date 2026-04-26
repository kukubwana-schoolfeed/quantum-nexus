'use client';

/**
 * Keyword Cannibalisation — Detect and resolve keyword conflicts
 * Module: keywordCannibalisationDetector
 * Phase: 2
 */

import { useApi } from '@/lib/hooks/useApi';
import type { CannibalisationReportDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import { SkeletonGrid, SkeletonPanel } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import EmptyState from '@/components/shared/EmptyState';

interface CannibalisationData {
  reports: CannibalisationReportDTO[];
  scanResult: { conflictsFound: number };
}

export default function Page(): JSX.Element {
  const { data, loading, error, refetch } = useApi<CannibalisationData>('/api/seo-domination/cannibalisation');
  const reports = data?.reports ?? [];
  const scanResult = data?.scanResult ?? { conflictsFound: 0 };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Keyword Cannibalisation</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={3} />
        <SkeletonPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Keyword Cannibalisation</h1>
        </div>
        <ApiError message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Keyword Cannibalisation</h1>
        <p className="text-sm text-gray-400 mt-1">
          Detect and resolve keyword conflicts across your content
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Reports"
          value={reports.length}
          icon="RP"
          sublabel="cannibalisation reports"
        />
        <StatCard
          label="Last Scan Conflicts"
          value={scanResult.conflictsFound}
          icon="CF"
          sublabel="conflicts detected"
        />
        <StatCard
          label="Status"
          value={reports.length === 0 ? 'Clean' : 'Action Needed'}
          icon="ST"
          sublabel={reports.length === 0 ? 'No conflicts found' : 'Review conflicts'}
        />
      </div>

      {/* Reports List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Cannibalisation Reports</h2>
        {reports.length === 0 ? (
          <EmptyState
            title="No cannibalisation reports"
            description="Run a scan to detect keyword conflicts across your pages. Conflicting pages compete for the same search terms, reducing your overall ranking power."
          />
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{r.conflictingKeyword}</span>
                  <span className="text-xs text-gray-500">
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Run Scan
        </button>
      </div>
    </div>
  );
}
