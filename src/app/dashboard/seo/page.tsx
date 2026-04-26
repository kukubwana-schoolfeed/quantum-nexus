'use client';

import { useApi } from '@/lib/hooks/useApi';
import type { SeoOverviewDTO, KeywordStrategyDTO } from '@/lib/api/schema';
import ApiError from '@/components/shared/ApiError';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonGrid, SkeletonTable } from '@/components/shared/Skeleton';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import ProgressBar from '@/components/shared/ProgressBar';

/**
 * SEOEngine — Full SEO automation dashboard page.
 * Module: seo-engine | Phase: 2 (API integration)
 */

export default function SEOEnginePage(): JSX.Element {
  const { data: seoOverview, loading: overviewLoading, error: overviewError, refetch: refetchOverview } = useApi<SeoOverviewDTO>('/api/seo/overview');
  const { data: keywords, loading: keywordsLoading, error: keywordsError, refetch: refetchKeywords } = useApi<KeywordStrategyDTO>('/api/seo/keywords');

  if (overviewLoading || keywordsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">SEO Engine</h1>
          <p className="text-sm text-gray-400 mt-1">Loading...</p>
        </div>
        <SkeletonGrid count={4} />
        <SkeletonTable />
      </div>
    );
  }

  if (overviewError || keywordsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">SEO Engine</h1>
        </div>
        <ApiError message={overviewError ?? keywordsError ?? 'Failed to load data'} onRetry={() => { refetchOverview(); refetchKeywords(); }} />
      </div>
    );
  }

  if (!seoOverview) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">SEO Engine</h1>
        </div>
        <EmptyState title="No SEO data available" description="SEO overview data will appear once your site is indexed." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">SEO Engine</h1>
        <p className="text-sm text-gray-400 mt-1">Full SEO automation — keywords, rankings, indexing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Domain Authority" value={seoOverview.domainAuthority} trend="up" trendValue="+3" />
        <StatCard label="Indexed Pages" value={seoOverview.indexedPages} trend="up" trendValue="+5" />
        <StatCard label="Backlinks" value={seoOverview.backlinks} trend="up" trendValue="+2" />
        <StatCard label="Keywords Tracked" value={keywords?.keywords.length ?? 0} />
      </div>

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h2 className="text-sm font-semibold text-white mb-3">Keyword Strategy</h2>
        {keywords && keywords.keywords.length > 0 ? (
          <DataTable
            columns={[
              { header: 'Keyword', key: 'keyword' },
              { header: 'Volume', key: 'volume' },
              { header: 'Difficulty', key: 'difficulty', render: (v) => <ProgressBar value={v as number} max={100} showPercent={false} /> },
              { header: 'Current Rank', key: 'currentRank', render: (v) => <span className="text-nexus-400 font-medium">#{v as number}</span> },
            ]}
            data={keywords.keywords as unknown as Record<string, unknown>[]}
          />
        ) : (
          <EmptyState title="No keywords tracked" description="Add keywords to start tracking your SEO strategy." />
        )}
      </div>
    </div>
  );
}
